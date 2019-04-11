import {Command, flags} from '@oclif/command'

import {Credentials} from '../../common/credentials'

export default class Login extends Command {
  static description = 'logout from the CLI'

  static flags = {
    host: flags.string({required: false})
  }

  static args = []

  async run() {
    await new Credentials().clear()
    this.log('You have been logged out. Run optic auth:login anytime to login again')
    process.exit(0)
  }
}
