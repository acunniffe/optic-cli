import * as fs from 'fs-extra'
import * as path from 'path'
import {
  IApiResolver,
  IResolverPublishRequest, IResolverPublishResult,
  IResolverReadRequest,
  IResolverReadRequestResult,
} from './resolver-types'
import {
  defaultQuery,
  defaultSnapshotRepository,
  observationsToGqlResponse
} from '@useoptic/core'

export const defaultLocalRegistry = path.join(require('os').homedir(), '.optic-local-registry')

export class LocalResolver implements IApiResolver {
  readonly isLocal: boolean = true
  readonly name: string = 'local'
  readonly _path: string

  constructor(registryPath?: string) {
    this._path = registryPath || defaultLocalRegistry
  }

  async lookup(lookupRequest: IResolverReadRequest, _credentials?: string, _baseUrl?: string): Promise<IResolverReadRequestResult> {
    this.ensureDirectory()

    const apiPath = this.apiPath(lookupRequest.id, lookupRequest.version, lookupRequest.org)

    if (fs.existsSync(apiPath)) {
      const {observations} = JSON.parse(fs.readFileSync(apiPath).toString())
      const body = await this.observationsToGraph(observations)
      if (body.snapshot) {
        return {success: true, snapshot: body.snapshot}
      } else {
        return {success: false, error: body}
      }

    } else {
      return {success: false}
    }
  }

  async publish(request: IResolverPublishRequest, _credentials?: string, _baseUrl?: string): Promise<IResolverPublishResult> {
    this.ensureDirectory()

    const apiPath = this.apiPath(request.id, request.snapshot.version, request.org)

    const persist = {
      info: {
        version: request.snapshot.version,
        published: true,
      },
      observations: request.snapshot.observations,
    }

    fs.ensureFileSync(apiPath)

    fs.writeJSONSync(apiPath, persist)
    console.log('Published to local registry ' + apiPath)

    return {success: true}
  }

  async observationsToGraph(observations: any[]): Promise<any> {
    const gqlResponse = await observationsToGqlResponse(defaultSnapshotRepository(observations), defaultQuery('zzz'))
    return gqlResponse.data
  }

  ensureDirectory = () => fs.ensureDirSync(this._path)
  apiPath = (id: string, version: string, org?: string): string => {
    const fileName = `${(org) ? (org + '/') : ''}${id}@${version}`

    return path.join(this._path, fileName)
  }

}
