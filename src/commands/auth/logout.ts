import {Command, flags} from '@oclif/command'
import {cli} from 'cli-ux'

import {parseOpticYaml, readOpticYaml} from '../../common/config'
import {Credentials} from '../../common/credentials'
import {TokenListenerService} from '../../services/optic-authentication/token-listener'

export default class Login extends Command {
  static description = 'logout from the CLI'

  static flags = {
    host: flags.string({required: false})
  }

  static args = []

  async run() {
    const {flags} = this.parse(Login)

    await new Credentials().clear()
    this.log('You have been logged out. Run optic auth:login anytime to login again')
    process.exit(0)
  }
}
