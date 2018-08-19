const Promise = require('bluebird')
const rp = require('request-promise')
const jwt = require('jwt-decode')

class Noonlight {

  /**
   * Initialize the Noonlight Client
   * @param {string} token A valid Noonlight JWT access token
   * @param {string} [uri] API base URI to use (optional)
   */
  constructor(token, uri) {
    if (!token || typeof token != 'string') {
      throw new Error('A valid token is required to initialize. Please provide one in the parameters.')
    } else {
      this.token = token
      let tokenJson = jwt(token)
      this.baseUri = uri || tokenJson.aud.filter(e => {
        return /\.safetrek\.io/.test(e)
      }).pop()
      if (!this.baseUri) {
        throw new Error('Implicit API base URI detection failed. Please provide one in the parameters.')
      }
      this.scope = tokenJson.scope
    }
  }

  /**
   * @param {string} code Combination of initials for the required services.
   * @returns A Services object in the required JSON format to be used in other methods
   * 
   * The code string can have the service initials in any case and order.
   * 
   * Example codes:
   * 'PF' - police and fire
   * 'pfm' - police, fire and medical
   */
  services(code) {
    class Services {
      constructor(code) {
        this.police = false
        this.fire = false
        this.medical = false
        if (code) {
          code = code.toLowerCase()
          if (code.indexOf('p') !== -1) {
            this.police = true
          }
          if (code.indexOf('f') !== -1) {
            this.fire = true
          }
          if (code.indexOf('m') !== -1) {
            this.medical = true
          }
        } else {
          this.police = true
        }
      }
    }
    return new Services(code)
  }

  _checkScope(scope) {
    return scope.every(s =>
      this.scope.indexOf(s) !== -1
    )
  }

  /**
   * Trigger a Noonlight alarm for the user
   * @param {json} services 
   * @param {...number|string} location Latitude, Longitude and Accuracy as numbers
   * or Address string in the format 'line1, line2 (optional), city, state code, zip'
   */
  createAlarm(services, ...location) {
    if (!this._checkScope(['write:alarm'])) {
      return Promise.reject(new Error('A required scope is missing'))
    }
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
        uri: `${this.baseUri}/v1/alarms`,
        body: body,
        headers: { 'Authorization': `Bearer ${this.token}` },
        json: true
      }

      rp(options)
        .then(res => resolve(res))
        .catch(err => reject(new Error(err)))

    })
  }
}

module.exports = Noonlight