/*
 VPN management for Softether
*/
const path = require('path')
const { exec } = require('child_process')
const winston = require('../winstonconfig')(module)

const VPNCMD = 'sudo /usr/local/vpnclient/vpncmd /client localhost /cmd'

function getVPNStatusSoftether (errpass, callback) {
  console.log('server getVPNStatusSoftether')
  // get status of VPN
  exec(`${VPNCMD} AccountStatusGet vpn`, (error, stdout, stderr) => {
    console.log('getVPNStatusSoftether execd')
    console.log(error)
    console.log(stdout)
    
    const isInstalled = stdout.search('Connected to VPN Client') > -1
    const isStatus = stdout.search('Error occurred') === -1

    return callback(errpass, { installed: isInstalled, status: isStatus, text: JSON.parse('[]') })
  })
}

/**
 * 1. Create virtual nic
 * 2. Enable virtual nic
 * 3. Create a account
 * 4. Set auto startup
 * @param {*} network 
 * @param {*} callback 
 */
async function addSoftether (network, callback) {
  console.log('addSoftether: ', network)
  await Promise.all([
    _nicCreateOrDelete(true),
    _nicEnable(true),
    new Promise((resolve, reject) => {
      exec(`${VPNCMD} AccountCreate vpn /SERVER ${network.server} /HUB ${network.hub} /USERNAME ${network.username} /NICNAME nic`, (error, stdout, stderr) => {
        console.log('accountcreate', error, stdout)
        resolve()
      })
    }),
    _accountPasswordSet(network.password),
    _accountStartup(true)
  ]).then((result) => {
    return getVPNStatusSoftether(null, callback)
  })
}

function removeSoftether(network, callback) {
  console.log('removeSoftether: ' + network)
  _accountStartup(false).finally(_ => {
    _nicEnable(false).then(_ => {
      exec(`${VPNCMD} AccountDelete vpn`, (error, stdout, stderr) => {
        if (stderr.toString().trim() !== '') {
          console.error(`exec error: ${error}`)
          winston.error('Error in removeSoftether', { message: stderr })
          callback(error)
        } else {
          // console.log(stdout)
          callback()
        }
      })
    })
  })
}

function activateSoftether(network, callback) {
  console.log('activateSoftether: ' + network)
}

function deactivateSoftether(network, callback) {
  console.log('deactivateSoftether: ' + network)
}

/**
 * private function
 */
function checkAndCreateNic() {
  return new Promise((resolve, reject) => {
    _nicList.then((nicLists) => {
      if (nicLists.length === 0) {
        // Create a nic
        _nicCreateOrDelete(true).then(res => {
          res ? resolve() : reject('Failed to create nic')
        })
        .catch(reason => reject(reason))
      } else {
        resolve()
      }
    })
  })
}

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
  return new Promise((resolve, reject) => {
    let cmd = create ? 'NicCreate' : 'NicDelete'
    exec(`${VPNCMD} ${cmd} nic`, (error, stdout, stderr) => {
      resolve()
    })
  })
}

function _nicEnable(enable) {
  console.log('nicEnable')
  return new Promise((resolve, reject) => {
    let cmd = enable ? 'NicEnable' : 'NicDisable'
    exec(`${VPNCMD} ${cmd} nic`, (error, stdout, stderr) => {
      resolve()
    })
  })
}

function _accountPasswordSet(password) {
  onsole.log('accountPasswordSet')
  return new Promise((resolve, reject) => {
    exec(`${VPNCMD} AccountPasswordSet vpn /PASSWORD ${password} /TYPE standard`, (error, stdout, stderr) => {
      if (stderr.toString().trim() !== '') {
        console.error(`exec error: ${error}`)
        winston.error('Error in accountPasswordSet ', { message: stderr })
        reject(error)
      } else {
        console.log(stdout)
        // TODO
        resolve()
      }
    })
  })
}

function _accountStartup(enable) {
  console.log('accountStartup')
  return new Promise((resolve, reject) => {
    let cmd = enable ? 'AccountStartupSet' : 'AccountStartupRemove'
    exec(`${VPNCMD} ${cmd} vpn`, (error, stdout, stderr) => {
      if (stderr.toString().trim() !== '') {
        console.error(`exec error: ${error}`)
        winston.error('Error in accountStartup ', { message: stderr })
        reject(error)
      } else {
        console.log(stdout)
        // TODO
        resolve()
      }
    })
  })
}

module.exports = {
  getVPNStatusSoftether,
  addSoftether,
  removeSoftether,
  activateSoftether,
  deactivateSoftether
}
