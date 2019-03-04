# Getting Started
## Installation
To use this code in your project, you'll need to `npm install` it using a relative path
It uses [`unirest`](http://unirest.io/nodejs.html) as a dependency.
```bash
(from your NPM javascript project)
$ npm install --save PATH_TO_THIS_FOLDER

```
## Usage
```javascript

const {Client} = require('api-js-client');
const baseUrl = 'YOUR API BASE URL';
const getCredentials = () => ({token: 'YOUR BEARER TOKEN'});
const client = new Client(baseUrl, getCredentials);
// now you can call methods from your api using client.
              

```
