require('dotenv').config()
const rp = require('request-promise')
const Promise = require('bluebird')
const ENV = process.env

class Noonlight {

  constructor(token) {
    if (!token || typeof token != 'string') {
      throw new Error('A valid token is required to initialize')
    }
    this.token = token
  }

  service(code) {
    switch (code) {
      case 'P': return { 'police': true, 'fire': false, 'medical': false }
      case 'F': return { 'police': false, 'fire': true, 'medical': false }
      case 'M': return { 'police': false, 'fire': false, 'medical': true }
      case 'PF':
      case 'FP':
        return { 'police': true, 'fire': true, 'medical': false }
      case 'PM':
      case 'MP':
        return { 'police': true, 'fire': false, 'medical': true }
      case 'MF':
      case 'FM':
        return { 'police': false, 'fire': true, 'medical': true }
      case 'PFM':
      case 'PMF':
        return { 'police': true, 'fire': true, 'medical': true }
    }
  }

  createAlarm(services, ...location) {
    return new Promise((resolve, reject) => {
      let body = { services }
      if (location.length === 3) {
        let [ lat, lng, accuracy ] = location
        body['location.coordinates'] = {
          lat, lng, accuracy
        }
      } else  if (location.length === 1) {
        let address = location.pop()
        let addrArray = address.split(',').map(e => e.trim())
        if (addrArray.length > 3 && addrArray.length <= 5) {
          let line1, line2, city, state, zip
          if (addrArray.length === 4) {
            [ line1, city, state, zip ] = addrArray
          } else {
            [ line1, line2, city, state, zip ] = addrArray
          }
          body['location.address'] = {
            line1, city, state, zip
          }
          if (line2) {
            body['location.address'].line2 = line2
          }
        } else {
          reject(new Error('Invalid Location'))
        }
      } else {
        reject(new Error('Invalid Location'))
      }

      let options = {
        method: 'POST',
        uri: 'https://api-beta.safetrek.io/v1/alarms',
        body: body,
        headers: { 'Authorization': `Bearer ${ENV.TOKEN}` },
        json: true
      }

      rp(options)
        .then(res => resolve(res))
        .catch(err => reject(new Error(err)))

    })
  }
}

module.exports = Noonlight