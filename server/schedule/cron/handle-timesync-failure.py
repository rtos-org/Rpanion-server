from pymavlink import mavutil
import time

vehicle = mavutil.mavlink_connection('127.0.0.1:14551', source_component=90, force_connected=True)

vehicle.wait_heartbeat()
print("Heartbeat received from system (system %u component %u)" % (vehicle.target_system, vehicle.target_component))

def play_tone(vehicle, tone_sequence):
    vehicle.mav.play_tune_send(
        vehicle.target_system,
        vehicle.target_component,
        bytes(tone_sequence, "ascii")
    )

# Tone pattern
fail_tone = "O3C16O3C8"

play_tone(vehicle, fail_tone)

time.sleep(3)

vehicle.close()
