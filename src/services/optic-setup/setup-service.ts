import { SessionManager } from '@useoptic/core/build/src'
import * as express from 'express'
import { verifyTestSetup } from '../../setup-utilities/verify-test-setup'
// @ts-ignore
const cors = require('cors')

const whitelist = ['http://localhost:3000', 'https://app.useoptic.com']
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
}

const responsePort = 30336

export class OpticSetupService {
  private readonly app = express()
  private server: any

  startSocket() {
    return new Promise<void>(((resolve, reject) => {
      const tokenPromise = new Promise(((tokenResolve, reject) => {

        this.app.options('*', cors())

        const server = require('http').Server(this.app)
        const io = require('socket.io').listen(server)

        io.set('origins', whitelist)

        io.on('connection',  (socket: any) => {

          socket.on('verify-test-setup', (message: any) => {
            const config = {
              strategy: {
                type: 'logging' as 'logging',
                commandToRun: message.testCmd
              },
              api: {
                id: 'test/api',
                paths: []
              }
            }

            verifyTestSetup(config).then(valid => {
              console.log('\n\n Assertion: Test Setup Valid: '+ valid)
              socket.emit('test-setup-report', {isValid: valid})
            })

          })

        })

        this.server = server.listen(responsePort, () => {
          console.log('Listening for token on ' + responsePort)
          resolve()
        })
      }))
    }))
  }

  stop() {
    if (this.server) {
      this.server.close()
    }
  }

}
