import {Command} from '@oclif/command'
import {cli} from 'cli-ux'
import { parseOpticYaml, readOpticYaml } from '../../common/config'
import {Credentials} from '../../common/credentials'
import { TokenListenerService } from '../../services/optic-authentication/token-listener'
import { OpticSetupService } from '../../services/optic-setup/setup-service'

export default class CredentialsLogin extends Command {
  static description = 'setup the CLI'

  static flags = {}

  static args = []

  async run() {

    const opticSetupService = new OpticSetupService()
    opticSetupService.startSocket()

    this.log("Setup service is running on port 30336.")
  }
}
