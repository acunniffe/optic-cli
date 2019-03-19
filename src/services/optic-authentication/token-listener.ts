import * as express from 'express'
// @ts-ignore
const fp = require('find-free-port')
const cors = require('cors')

const whitelist = ['http://localhost:3000', 'https://app.useoptic.com']
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

export class TokenListenerService {
  private readonly app = express()
  private server: any

  waitForToken() {
    return new Promise(((resolve, reject) => {
      const tokenPromise = new Promise(((tokenResolve, reject) => {
        fp(this.randomPort(), (err, responsePort: number) => {
          resolve({ tokenPromise, responsePort: responsePort })
          this.app.post('/token/:token', cors(corsOptions), (req: Request, res: Response) => {
            res.sendStatus(200)
            tokenResolve(req.params.token)
          })

          this.app.options('*', cors())

          this.server = this.app.listen(responsePort, () => {
            console.log('Listening for token on '+ responsePort)
          })
        })
      }))
    }))
  }

  stop() {
    if (this.server) {
      this.server.close()
    }
  }

  public randomPort() {
    const high = 9000
    const low = 3000
    return Math.floor(Math.random() * (high - low) + low)
  }

}
