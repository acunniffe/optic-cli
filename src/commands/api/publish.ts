import {Command, flags} from '@oclif/command'
import {cli} from 'cli-ux'
// @ts-ignore
import * as gitState from 'git-state'
import * as path from 'path'

import {apiIdToTeamSlugAndApiSlug} from '../../common/api-id'
import {parseOpticYaml, readOpticYaml} from '../../common/config'
import {Credentials} from '../../common/credentials'
import {IOpticApiSnapshotRequest, OpticService} from '../../services/optic-publishing'

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

    let config
    try {
      config = parseOpticYaml(readOpticYaml())
      if (!config.api) {
        throw new Error('Your optic.yml is missing the api section')
      }
    } catch (error) {
      return this.error(error)
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

    // this.log(JSON.stringify(status))

    const snapshot: IOpticApiSnapshotRequest = {
      branch: status.branch,
      commitName: status.message,
      opticVersion: config.optic.version,
      published: shouldPublish,
      version: config.api.version,
      observations
    }
    cli.action.start('Uploading')
    const token = await new Credentials().get()
    if (token === null) {
      return this.error('Please add your Optic access token using credentials:add-token')
    }
    try {
      const opticService = new OpticService(config.optic.apiBaseUrl, () => ({token}))
      const {teamSlug, apiSlug} = apiIdToTeamSlugAndApiSlug(config.api.id)
      let uploadResult
      if (teamSlug) {
        uploadResult = await opticService.postTeamApiSnapshotByTeamSlugAndApiSlug(teamSlug, apiSlug, snapshot)
      } else {
        uploadResult = await opticService.postSelfApiSnapshotByApiSlug(apiSlug, snapshot)
      }
      if (uploadResult.statusCode !== 200) {
        return this.error(uploadResult.body)
      }
      cli.action.stop()

      this.log(`Upload complete! Opening your API Documentation on ${config.optic.baseUrl}`)
      //@TODO use a proper url joining and query builder...
      const query = `?branch=${uploadResult.body.branch}&version=${uploadResult.body.uuid}`
      if (teamSlug) {
        await cli.open(`${config.optic.baseUrl}/apis/${teamSlug}/${apiSlug}${query}`)
      } else {
        await cli.open(`${config.optic.baseUrl}/apis/${apiSlug}${query}`)
      }
    } catch (error) {
      return this.error(error)
    }
  }
}
