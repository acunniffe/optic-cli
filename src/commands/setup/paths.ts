import {Command} from '@oclif/command'
import {ISessionManagerOptions} from '@useoptic/core/build/src/session-manager'
import {cli} from 'cli-ux'
// @ts-ignore
import * as niceTry from 'nice-try'

import {parseOpticYaml, readOpticYaml} from '../../common/config'
import analytics from '../../services/analytics/segment'
import {inferPaths} from '../../setup-utilities/infer-paths'

export default class Paths extends Command {
  static description = 'detect API paths by running tests'

  static flags = {}

  static args = [
    {
      name: 'testCmd',
      required: false,
      description: 'the command that runs your tests',
    },
  ]

  async run() {
    const {args} = this.parse(Paths)

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
      return this.error('Please specify the command that runs your tests. ie. optic setup:paths "npm run tests" ')
    }

    this.log('Running command: ' + command)

    cli.action.start('Collecting Paths from the API interactions in your tests')
    const paths = await inferPaths(sessionConfig)
    cli.action.stop()

    analytics.track('Setup Paths', {paths: paths.length})
    this.log('Detected API Paths. If, correct, include these in your optic.yml file:\n\n')
    this.log(paths.map(i => `  - ${i}`).join('\n'))

  }
}
