import {Command, flags} from '@oclif/command'
import {cli} from 'cli-ux'

import {parseOpticYaml, readOpticYaml} from '../../common/config'
import {Credentials} from '../../common/credentials'
import {TokenListenerService} from '../../services/optic-authentication/token-listener'

export default class Login extends Command {
  static description = 'login to your account from the CLI'

  static flags = {
    host: flags.string({required: false})
  }

  static args = []

  async run() {
    const {flags} = this.parse(Login)

    const baseUrl = 'https://app.useoptic.com'

    const tokenService = new TokenListenerService()
    try {
      const {tokenPromise, responsePort} = await tokenService.waitForToken(this)
      const url = `${flags.host || baseUrl}/clis/${responsePort}/authorization`
      await cli.open(url)

      this.log(`Grant permissions to the CLI by visiting: ${url}`)

      const token = await tokenPromise
      await new Credentials().set(token.trim())

      tokenService.stop()

      this.log('You\'ve been logged in!')
    } catch (e) {
      this.error(e)
    }
    process.exit(0)
  }
}
