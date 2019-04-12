import {Command} from '@oclif/command'

import {parseOpticYaml, readOpticYaml} from '../../common/config'
import { track } from '../../services/analytics/segment'

export default class Config extends Command {
  static description = 'validate your optic.yml'

  static flags = {}

  static args = []

  async run() {
    this.log(`checking ${process.cwd()}/optic.yml`)

    track('Config Check')

    try {
      parseOpticYaml(readOpticYaml())
      this.log('Everything looks ok!')
    } catch (error) {
      track('Config Error', {error: error.message})
      return this.error(error)
    }
  }
}
