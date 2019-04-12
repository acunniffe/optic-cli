import {Command} from '@oclif/command'
import {defaultAPM} from '../../api-packages/api-package-manager'
import {parseOpticYaml, readOpticYaml} from '../../common/config'
import { track } from '../../services/analytics/segment'
import {IOpticApiSnapshotRequest} from '../../services/optic'
import * as path from 'path'
import * as pJson from '../../../package.json'

export default class ApiPublish extends Command {
  static description = 'publish your API contract locally'

  static args = []

  async run() {
    const {flags} = this.parse(ApiPublish)

    const shouldPublish = !flags.draft

    let config = parseOpticYaml(readOpticYaml())

    if (!config.document) {
      throw new Error('You need a \'document\' section in your optic.yml to publish an API. https://docs.useoptic.com')
    }

    const cwd = process.cwd()
    const observations = require(path.join(cwd, '.optic/observations.json'))

    track('Api Publish Local')
    const snapshot: IOpticApiSnapshotRequest = {
      branch: '',
      commitName: '',
      opticVersion: pJson.version,
      published: shouldPublish,
      version: config.document.version || '0.0.0-alpha',
      observations,
    }

    const reuslt = await defaultAPM.localResolver().publish({
      org: config.document.api.org,
      id: config.document.api.id,
      snapshot,
    })
    if (reuslt.error) {
      this.log('Could not publish API locally ' + reuslt.error)
    }

  }
}
