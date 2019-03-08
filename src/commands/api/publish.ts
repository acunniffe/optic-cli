import {Command, flags} from '@oclif/command'
import {cli} from 'cli-ux'
// @ts-ignore
import * as gitState from 'git-state'

import {parseOpticYaml, readOpticYaml, readOutput} from '../../common/config'
import {Credentials} from '../../common/credentials'
import {IOpticApiSnapshot, OpticService} from '../../services/optic'

interface IRepositoryState {
  isDirty: boolean
  branch: string
  message: string
}

type Callback<T> = (error: Error | null, result?: T) => void

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
    } catch (error) {
      return this.error(error)
    }

    const cwd = process.cwd()
    let observations
    try {
      const observationsText = readOutput('observations.json')
      observations = JSON.parse(observationsText.toString())
    } catch {
      return this.error('I couldn\'t find any Optic API documentation. Please make sure you have run api:document before you publish')
    }

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
      return this.error('Sorry, I am not able to publish when there are uncommitted changes. Please commit your changes and try again.')
    }

    // this.log(JSON.stringify(status))

    const snapshot: IOpticApiSnapshot = {
      branch: status.branch,
      commitName: status.message,
      opticVersion: config.optic.version,
      published: shouldPublish,
      observations
    }
    cli.action.start('Uploading...')
    const token = await new Credentials().get()
    if (token === null) {
      return this.error('Please add your Optic access token using credentials:add-token')
    }
    try {
      const splitApiId = config.api.id.split('/')
      const apiId = splitApiId[splitApiId.length - 1]
      const teamId = (splitApiId.length === 2) ? splitApiId[0] : undefined
      const uploadResult = await new OpticService(config.optic.apiBaseUrl).saveSnapshot(token, snapshot, apiId, teamId)
      cli.action.stop()
      this.log('Upload complete! Opening your API Documentation on ' + config.optic.baseUrl)
      const query = `?branch=${uploadResult.branch}&version=${uploadResult.uuid}`
      if (teamId) {
        await cli.open(`${config.optic.baseUrl}apis/${teamId}/${apiId}${query}`)
      } else {
        await cli.open(`${config.optic.baseUrl}apis/${apiId}${query}`)
      }
    } catch (error) {
      this.error(error)
    }
  }
}
