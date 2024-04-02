import Button from 'react-bootstrap/Button'
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import React from 'react'
import basePage from './basePage.jsx'

class VPNPage extends basePage {
  constructor (props) {
    super(props)
    this.state = {
      ...this.state,
      statusZerotier: {installed: false, status: false, text: []},
      statusWireguard: {installed: false, status: false, text: []},
      statusSoftether: {installed: false, status: false, online: false, text: []},
      softetherServer: null,
      softetherHub: null,
      softetherUsername: null,
      softetherPassword: null,
      error: null,
      infoMessage: null,
      selectedVPN: { label: 'Softether', value: 'softether' },
      vpnOptions: [{label: 'Softether', value: 'softether' }, { label: 'Zerotier', value: 'zerotier' }, { label: 'Wireguard', value: 'wireguard' }],
      selVPNInstalled: false,
      selVPNActive: false,
      newZerotierKey: "",
      selectedWGFile: '',
      selectedWGFileContents: null
    }
  }

  componentDidMount () {
    // Fetch the vpn information and send to controls
    this.setState({ loading: true });
    Promise.all([
      // fetch(`/api/vpnzerotier`).then(response => response.json()).then(state => { this.setState(state); this.setState({ selVPNInstalled: state.statusZerotier.installed }); this.setState({ selVPNActive: state.statusZerotier.status }) }),
      // fetch(`/api/vpnwireguard`).then(response => response.json()).then(state => { this.setState(state); }),
      // TODO
      fetch(`api/softether`).then(response => response.json()).then(state => {console.log(state); this.setState(state); this.setState({ selVPNInstalled: state.statusSoftether.installed,  selVPNActive: state.statusSoftether.status }); })
    ]).then(this.loadDone());
  }

  handleVPNChange = (event) => {
    let value = event.target.value;
    this.setState({ selectedVPN: value });
    if (value == 'zerotier') {
      this.setState({ selVPNInstalled: this.state.statusZerotier.installed });
      this.setState({ selVPNActive: this.state.statusZerotier.status });
    }
    else if (value == 'wireguard') {
      this.setState({ selVPNInstalled: this.state.statusWireguard.installed });
      this.setState({ selVPNActive: this.state.statusWireguard.status });
    }
    else if (value.value === 'softether') {
      this.setState({ selVPNInstalled: this.state.statusSoftether.installed });
      this.setState({ selVPNActive: this.state.statusSoftether.status });
    }
    else {
      this.setState({ selVPNInstalled: false });
    }
  }

  addSoftetherNetwork = () => {
    console.log(this.state)
    // add a Softether network
    fetch('/api/softether/add', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        network: {
          server: this.state.softetherServer,
          hub: this.state.softetherHub,
          username: this.state.softetherUsername,
          password: this.state.softetherPassword
        }
      })
    }).then(response => response.json()).then(state => { this.setState(state) }).catch(error => {
      this.setState({ waiting: false, error: "Error add network: " + error }) });
  }

  delSoftetherNetwork = (val) => {
    // Remove a Softether network
    fetch('/api/softether/del', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        network: val
      })
    }).then(response => response.json()).then(state => { this.setState(state) }).catch(error => {
      this.setState({ waiting: false, error: "Error remove network: " + error }) });
  }

  activateSoftetherNetwork = (val) => {
    // Remove a Softether network
    fetch('/api/vpnsoftetheractivate', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        network: val
      })
    }).then(response => response.json()).then(state => { this.setState(state) }).catch(error => {
      this.setState({ waiting: false, error: "Error remove network: " + error }) });
  }

  deactivateSoftetherNetwork = (val) => {
    // Remove a Softether network
    fetch('/api/vpnsoftetherdeactivate', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        network: val
      })
    }).then(response => response.json()).then(state => { this.setState(state) }).catch(error => {
      this.setState({ waiting: false, error: "Error remove network: " + error }) });
  }

  handlenewZerotierKey = (event) => {
    this.setState({ newZerotierKey: event.target.value });
  }

  handlenewSoftetherAccount = (event) => {
    console.log(event)
  }

  removeZerotierNetwork = (val) => {
    //remove a zerotier network
    fetch('/api/vpnzerotierdel', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.state.token}`
      },
      body: JSON.stringify({
        network: val
      })
    }).then(response => response.json()).then(state => { this.setState(state) }).catch(error => {
      this.setState({ waiting: false, error: "Error removing network: " + error }) });
  }

  addZerotierNetwork = () => {
    //add a zerotier network
    fetch('/api/vpnzerotieradd', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.state.token}`
      },
      body: JSON.stringify({
        network: this.state.newZerotierKey
      })
    }).then(response => response.json()).then(state => { this.setState(state) }).catch(error => {
      this.setState({ waiting: false, error: "Error removing network: " + error }) });
  }

  activateWireguardNetwork = (val) => {
    // activate wireguard network
    fetch('/api/vpnwireguardactivate', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.state.token}`
      },
      body: JSON.stringify({
        network: val
      })
    }).then(response => response.json()).then(state => { this.setState(state) }).catch(error => {
      this.setState({ waiting: false, error: "Error activating network: " + error }) });
  }

  deactivateWireguardNetwork = (val) => {
    // activate wireguard network
    fetch('/api/vpnwireguarddeactivate', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.state.token}`
      },
      body: JSON.stringify({
        network: val
      })
    }).then(response => response.json()).then(state => { this.setState(state) }).catch(error => {
      this.setState({ waiting: false, error: "Error deactivating network: " + error }) });
  }

  deleteWireguardNetwork = (val) => {
    //delete a wireguard profile
    fetch('/api/vpnwireguardelete', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.state.token}`
      },
      body: JSON.stringify({
        network: val
      })
    }).then(response => response.json()).then(state => { this.setState(state) }).catch(error => {
      this.setState({ waiting: false, error: "Error deleting network: " + error }) });
  }

  fileChangeHandler = (event) => {
    this.setState({ selectedWGFile: event.target.files[0] });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('wgprofile', this.state.selectedWGFile);

    fetch('/api/vpnwireguardprofileadd', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.state.token}`
      },
      body: formData
    })
    .then(response => response.json())
    .then(state => { this.setState(state) })
    .catch(error => {
      this.setState({ waiting: false, error: "Error uploading profile: " + error })
    });
  };

  renderTitle () {
    return 'VPN'
  }

  renderContent () {
    return (
        <div style={{ width: 800 }}>
        <h2>Services</h2>
        <div className="form-group row" style={{ marginBottom: '5px' }}>
          <label className="col-sm-4 col-form-label">VPN Service</label>
          <div className="col-sm-8">
            <Form.Select onChange={this.handleVPNChange} value={this.state.selectedVPN}>
              {this.state.vpnOptions !== null ? this.state.vpnOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              )) : <option></option>}
            </Form.Select>
          </div>
        </div>
        <h2>Config</h2>
        <p>Installed: {this.state.selVPNInstalled == true ? 'Yes' : 'No'}</p>
        <p>Active: {this.state.selVPNActive == true ? 'Yes' : 'No'}</p>
        <p>Online: {this.state.statusSoftether.online == true ? 'Yes' : 'No'}</p>
        {/* <p>{JSON.stringify(this.state.selectedVPN.value == 'wireguard' ? this.state.statusWireguard : this.state.statusZerotier, null, 2)}</p> */}
        <div style={{ display: (this.state.selectedVPN.value == 'softether' && this.state.statusSoftether != {}) ? "block" : "none"}}>
          <Table striped bordered>
            <thead>
              <tr>
                <th>Server</th>
                <th>Status</th>
                <th>Hub</th>
                <th>NIC</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {this.state.statusSoftether.text.map((item, index) => (
                <tr key={item.name}><td>{item.server}</td><td>{item.status}</td><td>{item.hub}</td><td>{item.nic}</td><td><Button size="sm" id={item.nwid} onClick={() => this.delSoftetherNetwork(item.name)}>Delete</Button></td></tr>
              ))}
            </tbody>
            </Table>
            <div className="form-group row" style={{ marginBottom: '5px' }}>
              <label className="col-sm-4 col-form-label ">Server: </label>
              <div className="col-sm-4">
                <Form.Control type="text" name="seserver" disabled={!this.state.selVPNActive} value={this.state.softetherServer} onChange={(event) => this.setState({softetherServer: event.target.value})} />
              </div>
            </div>
            <div className="form-group row" style={{ marginBottom: '5px' }}>
              <label className="col-sm-4 col-form-label ">Hub: </label>
              <div className="col-sm-4">
                <Form.Control type="text" name="sehub" disabled={!this.state.selVPNActive} value={this.state.softetherHub} onChange={(event) => this.setState({softetherHub: event.target.value})} />
              </div>
            </div>
            <div className="form-group row" style={{ marginBottom: '5px' }}>
              <label className="col-sm-4 col-form-label ">Username: </label>
              <div className="col-sm-4">
                <Form.Control type="text" name="seusername" disabled={!this.state.selVPNActive} value={this.state.softetherUsername} onChange={(event) => this.setState({softetherUsername: event.target.value})} />
              </div>
            </div>
            <div className="form-group row" style={{ marginBottom: '5px' }}>
              <label className="col-sm-4 col-form-label ">Password: </label>
              <div className="col-sm-4">
                <Form.Control type="password" name="sepassword" disabled={!this.state.selVPNActive} onChange={(event) => this.setState({softetherPassword: event.target.value})} />
              </div>
            </div>
            <div className="form-group row" style={{ margin: '10px 100px 0px 100px' }}>
              <Button id="addse" disabled={!this.state.selVPNActive || this.state.softetherServer === null || this.state.softetherHub === null || this.state.softetherUsername === null || this.state.softetherPassword === null} onClick={() => this.addSoftetherNetwork()}>Save</Button>
            </div>
          </div>
        <div style={{ display: (this.state.selectedVPN.value == 'zerotier' && this.state.statusZerotier != {}) ? "block" : "none"}}>
          <Table striped bordered>
            <thead>
              <tr>
                <th>Network ID</th>
                <th>Network Name</th>
                <th>IP</th>
                <th>Status</th>
                <th>Type</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {this.state.statusZerotier.text.map((item) => (
                <tr key={item.nwid}><td>{item.nwid}</td><td>{item.name}</td><td>{item.assignedAddresses}</td><td>{item.status}</td><td>{item.type}</td><td><Button size="sm" id={item.nwid} onClick={() => this.removeZerotierNetwork(item.nwid)}>Delete</Button></td></tr>
              ))}
            </tbody>
            </Table>
            <div className="form-group row" style={{ marginBottom: '5px' }}>
              <label className="col-sm-4 col-form-label ">Add new network by key: </label>
              <div className="col-sm-4">
                <Form.Control type="text" name="ipaddress" disabled={!this.state.selVPNActive} value={this.state.newZerotierKey} onChange={this.handlenewZerotierKey} />
                <Button id="addzt" disabled={!this.state.selVPNActive || this.state.newZerotierKey === ''} onClick={() => this.addZerotierNetwork()}>Add</Button>
              </div>
            </div>
          </div>
          <div style={{ display: (this.state.selectedVPN == 'wireguard' && this.state.statusWireguard != {}) ? "block" : "none"}}>
            <Table striped bordered>
              <thead>
                <tr>
                  <th>Network Conf File</th>
                  <th>Local IP</th>
                  <th>Server IP</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
              {this.state.statusWireguard.text.map((item) => (
                <tr key={item.profile}>
                  <td>{item.profile}</td>
                  <td>{item.peer}</td>
                  <td>{item.server}</td>
                  <td>{item.status}</td>
                  <td>
                    <div style={{ display: (item.status === 'disabled') ? "block" : "none"}}>
                      <Button size="sm" id={item.file} onClick={() => this.activateWireguardNetwork(item.profile)}>Activate</Button>
                    </div>
                    <div style={{ display: (item.status !== 'disabled') ? "block" : "none"}}>
                      <Button size="sm" id={item.file} onClick={() => this.deactivateWireguardNetwork(item.profile)}>Deactivate</Button>
                    </div>
                    <Button size="sm" id={item.file} disabled={item.status !== 'disabled'} onClick={() => this.deleteWireguardNetwork(item.profile)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
            </Table>
            <div className="form-group row" style={{ marginBottom: '5px' }}>
              <label className="col-sm-4 col-form-label ">Add new Wireguard profile</label>
              <div className="col-sm-6">
                <Form id='uploadForm' onSubmit={this.handleSubmit}>
                    <Form.Control type="file" name="wgprofile" disabled={!this.state.selVPNActive} onChange={this.fileChangeHandler} accept=".conf, .config"/>
                    <Button type='submit' value='Upload' disabled={this.state.selectedWGFile === ''}>Upload</Button>
                </Form>
              </div>
            </div>
          </div>
          </div>
    )
  }
}

export default VPNPage
