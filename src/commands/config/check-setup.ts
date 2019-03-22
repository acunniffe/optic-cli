import { Command } from '@oclif/command'
import { IOpticYamlConfig } from '@useoptic/core/build/src/optic-config'

import { parseOpticYaml, readOpticYaml } from '../../common/config'
import { verifyTestSetup } from '../../setup-utilities/verify-test-setup'
import { cli } from 'cli-ux'

export default class Config extends Command {
  static description = 'validate that your tests send data to Optic'

  static flags = {}

  static args = []

  async run() {
    try {
      const config: IOpticYamlConfig = parseOpticYaml(readOpticYaml())
      if (!config.strategy) {
        this.log('Your optic.yml is missing the strategy section - you will not be able to run api:document')
      }
      if (!config.api) {
        this.log('Your optic.yml is missing the api section - you will not be able to run api:document or api:publish')
      }

      cli.action.start('Listening for API interactions in your tests')
      const isValid = await verifyTestSetup(config)
      cli.action.stop()
      if (isValid) {
        this.log('\n\nObserved >= 1 API Interactions. Your test setup is valid')
      } else {
        this.error('\n\nNo API Interactions observed. Make sure you have added Optic to your test fixtures')
      }

    } catch (error) {
      return this.error(error)
    }
  }
}
