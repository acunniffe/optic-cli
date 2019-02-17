import {Command} from '@oclif/command'

import {parseOpticYaml, readOpticYaml} from '../../common/config'

export default class Config extends Command {
  static description = 'validate your optic.yml'

  static flags = {}

  static args = []

  async run() {
    this.log(`checking ${process.cwd()}/optic.yml`)
    const {error} = parseOpticYaml(readOpticYaml())

    if (error) {
      this.error(error)
    } else {
      this.log('Everything looks ok!')
    }
  }
}
