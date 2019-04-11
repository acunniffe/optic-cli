import {Command} from '@oclif/command'
import {IOpticYamlConfig} from '@useoptic/core/build/src/optic-config'
import {cli} from 'cli-ux'

import {apiIdToName, getApiVersion} from '../../common/api'
import {parseOpticYamlWithOriginal, readOpticYaml, writeOpticYaml} from '../../common/config'
import {Credentials} from '../../common/credentials'
import {OpticService} from '../../services/optic'

export default class ApiUpdate extends Command {
  static description = 'Checks if any API dependencies need updates'

  static flags = {}

  static args = []

  async run() {
    let config: IOpticYamlConfig
    let opticYamlContents
    try {
      opticYamlContents = readOpticYaml()
    } catch {
      opticYamlContents = JSON.stringify({consume: {}})
    }

    const {parsed, validated} = parseOpticYamlWithOriginal(opticYamlContents)
    config = validated
    const token = await new Credentials().get()
    if (token === null) {
      return this.error('Please login to optic using \'optic auth:login\'')
    }
    const opticService = new OpticService(config.optic.apiBaseUrl, () => ({token}))

    let newConfig: any = JSON.parse(JSON.stringify(parsed))
    //flatten distinctly
    const currentVersions: any = validated.dependencies
      .reduce((acc, dependency) => {
        // @ts-ignore
        acc[apiIdToName(dependency.api)] = {
          apiId: dependency.api,
          version: dependency.version,
        }
        return acc
      }, {})

    const toUpdate = []

    cli.action.start('Fetching new versions')

    for (let api of Object.values(currentVersions)) {
      //still use this and not APM for now since locals shouldn't overwrite
      // @ts-ignore
      const apiVersion = await getApiVersion(opticService, api.apiId, 'latest')
      // @ts-ignore
      if (apiVersion.statusCode === 200 && apiVersion.body.info.version !== api.version) {
        // @ts-ignore
        toUpdate.push({api: api.apiId, currentVersion: api.version, latestVersion: apiVersion.body.info.version})
      }
    }

    cli.action.stop('Finished')

    if (toUpdate.length === 0) {
      this.log('All APIs are up to date')
    } else {
      this.log(`${toUpdate.length} API is out of date`)

      for (let api of toUpdate) {
        let atLeastOneUpdated = false
        const confirmed = await cli.confirm(`${apiIdToName(api.api)} can be updated ${api.currentVersion} -> ${api.latestVersion}. Continue? y/n`)
        if (confirmed) {
          atLeastOneUpdated = true
          newConfig.consume[apiIdToName(api.api)].version = api.latestVersion
        }

        writeOpticYaml(newConfig)

        if (atLeastOneUpdated) {
          this.log('\nBumped versions in optic.yml. Run "optic api:install to" update the artifacts.')
        }

      }
    }

  }
}
