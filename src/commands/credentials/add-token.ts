import {Command} from '@oclif/command'
import {cli} from 'cli-ux'

import {Credentials} from '../../common/credentials'

export default class CredentialsAddToken extends Command {
  static description = 'describe the command here'

  static flags = {}

  static args = []

  async run() {
    //@TODO: there's a bug with stdin when testing the transitive dependency used in cli.prompt(x, {type: 'hide' | 'mask'}) but that might be preferable to showing the token. If so, skip the test
    const token: string = await cli.prompt('What is your Optic API token?')

    //@TODO: verify token against api

    await new Credentials().set(token.trim())

    this.log('Thanks! I saved your token.')
  }
}
