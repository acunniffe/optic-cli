import {Command} from '@oclif/command'
import {ISessionManagerOptions} from '@useoptic/core/build/src/session-manager'
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
    },
  ]

  async run() {
    const {args} = this.parse(Tests)

    // @ts-ignore
    const yamlDefinedCommand = niceTry(() => parseOpticYaml(readOpticYaml()).document.run_tests)

    this.log('in yaml' + yamlDefinedCommand)

    const command = args.testCmd || yamlDefinedCommand

    const sessionConfig: ISessionManagerOptions = {
      strategy: {
        type: 'logging',
        commandToRun: command,
      },
      api: {
        paths: [],
      },
    }

    if (!command) {
      return this.error('Please specify the command that runs your tests. ie. optic setup:tests "npm run tests" ')
    }

    this.log('Running command: ' + command)

    cli.action.start('Listening for API interactions in your tests')
    const isValid = await verifyTestSetup(sessionConfig)
    cli.action.stop()
    if (isValid) {
      this.log('\n\nObserved >= 1 API Interactions. Your test setup is valid')
    } else {
      this.error('No API Interactions observed. Make sure you have added Optic to your test fixtures')
    }
  }
}
