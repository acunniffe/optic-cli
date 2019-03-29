import { Command } from '@oclif/command'
import { IOpticYamlConfig } from '@useoptic/core/build/src/optic-config'

import { parseOpticYaml, readOpticYaml } from '../../common/config'
import { inferPaths } from '../../setup-utilities/infer-paths'
import { verifyTestSetup } from '../../setup-utilities/verify-test-setup'
import { cli } from 'cli-ux'
import * as niceTry from 'nice-try'

export default class Paths extends Command {
  static description = 'detect API paths by running tests'

  static flags = {}

  static args = [
    {
      name: 'testCmd',
      required: false,
      description: 'the command that runs your tests',
    }
  ]

  async run() {

    const {args} = this.parse(Paths)

    const config: IOpticYamlConfig = niceTry(() => parseOpticYaml(readOpticYaml())) || { strategy: {type: 'logging'} }

  if (args.testCmd) { //override the optic.yml
    config.strategy.commandToRun = args.testCmd
  }

  if (!config.strategy.commandToRun) {
    return this.error(`Please specify a command to run your tests. ie. optic setup:tests "npm run tests" `)
  }

    this.log('Running command: '+config.strategy.commandToRun)

    cli.action.start('Collecting Paths from the API interactions in your tests')
    const paths = await inferPaths(config)
    cli.action.stop()

    this.log('Detected API Paths. If, correct, include these in your optic.yml file:\n\n')
    this.log(paths.map(i => `  - ${i}`).join('\n'))

  }
}
