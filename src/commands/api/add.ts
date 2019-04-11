import {Command, flags} from '@oclif/command'
import {IOpticYamlConfig} from '@useoptic/core/build/src/optic-config'
import {cli} from 'cli-ux'

import {parseOpticYamlWithOriginal, readOpticYaml, writeOpticYaml} from '../../common/config'

export default class ApiAdd extends Command {
  static description = 'Add API dependencies to your project'

  static flags = {
    generate: flags.string({
      char: 'g',
      multiple: true,
      description: 'artifacts to generate',
      required: false,
    }),
    version: flags.string({
      char: 'v',
      description: 'API version to consume, defaults to "latest"',
      required: false,
      default: 'latest',
    }),
  }

  static args = [
    {
      name: 'api-id',
      required: true,
      description: '"org/api" or "api"',
    },
  ]

  async run() {
    const {args, flags} = this.parse(ApiAdd)
    const apiId = args['api-id']
    const version = flags.version
    const generate = flags.generate || []

    //
    let opticYamlContents
    try {
      opticYamlContents = readOpticYaml()
    } catch {
      opticYamlContents = JSON.stringify({consume: {}})
    }

    const {parsed} = parseOpticYamlWithOriginal(opticYamlContents)
    let newConfig: any = JSON.parse(JSON.stringify(parsed))

    //add consume if missing
    if (!newConfig.consume) {
      newConfig.consume = {}
    }

    const generateAsObject: any = {}

    for (let cogentId of generate) {
      const path = await cli.prompt(`Where do you want to generate '${cogentId}'? (ie src/managed/sdk)`)
      generateAsObject[cogentId] = path
    }

    //already in consumes object
    const manifestEntry = newConfig.consume[apiId]
    if (manifestEntry) {
      //update version. don't overwrite pinned version with latest
      if (version !== 'latest') { //
        manifestEntry.version = version
      }
      //put new generate keys onto object
      manifestEntry.generate = {...manifestEntry.generate, ...generateAsObject}
    } else {
      //add new entry for api
      newConfig.consume[apiId] = {
        version,
        generate: generateAsObject,
      }
    }

    writeOpticYaml(newConfig)

    this.log("\n\nDependencies have been added to your optic.yml file\n\nRun 'optic api:install' to generate them.")
  }
}
