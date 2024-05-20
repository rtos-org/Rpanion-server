import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import moment from 'moment-timezone';
import {
  DataGrid,
  GridActionsCellItem
} from '@mui/x-data-grid'
import Stack from '@mui/material/Stack';
import { MdClose, MdEditCalendar } from "react-icons/md";
import { GrSchedulePlay } from "react-icons/gr";

import basePage from './basePage.js';

import './css/styles.css';

class SchedulePage extends basePage {
  constructor(props, useSocketIO = true) {
    super(props, useSocketIO);
    this.state = {
      telemetryStatus: this.props.telemetryStatus,
      loading: true,
      error: null,
      infoMessage: null,
      show: false,
      name: '',
      datetime: '',
      file: null,
      taskHeaders: [
        {
          field: 'actions',
          headerName: '操作',
          align: 'right',
          headerAlign: "center",
          align: "center",
          flex: 1,
          type: 'actions',
          getActions:  (params) => [
            <GridActionsCellItem
              key={params.id}
              icon={<MdClose />}
              label="削除"
              showInMenu={false}
              onClick={() => this.handleDeleteClick(params)}
            />,
            <GridActionsCellItem
              key={params.id}
              icon={<GrSchedulePlay />}
              label="save"
              showInMenu={false}
              onClick={() => this.handleScheduleClick(params)}
            />,
          ],
        },
        {
          field: 'name',
          headerName: '名前',
          width: 150,
          minWidth: 150,
          flex: 1
        },
        {
          field: 'startTime',
          headerName: '起動時間',
          width: 150,
          minWidth: 150,
          flex: 2
        },
        {
          field: 'planName',
          headerName: '自動プラン',
          width: 250,
          flex: 3
        },
      ],
      taskLists: []
    }

    // Socket.io client for reading in analog update values
    this.socket.on('FCStatus', function (msg) {
      this.setState({ FCStatus: msg });
    }.bind(this));
    this.socket.on('reconnect', function () {
      //refresh state
      this.componentDidMount();
    }.bind(this));
  }

  componentDidMount() {
    fetch(`/api/schedule/`).then(response => response.json()).then(state => { this.setState(state); this.loadDone() });
  }

  handleDeleteClick = (params) => {
    console.log(`handleDetailClick:id=${params.id}`)
    fetch('/api/schedule/del', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        schedule: params.id
      })
    }).then(response => response.json()).then(state => { this.setState(state) }).catch(error => {
      this.setState({ waiting: false, error: "Error remove schedule: " + error })
    });
  }

  handleScheduleClick = (params) => {
    console.log(`handleScheduleClick:id=${params.id}`)
  }

  handleShow = () => {
    this.setState({ show: true });
  }

  handleClose = () => {
    this.setState({ show: false });
  }

  handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.waypoints')) {
      this.setState({file: selectedFile});
    } else {
      alert('Only .waypoints files are allowed');
      e.target.value = null;
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    // ここにフォーム送信のロジックを追加します
    console.log('Name:', this.state.name);
    console.log('Datetime:', this.state.datetime);
    console.log('File:', this.state.file);

    const formData = new FormData();
    formData.append('name', this.state.name);
    formData.append('datetime', this.state.datetime);
    formData.append('file', this.state.file);

    fetch('/api/schedule/add', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      this.setState(data)
      this.setState({
        name: '',
        datetime: '',
        file: null,
      })
      this.handleClose();
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }

  handleDateTimeChange = (e) => {
    const date = moment.tz(e.target.value, "Asia/Tokyo");
    this.setState({datetime: date.format("YYYY-MM-DD HH:mm:ss")});
  }

  changeaddrow = event => {
    const value = event.target.value;
    this.setState({ addrow: value });
  }

  NoRowsOverlay = () => {
    return (
      <Stack height="100px" alignItems="center" justifyContent="center">
        No rows in DataGrid
      </Stack>
    );
  }

  renderTitle() {
    return "スケジュール";
  }

  renderContent() {
    return (
      <div style={{ width: '90%' }}>
        <h2>Task List</h2>
        <DataGrid columns={this.state.taskHeaders} rows={this.state.taskLists} density='comfortable' components={ this.NoRowsOverlay } />
        <Button size="sm" disabled={this.state.loading} onClick={this.handleShow}>追加</Button>
        <Modal show={this.state.show} onHide={this.handleClose} backdrop="static">
          <Modal.Header closeButton>
            <Modal.Title>スケジュール追加</Modal.Title>
          </Modal.Header>
          <Form onSubmit={this.handleSubmit}>
            <Modal.Body>
              <Form.Group controlId="formName">
                <Form.Label>名前</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="わかりやすい名称"
                  value={this.state.name}
                  onChange={(e) => this.setState({name: e.target.value})}
                />
              </Form.Group>
              <Form.Group controlId="formDatetime">
                <Form.Label>起動日時 (JST, yyyy-MM-DD hh:mm:ss)</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={this.state.datetime}
                  onChange={this.handleDateTimeChange}
                />
              </Form.Group>
              <Form.Group controlId="formFile">
                <Form.Label>ミッションファイル (.waypoints)</Form.Label>
                <Form.Control
                  type="file"
                  accept=".waypoints"
                  onChange={this.handleFileChange}
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={this.handleClose}>
                閉じる
              </Button>
              <Button variant="primary" type="submit">
                追加
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </div>
    );
  }
}


export default SchedulePage;
