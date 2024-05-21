import json
import os
from datetime import datetime
import time
from pymavlink import mavutil

# 現在のスクリプトのディレクトリを基準にパスを設定
script_dir = os.path.dirname(os.path.abspath(__file__))
tasks_file_path = os.path.join(script_dir, '../tasks.json')
missions_dir = os.path.join(script_dir, '../missions')

def load_tasks():
    with open(tasks_file_path, 'r') as file:
        return json.load(file)

def save_tasks(tasks):
    with open(tasks_file_path, 'w') as file:
        json.dump(tasks, file, indent=2)

def get_current_time():
    return datetime.now().strftime('%Y-%m-%d %H:%M:00')

def connect_vehicle():
    # シリアルポートやUDP/TCPポートを指定して接続します
    connection_string = 'tcp:127.0.0.1:5760'  # 適宜変更してください
    vehicle = mavutil.mavlink_connection(connection_string)
    vehicle.wait_heartbeat()
    return vehicle

def upload_mission(vehicle, mission_file_path):
    with open(mission_file_path, 'r') as file:
        mission_data = file.readlines()

    mission_items = []
    for line in mission_data:
        if line.startswith('QGC WPL 110'):
            continue
        parts = line.split('\t')
        command = int(parts[3])
        param1 = float(parts[4])
        param2 = float(parts[5])
        param3 = float(parts[6])
        param4 = float(parts[7])
        x = float(parts[8])
        y = float(parts[9])
        z = float(parts[10])
        mission_items.append(
            vehicle.mav.mission_item_encode(
                0, 0,  # target system, target component
                len(mission_items),  # sequence
                0,  # frame
                command,  # command
                0,  # current - set to 0
                1,  # auto-continue
                param1, param2, param3, param4,
                x, y, z
            )
        )

    # Clear existing mission
    vehicle.waypoint_clear_all_send()
    # Send mission items
    for item in mission_items:
        vehicle.mav.send(item)
        time.sleep(0.1)

    # Send mission count
    vehicle.mav.mission_count_send(0, len(mission_items))
    # Wait for ack
    while True:
        msg = vehicle.recv_match(type=['MISSION_ACK'], blocking=True)
        if msg:
            break
    return mission_items[-1]  # Return the last waypoint for monitoring

def arm_and_set_auto_mode(vehicle):
    # Check if the vehicle is already in auto mode
    vehicle.set_mode_auto()
    # Arm the vehicle
    vehicle.ardupilot_arm()
    return True

def monitor_mission(vehicle, last_waypoint):
    target_lat = last_waypoint.x
    target_lon = last_waypoint.y

    def distance(lat1, lon1, lat2, lon2):
        from math import radians, cos, sin, sqrt, atan2
        R = 6371000  # radius of Earth in meters
        phi1 = radians(lat1)
        phi2 = radians(lat2)
        delta_phi = radians(lat2 - lat1)
        delta_lambda = radians(lon2 - lon1)
        a = sin(delta_phi / 2) ** 2 + cos(phi1) * cos(phi2) * sin(delta_lambda / 2) ** 2
        c = 2 * atan2(sqrt(a), sqrt(1 - a))
        return R * c

    while True:
        msg = vehicle.recv_match(type=['GLOBAL_POSITION_INT'], blocking=True)
        current_lat = msg.lat / 1e7
        current_lon = msg.lon / 1e7
        if distance(current_lat, current_lon, target_lat, target_lon) <= 1:
            break
        time.sleep(1)
    return True

def process_task(task):
    current_time = get_current_time()
    if task['startTime'] == current_time:
        vehicle = connect_vehicle()

        # Check if the vehicle is already in auto mode
        mode = vehicle.flightmode
        if mode == 'AUTO':
            print(f"Vehicle is already in AUTO mode. Skipping task {task['name']}.")
            task['status'] = 'skipped'
            save_tasks(load_tasks())
            return

        mission_file_path = os.path.join(missions_dir, f"{task['planName']}.waypoints")

        if not os.path.exists(mission_file_path):
            print(f"Mission file {mission_file_path} not found.")
            task['status'] = 'failed'
            save_tasks(load_tasks())
            return

        last_waypoint = upload_mission(vehicle, mission_file_path)
        if not last_waypoint:
            print(f"Failed to upload mission for task {task['name']}.")
            task['status'] = 'failed'
            save_tasks(load_tasks())
            return

        armed_and_auto = arm_and_set_auto_mode(vehicle)
        if not armed_and_auto:
            print(f"Failed to arm and set auto mode for task {task['name']}.")
            task['status'] = 'failed'
            save_tasks(load_tasks())
            return

        task['executionStartTime'] = datetime.now().isoformat()
        mission_success = monitor_mission(vehicle, last_waypoint)
        task['executionEndTime'] = datetime.now().isoformat()
        task['status'] = 'success' if mission_success else 'failed'
        save_tasks(load_tasks())
        print(f"Task {task['name']} processed with status {task['status']}.")

if __name__ == "__main__":
    tasks = load_tasks()
    for task in tasks:
        process_task(task)
