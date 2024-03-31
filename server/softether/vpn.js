/*
 VPN management for Softether
*/
const path = require('path')
const { exec } = require('child_process')
const winston = require('../winstonconfig')(module)

const VPNCMD = 'sudo /usr/local/vpnclient/vpncmd /client localhost /cmd'

function getVPNStatusSoftether (errpass, callback) {
  // get status of VPN
  exec('sudo zerotier-cli info && sudo zerotier-cli listnetworks -j', (error, stdout, stderr) => {
    if (stderr.toString().trim() !== '') {
      console.error(`exec error: ${error}`)
      winston.error('Error in getVPNStatusZerotier() ', { message: stderr })
      return callback(null, { installed: false, status: false, text: JSON.parse('[]') })
    } else {
      // zerotier's in JSON format anyway, so just pipe through
      if (stdout.search('connection failed') > -1) {
        return callback(errpass, { installed: true, status: false, text: JSON.parse('[]') })
      } else {
        const infoout = stdout.slice(0, stdout.indexOf('[\n]'))
        const networkout = stdout.slice(stdout.indexOf('\n') + 1)
        const isOnline = infoout.search('ONLINE') > -1
        return callback(errpass, { installed: true, status: isOnline, text: JSON.parse(networkout) })
      }
    }
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
function addSoftether (network, callback) {
  console.log('addSoftether: ' + network)
  checkAndCreateNic().then(_ => {
    _nicEnable(true).then(_ => {
      exec(`${VPNCMD} AccountCreate vpn /SERVER ${network.host} /HUB ${network.hub} /USERNAME ${network.username} /NICNAME nic`, (error, stdout, stderr) => {
        if (stderr.toString().trim() !== '') {
          console.error(`exec error: ${error}`)
          winston.error('Error in addSoftether() ', { message: stderr })
          callback(error)
        } else {
          // console.log(stdout)
          _accountStartup(true).finally(_ => {
            callback()
          })
        }
      })
    })
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
  return new Promise(resolve, reject => {
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
  return new Promise(resolve, reject => {
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
  return new Promise(resolve, reject => {
    let cmd = create ? 'NicCreate' : 'NicDelete'
    exec(`${VPNCMD} ${cmd} nic`, (error, stdout, stderr) => {
      if (stderr.toString().trim() !== '') {
        console.error(`exec error: ${error}`)
        winston.error('Error in nicCreate ', { message: stderr })
        reject(error)
      } else {
        console.log(stdout)
        // TODO
        resolve(true)
      }
    })
  })
}

function _nicEnable(enable) {
  console.log('nicEnable')
  return new Promise(resolve, reject => {
    let cmd = enable ? 'NicEnable' : 'NicDisable'
    exec(`${VPNCMD} ${cmd} nic`, (error, stdout, stderr) => {
      if (stderr.toString().trim() !== '') {
        console.error(`exec error: ${error}`)
        winston.error('Error in nicEnable ', { message: stderr })
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
  return new Promise(resolve, reject => {
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
