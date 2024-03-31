/*
 VPN management for Softether
*/
const path = require('path')
const { exec } = require('child_process')
const winston = require('../winstonconfig')(module)

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
  console.log('Adding: ' + network)
  exec('sudo zerotier-cli join ' + network, (error, stdout, stderr) => {
    if (stderr.toString().trim() !== '') {
      console.error(`exec error: ${error}`)
      winston.error('Error in addZerotier() ', { message: stderr })
    } else {
      // console.log(stdout)
      if (stdout.search('200 join OK') > -1) {
        return getVPNStatusZerotier(null, callback)
      } else {
        return getVPNStatusZerotier(stdout.toString().trim(), callback)
      }
    }
  })
}

function removeSoftether (network, callback) {
  console.log('Removing: ' + network)
  exec('sudo zerotier-cli leave ' + network, (error, stdout, stderr) => {
    if (stderr.toString().trim() !== '') {
      console.error(`exec error: ${error}`)
      winston.error('Error in removeZerotier() ', { message: stderr })
    } else {
      // console.log(stdout)
      if (stdout.search('200 leave OK') > -1) {
        return getVPNStatusZerotier(null, callback)
      } else {
        return getVPNStatusZerotier(stdout.toString().trim(), callback)
      }
    }
  })
}

function activateSoftether (network, callback) {
  console.log('Removing: ' + network)
  exec('sudo zerotier-cli leave ' + network, (error, stdout, stderr) => {
    if (stderr.toString().trim() !== '') {
      console.error(`exec error: ${error}`)
      winston.error('Error in removeZerotier() ', { message: stderr })
    } else {
      // console.log(stdout)
      if (stdout.search('200 leave OK') > -1) {
        return getVPNStatusZerotier(null, callback)
      } else {
        return getVPNStatusZerotier(stdout.toString().trim(), callback)
      }
    }
  })
}

function deactivateSoftether (network, callback) {
  console.log('Removing: ' + network)
  exec('sudo zerotier-cli leave ' + network, (error, stdout, stderr) => {
    if (stderr.toString().trim() !== '') {
      console.error(`exec error: ${error}`)
      winston.error('Error in removeZerotier() ', { message: stderr })
    } else {
      // console.log(stdout)
      if (stdout.search('200 leave OK') > -1) {
        return getVPNStatusZerotier(null, callback)
      } else {
        return getVPNStatusZerotier(stdout.toString().trim(), callback)
      }
    }
  })
}

/**
 * private function
 */

async function _nicList() {
  console.log('nicList')
  exec('vpncmd /client localhost /cmd NicList', (error, stdout, stderr) => {
    if (stderr.toString().trim() !== '') {
      console.error(`exec error: ${error}`)
      winston.error('Error in NicList ', { message: stderr })
    } else {
      console.log(stdout)
      // TODO
    }
  })
}

module.exports = {
  getVPNStatusSoftether,
  addSoftether,
  removeSoftether,
  activateSoftether,
  deactivateSoftether
}
