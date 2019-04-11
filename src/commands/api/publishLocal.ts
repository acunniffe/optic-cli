import {Command, flags} from '@oclif/command'
import {cli} from 'cli-ux'
// @ts-ignore]
import * as gitState from 'git-state'
import * as path from 'path'
import * as pJson from '../../../package.json'
import { defaultAPM } from '../../api-packages/api-package-manager'

import {apiIdToTeamSlugAndApiSlug} from '../../common/api-id'
import {parseOpticYaml, readOpticYaml} from '../../common/config'
import {Credentials} from '../../common/credentials'
import {IOpticApiSnapshotRequest, OpticService} from '../../services/optic'

interface IRepositoryState {
  isDirty: boolean
  branch: string
  message: string
}

export type Callback<T> = (error: Error | null, result?: T) => void

function promisify<T>(f: (cb: Callback<T>) => any) {
  return new Promise<T>((resolve, reject) => {
    return f((err, result) => {
      if (err) {
        return reject(err)
      }
      resolve(result)
    })
  })
}

export default class ApiPublish extends Command {
  static description = 'publish your API contract locally'

  static args = []

  async run() {
    const {flags} = this.parse(ApiPublish)

    const shouldPublish = !flags.draft

    let config = parseOpticYaml(readOpticYaml())

    if (!config.document) {
      throw new Error("You need a 'document' section in your optic.yml to publish an API. https://docs.useoptic.com")
    }

    const cwd = process.cwd()
    const observations = require(path.join(cwd, '.optic/observations.json'))

    const snapshot: IOpticApiSnapshotRequest = {
      branch: '',
      commitName: '',
      opticVersion: pJson.version,
      published: shouldPublish,
      version: config.document.version || '0.0.0-alpha',
      observations
    }


    const reuslt = await defaultAPM.localResolver().publish({org: config.document.api.org, id: config.document.api.id, snapshot})
    if (reuslt.error) {
      this.log('Could not publish API locally '+reuslt.error)
    }

  }
}
