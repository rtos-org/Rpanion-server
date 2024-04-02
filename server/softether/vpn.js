/*
 VPN management for Softether
*/
const fs = require('fs')
const path = require('path')
const { exec, execSync } = require('child_process')
const winston = require('../winstonconfig')(module)
const _ = require('underscore')

const VPNCMD = 'sudo /usr/local/vpnclient/vpncmd /client localhost /cmd'

function getVPNStatusSoftether (errpass, callback) {
  console.log('server getVPNStatusSoftether')
  startClient(true)
  // check command exists
  const isInstalled = fs.existsSync('/usr/local/vpnclient/vpncmd')
  // get version of VPN
  const versionOutput = execSync(`${VPNCMD} Version`)
  const isActive = !(versionOutput instanceof Error)
  // account info
  const accountListOutput = execSync(`${VPNCMD} AccountList`)
  var resultJson = [];
  if (!(accountListOutput instanceof Error)) {
    resultJson = parseAccountListOutput(accountListOutput.toString())
  }
  const isOnline = !_.isEmpty(resultJson) && resultJson[0].status === 'Connected'
  console.log(resultJson)

  return callback(errpass, { installed: isInstalled, status: isActive, online: isOnline, text: resultJson })
  // return callback(errpass, { installed: isInstalled, status: isActive, online: isOnline, text: JSON.parse('[]') })
}

/**
 * 1. Create virtual nic
 * 2. Enable virtual nic
 * 3. Create a account
 * 4. Set auto startup
 * @param {*} network 
 * @param {*} callback 
 */
function addSoftether (network, callback) {
  console.log('addSoftether: ', network)
  _nicCreateOrDelete(true)
  _nicEnable(true)
  _accountCreate(network)
  _accountPasswordSet(network.password)
  _accountConnect()
  _accountStartup(true)
 
  return getVPNStatusSoftether(null, callback)
}

function removeSoftether(network, callback) {
  console.log('removeSoftether', network)
  _accountStartup(false)
  _accountDisconnect()
  _accountDelete()

  return getVPNStatusSoftether(null, callback)
}

function activateSoftether(callback) {
  console.log('activateSoftether')
  _accountConnect()
  _accountStartup(true)

  return getVPNStatusSoftether(null, callback)
}

function deactivateSoftether(callback) {
  console.log('deactivateSoftether')
  _accountDisconnect()
  _accountStartup(false)

  return getVPNStatusSoftether(null, callback)
}

function startClient(enable) {
  try {
    const cmd = enable ? 'start' : 'stop'
    execSync(`sudo systemctl ${cmd} vpnclient`)
  } catch (error) {
    console.log(error)
  }
}

/**
 * private function
 */
function _nicList() {
  console.log('nicList')
  return new Promise((resolve, reject) => {
    exec(`${VPNCMD} NicList`, (error, stdout, stderr) => {
      if (stderr.toString().trim() !== '') {
        console.error(`exec error: ${error}`)
        winston.error('Error in NicList ', { message: stderr })
        resolve([])
      } else {
        console.log(stdout)
        // TODO
        resolve([])
      }
    })
  })
}

function _nicCreateOrDelete(create) {
  console.log('nicCreate')
  try{
    let cmd = create ? 'NicCreate' : 'NicDelete'
    const output = execSync(`${VPNCMD} ${cmd} nic`)
    console.log(output)
    if (!(output instanceof Error)) {
      const ipOutput = execSync(`sudo ip addr add 192.168.30.10/24 dev vpn_nic`)
      console.log(ipOutput)
    }
  } catch (error) {
    console.log(error)
  }
}

function _nicEnable(enable) {
  console.log('nicEnable')
  let cmd = enable ? 'NicEnable' : 'NicDisable'
  const output = execSync(`${VPNCMD} ${cmd} nic`)
  console.log(output)
}

function _accountCreate(account) {
  console.log('accountCreate')
  const output = execSync(`${VPNCMD} AccountCreate vpn /SERVER:${account.server}:443 /HUB:${account.hub} /USERNAME:${account.username} /NICNAME:nic`)
  console.log(output)
}

function _accountDelete() {
  console.log('accountDelete')
  const output = execSync(`${VPNCMD} AccountDelete vpn`)
  console.log(output)
}

function _accountPasswordSet(password) {
  console.log('accountPasswordSet')
  const output = execSync(`${VPNCMD} AccountPasswordSet vpn /PASSWORD:${password} /TYPE:standard`)
  console.log(output)
}

function _accountConnect() {
  console.log('accountConnect')
  const output = execSync(`${VPNCMD} AccountConnect vpn`)
  console.log(output)
}

function _accountDisconnect() {
  console.log('AccountDisconnect')
  try {
    const output = execSync(`${VPNCMD} AccountDisconnect vpn`)
    console.log(output)
  } catch (error) {
    console.log(error)
  }
}

function _accountStartup(enable) {
  console.log('accountStartup')
  let cmd = enable ? 'AccountStartupSet' : 'AccountStartupRemove'
  const output = execSync(`${VPNCMD} ${cmd} vpn`)
  console.log(output)
}

function parseAccountListOutput(output) {
  const lines = output.trim().split('\n');
  const result = {};

  lines.forEach(line => {
    if (line.includes('|')) {
      const parts = line.split('|').map(part => part.trim());
      if (parts.length === 2) {
        const key = parts[0];
        const value = parts[1];
        if (key.includes('VPN Connection Setting Name')) {
          result.name = value;
        } else if (key.includes('VPN Server Hostname')) {
          result.server = value;
        } else if (key.includes('Status')) {
          result.status = value;
        } else if (key.includes('Virtual Hub')) {
          result.hub = value;
        } else if (key.includes('Virtual Network Adapter Name')) {
          result.nic = value;
        }
      }
    }
  });

  return _.isEmpty(result) ? [] : [result];
}

module.exports = {
  getVPNStatusSoftether,
  addSoftether,
  removeSoftether,
  activateSoftether,
  deactivateSoftether
}
