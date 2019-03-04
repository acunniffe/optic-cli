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
      if (!config.strategy) {
        this.log('Your optic.yml is missing the strategy section - you will not be able to run api:document')
      }
      if (!config.api) {
        this.log('Your optic.yml is missing the api section - you will not be able to run api:document or api:publish')
      }
      this.log('Everything looks ok!')
    } catch (error) {
      return this.error(error)
    }
  }
}
