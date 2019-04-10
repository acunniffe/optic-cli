import {Command} from '@oclif/command'
import * as express from 'express'
// @ts-ignore
const fp = require('find-free-port')
type TokenSession = {
  tokenPromise: Promise<string>
  responsePort: number
}

export class TokenListenerService {
  private readonly app = express()
  private server: any

  waitForToken(cli: Command) {
    return new Promise<TokenSession>(resolve => {
      const tokenPromise = new Promise<string>((tokenResolve => {
        fp(this.randomPort(), (_: any, responsePort: number) => {
          resolve({tokenPromise, responsePort})
          this.app.get('/token/:token', (req: express.Request, res: express.Response) => {
            res.sendFile('complete-with.html', {root: __dirname})
            tokenResolve(req.params.token)
          })

          this.server = this.app.listen(responsePort, () => {
            // cli.log(`Listening for token on ${responsePort}`)
          })
        })
      }))
    })
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
