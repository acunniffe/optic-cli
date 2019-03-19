import {Command, flags} from '@oclif/command'
import {IOpticApiDependency, IOpticYamlConfig} from '@useoptic/core/build/src/optic-config'
import {cli} from 'cli-ux'

import {generateArtifact, getApiVersion} from '../../common/api'
import {parseOpticYaml, parseOpticYamlWithOriginal, readOpticYaml, writeOpticYaml} from '../../common/config'
import {Credentials} from '../../common/credentials'
import {OpticService} from '../../services/optic-publishing'

export default class ApiAdd extends Command {
  static description = 'Install an Optic API and generate artifacts (Swagger/OAS, SDKs, etc.)'

  static flags = {
    outputDirectory: flags.string({
      char: 'o',
      description: 'directory to output generated artifacts (Swagger/OAS, SDKs, etc.)',
      required: false
    }),
  }

  static args = [
    {
      name: 'apiId',
      required: true,
      description: '"team/api" or "api"'
    },
    {
      name: 'apiVersion',
      required: true,
      description: 'the version of "apiId" you want to consume'
    }
  ]

  async run() {
    const {args, flags} = this.parse(ApiAdd)

    let config: IOpticYamlConfig
    let opticYamlContents
    try {
      opticYamlContents = readOpticYaml()
    } catch {
      opticYamlContents = JSON.stringify({dependencies: []})
    }
    const {parsed, validated} = parseOpticYamlWithOriginal(opticYamlContents)
    config = validated
    const token = await new Credentials().get()
    if (token === null) {
      return this.error('Please add your Optic access token using credentials:add-token')
    }
    const opticService = new OpticService(config.optic.apiBaseUrl, () => ({token}))

    // ensure input was valid
    try {
      await getApiVersion(opticService, args.apiId, args.apiVersion)
    } catch (error) {
      return this.error(error)
    }

    // merge into optic.yml
    let newConfig: IOpticYamlConfig = JSON.parse(JSON.stringify(parsed))
    const existingApi = newConfig.dependencies
      .find((dependency: IOpticApiDependency) => dependency.id === args.apiId)

    if (existingApi) {
      existingApi.version = args.apiVersion
    } else {
      newConfig.dependencies.push({id: args.apiId, version: args.apiVersion})
    }

    writeOpticYaml(newConfig)

    this.log(`added ${args.apiId}@${args.apiVersion}!`)
    if (flags.outputDirectory) {
      cli.action.start('Generating artifacts')
      await generateArtifact(flags.outputDirectory, opticService, newConfig, this)
      cli.action.stop()
    }
  }
}
