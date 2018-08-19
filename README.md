# Noonlight SDK - Node.js Client Library
A Node.js wrapper around the Noonlight API. This library is part of the Noonlight SDK.

## Installation

```
npm i @noonlight/noonlight-sdk
```

## Usage

```
let access_token = 'eyJ0...' // acquire an access_token from Noonlight OAuth

const Noonlight = require('@noonlight/noonlight-sdk') // require the module
const nl = new Noonlight(access_token) // initialize

// Call methods
nl.createAlarm(NL.services(), '911 Washington Ave, St. Louis, MO, 63101')
```

## Reference

**constructor(token: *string*, uri?: *string*)**  
You can initialize the library by instantiating the base class using the `new` keyword. The `token` parameter is the *access_token* required to make requests to the Noonlight API and is hence a required parameter. The base URL for the API will be derived from the token if available. In case of error, make sure that you provided a valid token or explicitly provide the API base URL as the second parameter.

*Example Usage:*  
```
// Implicit URI detection
const nl = new noonlight('eyJ0...')

//Explicit URI declaration
const nl = new noonlight('eyJ0...', 'http://localhost:3000')
```

**services(code?: *string*)**  
Generates a `Services` object based on a given code, in the required JSON format to be used in other methods. The services are Police, Fire and Medical. The `code` parameter could be any combination of their initials in any order. It is also case insensitive. By default, the service object returned has `police` set to `true`.

*Example Usage:*  
```
console.log(nl.services())
// Output: { police: true, fire: false, medical: false }

console.log(nl.services('PF'))
// Output: { police: true, fire: true, medical: false }

nl.services('mf')
// Output: { police: false, fire: true, medical: true }

nl.services('FpM')
// Output: { police: true, fire: true, medical: true }
```

**createAlarm(services: *Services{}*, ...location: *...number|string*)**  
Creates a Noonlight alarm based on the given `location` and `services`. The `Services` object required by the `services` parameter can be generated using the `services()` method. For the `location`, you can either pass in an address string in the format:  
*line1, line2 (optional), city, state (2-digit state code), zip*  
or,   
the coordinates as three separate numbers - `latitude`, `longitude` and `accuracy` in that order. Improper or invalid parameters will result in an error.
The method returns a Promise which gets resolved into the response from the Noonlight API in event of successful alarm creation. The Promise will be rejected with an `Error` object in event of an error.

*Example Usage:*  
```
// Alarm creation with address
nl.createAlarm(nl.services(), '911 Washington Ave, St. Louis, MO, 63101')
  .then(result =>  console.log(result))
  .catch(err => console.log(err.message))

// Alarm creation with coordinates
nl.createAlarm(nl.services(), 34.32334, -117.3343, 5)
  .then(result =>  console.log(result))
  .catch(err => console.log(err.message))
```

## Contributions
Currently, public contributions to this project are not being accepted.