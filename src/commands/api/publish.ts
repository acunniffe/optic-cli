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
  static description = 'publish your API contract to Optic'

  static flags = {
    draft: flags.boolean({char: 'd'}),
  }

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

    let status: IRepositoryState = {
      isDirty: false,
      branch: 'master',
      message: 'HEAD'
    }
    cli.action.start('Checking git status')
    let isGitRepository = false
    try {
      isGitRepository = await promisify<boolean>(cb => gitState.isGit(cwd, (result: boolean) => cb(null, result)))
    } catch (e) {
      return this.error(e)
    }

    if (isGitRepository) {
      try {
        const state = await promisify<{ branch: string, dirty: number }>(cb => gitState.check(cwd, cb))
        const lastCommitMessage = await promisify<string>(cb => gitState.message(cwd, cb))
        status.isDirty = state.dirty > 0
        status.message = lastCommitMessage || 'HEAD'
        status.branch = state.branch
      } catch (e) {
        return this.error(e)
      }
    }
    cli.action.stop()

    if (shouldPublish && status.isDirty) {
      this.warn('There are uncommitted changes. Please make sure this is intended.')
    }

    const snapshot: IOpticApiSnapshotRequest = {
      branch: status.branch,
      commitName: status.message,
      opticVersion: pJson.version,
      published: shouldPublish,
      version: config.document.version || '0.0.0-alpha',
      observations
    }

    cli.action.start('Uploading')
    const token = await new Credentials().get()
    if (token === null) {
      return this.error('Not authenticated. Please login to your Optic account by running optic auth:login')
    }
    try {

      const opticRegistry = defaultAPM.resolverByName('optic-registry')

      const {org, id} = config.document.api

      const publishResult = await opticRegistry.publish({org, id, snapshot}, token, config.optic.apiBaseUrl)

      if (!publishResult.success) {
        return this.error(publishResult.error)
      }

      cli.action.stop()

      this.log(`Upload complete! Opening your API Documentation on ${config.optic.baseUrl}`)
      let url
      if (shouldPublish) {
        if (org) {
          url = (`${config.optic.baseUrl}/orgs/${org}/apis/${id}/versions/${config.document.version}`)
        } else {
          url = (`${config.optic.baseUrl}/me/apis/${id}/versions/${config.document.version}`)
        }
      } else {
        const snapshotId = publishResult.uploadResult.uuid
        if (org) {
          url = (`${config.optic.baseUrl}/orgs/${org}/apis/${id}/snapshots/${snapshotId}`)
        } else {
          url = (`${config.optic.baseUrl}/me/apis/${id}/snapshots/${snapshotId}`)
        }
      }

      cli.log(url)
      await cli.open(url)
    } catch (error) {
      return this.error(error)
    }
  }
}
