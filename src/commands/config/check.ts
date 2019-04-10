import {Command} from '@oclif/command'
import {IOpticYamlConfig} from '@useoptic/core/build/src/optic-config'

import {parseOpticYaml, readOpticYaml} from '../../common/config'

export default class Config extends Command {
  static description = 'validate your optic.yml'

  static flags = {}

  static args = []

  async run() {
    this.log(`checking ${process.cwd()}/optic.yml`)

    try {
      const config: IOpticYamlConfig = parseOpticYaml(readOpticYaml())
      this.log('Everything looks ok!')
    } catch (error) {
      return this.error(error)
    }
  }
}
