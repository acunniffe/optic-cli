import {Command} from '@oclif/command'
import {cli} from 'cli-ux'
import { parseOpticYaml, readOpticYaml } from '../../common/config'
import {Credentials} from '../../common/credentials'
import { TokenListenerService } from '../../services/optic-authentication/token-listener'

export default class CredentialsLogin extends Command {
  static description = 'login to your account from the CLI'

  static flags = {}

  static args = []

  async run() {

    let baseWebappUrl
    try {
      baseWebappUrl = parseOpticYaml(readOpticYaml()).optic.baseUrl
    } catch (error) {
      baseWebappUrl = 'http://localhost:3000/_sandbox/router'
      // baseWebappUrl = 'https://app.useoptic.com'
    }

    const tokenService = new TokenListenerService()
    const {tokenPromise, responsePort} = await tokenService.waitForToken()
    cli.open(`${baseWebappUrl}/authorize-cli/`+responsePort)

    const token = await tokenPromise
    console.log(token)
    await new Credentials().set(token.trim())

    tokenService.stop()

    this.log("You've been logged in!")
  }
}
