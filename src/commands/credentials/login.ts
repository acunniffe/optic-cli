import {Command, flags} from '@oclif/command'
import {cli} from 'cli-ux'
import { parseOpticYaml, readOpticYaml } from '../../common/config'
import {Credentials} from '../../common/credentials'
import { TokenListenerService } from '../../services/optic-authentication/token-listener'

export default class Login extends Command {
  static description = 'login to your account from the CLI'

  static flags = {
    "host": flags.string({required: false})
  }

  static args = []

  async run() {


    const {flags} = this.parse(Login)

    let yamlContents;
    try{
      yamlContents = readOpticYaml()
    } catch {
      yamlContents = JSON.stringify({strategy: {type: 'logging', commandToRun: 'npm'},  api: {id: 'none', version: 'abc', paths: []}})
    }

    const config = parseOpticYaml(yamlContents)
    const baseUrl = config.optic.baseUrl

    const tokenService = new TokenListenerService()
    const {tokenPromise, responsePort} = await tokenService.waitForToken()
    cli.open(`${flags.host || baseUrl}/authorize-cli/`+responsePort)

    const token = await tokenPromise
    await new Credentials().set(token.trim())

    tokenService.stop()

    this.log("You've been logged in!")
  }
}
