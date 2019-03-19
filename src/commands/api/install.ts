import {Command, flags} from '@oclif/command'
import {IOpticYamlConfig} from '@useoptic/core/build/src/optic-config'
import {cli} from 'cli-ux'

import {generateArtifact} from '../../common/api'
import {parseOpticYaml, readOpticYaml} from '../../common/config'
import {Credentials} from '../../common/credentials'
import {OpticService} from '../../services/optic-publishing'

export default class ApiInstall extends Command {
  static description = 'Generates artifacts (Swagger/OAS, SDKs, etc.) for the APIs that have been added via api:add'

  static flags = {
    outputDirectory: flags.string({
      char: 'o',
      description: 'directory to output generated artifacts (Swagger/OAS, SDKs, etc.)',
      required: true
    }),
  }

  static args = []

  async run() {
    const {flags} = this.parse(ApiInstall)

    let config: IOpticYamlConfig
    try {
      config = parseOpticYaml(readOpticYaml())
    } catch (error) {
      return this.error(error)
    }

    const token = await new Credentials().get()
    if (token === null) {
      return this.error('Please add your Optic access token using credentials:add-token')
    }
    const opticService = new OpticService(config.optic.apiBaseUrl, () => ({token}))

    cli.action.start('Generating artifacts')
    await generateArtifact(flags.outputDirectory, opticService, config, this)
    cli.action.stop()
  }

}
