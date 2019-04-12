import {Command, flags} from '@oclif/command'
import {ISessionManagerOptions} from '@useoptic/core/build/src/session-manager'
import {cli} from 'cli-ux'
// @ts-ignore
import * as colors from 'colors/safe'
import * as path from 'path'

import {writeOpticYaml} from '../../common/config'
import {track} from '../../services/analytics/segment'
import {verifyTestSetup} from '../../setup-utilities/verify-test-setup'

export default class Init extends Command {
  static description = 'setup an optic project'

  static flags = {
    id: flags.string({required: false})
  }

  static args = []

  async run() {
    const {flags} = this.parse(Init)
    this.log(colors.bold('Setup Optic to document your API \n'))
    const run_tests = await cli.prompt('the command that runs your tests')
    let id: string
    if (!flags.id) {
      id = await cli.prompt('api name in slug format (ie my-api)')
    } else {
      id = flags.id
    }
    const version = await cli.prompt('current semantic version of the api (ie 1.0.0)')

    const yaml = {
      document: {
        id,
        version,
        run_tests,
        paths: [],
      },
    }

    track('Running Init')

    writeOpticYaml(yaml)

    this.log(colors.green('\noptic.yml config file created at:'))
    this.log(colors.green(`${path.join(process.cwd(), 'optic.yml')}`))

    let testSetupValid = false
    let runOnce = false
    // @ts-ignore
    cli.wait(380)

    while (!testSetupValid) {

      const message = (!runOnce) ? `\n\nOptic can check if you have installed the Optic documenting library for your API correctly (https://docs.useoptic.com/#/example-fixtures/).\nPress ${colors.bold('enter')} to verify your setup or ${colors.bold('q')} to quit` : `The documenting library is not setup up properly (https://docs.useoptic.com/#/example-fixtures/). \nPress ${colors.bold('enter')} to run again or ${colors.bold('q')} to quit`

      track('Init Test Verify Loop', {testSetupValid})
      // @ts-ignore
      await cli.anykey(message)

      const sessionConfig: ISessionManagerOptions = {
        strategy: {
          type: 'logging',
          commandToRun: run_tests,
        },
        api: {
          paths: [],
        },
      }

      cli.action.start('Checking if Optic library is setup')
      const isValid = await verifyTestSetup(sessionConfig)
      cli.action.stop()

      this.log((isValid) ?
        colors.green('\nDocumenting library setup properly. Test data is logging to Optic. Nice work :)') :
        colors.red('\nNo test data was logged to Optic. Check your setup.'))

      runOnce = true
      testSetupValid = isValid
    }

    this.log(colors.green('\nOptic is setup! Try running optic api:document'))
  }
}
