import * as express from 'express'
// @ts-ignore
const fp = require('find-free-port')

export class TokenListenerService {
  private readonly app = express()
  private server: any

  waitForToken() {
    return new Promise(((resolve, reject) => {
      const tokenPromise = new Promise(((tokenResolve, reject) => {
        fp(this.randomPort(), (err, responsePort: number) => {
          resolve({ tokenPromise, responsePort: responsePort })
          this.app.get('/token/:token', (req: Request, res: Response) => {
            res.sendFile('complete-with.html', {root: __dirname})
            tokenResolve(req.params.token)
          })

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
