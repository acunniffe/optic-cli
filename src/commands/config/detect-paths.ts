import { Command } from '@oclif/command'
import { IOpticYamlConfig } from '@useoptic/core/build/src/optic-config'

import { parseOpticYaml, readOpticYaml } from '../../common/config'
import { inferPaths } from '../../setup-utilities/infer-paths'
import { verifyTestSetup } from '../../setup-utilities/verify-test-setup'
import { cli } from 'cli-ux'

export default class Config extends Command {
  static description = 'detect API paths by running tests'

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

      cli.action.start('Collecting Paths from the API interactions in your tests')
      const paths = await inferPaths(config)
      cli.action.stop()

      this.log('Detected API Paths. If, correct, include these in your optic.yml file:\n\n')
      this.log(paths.map(i => `  - ${i}`).join('\n'))

    } catch (error) {
      return this.error(error)
    }
  }
}
