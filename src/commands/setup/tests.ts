import {Command} from '@oclif/command'
import {IOpticYamlConfig} from '@useoptic/core/build/src/optic-config'
import {cli} from 'cli-ux'
// @ts-ignore
import * as niceTry from 'nice-try'

import {parseOpticYaml, readOpticYaml} from '../../common/config'
import {verifyTestSetup} from '../../setup-utilities/verify-test-setup'

export default class Tests extends Command {
  static description = 'validate that your tests log data to Optic'

  static flags = {}

  static args = [
    {
      name: 'testCmd',
      required: false,
      description: 'the command that runs your tests',
    }
  ]

  async run() {
    const {args} = this.parse(Tests)

    const config: IOpticYamlConfig = niceTry(() => parseOpticYaml(readOpticYaml())) || {strategy: {type: 'logging'}}

    if (args.testCmd) { //override the optic.yml
      config.strategy.commandToRun = args.testCmd
    }

    if (!config.strategy.commandToRun) {
      return this.error('Please specify a command to run your tests. ie. optic setup:tests "npm run tests" ')
    }

    this.log(`Running command: ${config.strategy.commandToRun} \n\n`)

    cli.action.start('Listening for API interactions in your tests')
    const isValid = await verifyTestSetup(config)
    cli.action.stop()
    if (isValid) {
      this.log('\n\nObserved >= 1 API Interactions. Your test setup is valid')
    } else {
      this.error('\n\nNo API Interactions observed. Make sure you have added Optic to your test fixtures')
    }
  }
}
