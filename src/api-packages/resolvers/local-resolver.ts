import * as fs from 'fs-extra'
import * as path from 'path'
// @ts-ignore
import * as unirest from 'unirest'
// @ts-ignore
import {gzip, ungzip} from 'node-gzip'
import {
  IApiResolver,
  IResolverPublishRequest, IResolverPublishResult,
  IResolverReadRequest,
  IResolverReadRequestResult,
} from './resolver-types'

export const defaultLocalRegistry = path.join(require('os').homedir(), '.optic-local-registry')

export class LocalResolver implements IApiResolver {
  readonly isLocal: boolean = true
  readonly name: string = 'local'
  readonly _path: string

  private readonly gqlQuery: string = `
              query {
                snapshot(snapshotId: "current") {
                    endpoints {
                        nameKey
                        path
                        method
                        securityDefinitions {
                            nameKey
                            definition
                        }
                        request {
                            nameKey
                            headerParameters {
                                nameKey
                                name
                                schema {
                                    asJsonSchema
                                }
                            }
                            pathParameters {
                                nameKey
                                name
                                schema {
                                    asJsonSchema
                                }
                            }
                            queryParameters {
                                nameKey
                                name
                                schema {
                                    asJsonSchema
                                }
                            }
                            bodies {
                                nameKey
                                contentType
                                schema {
                                    asJsonSchema
                                }
                            }
                        }
                        responses {
                            nameKey
                            statusCode
                            bodies {
                                nameKey
                                contentType
                                schema {
                                    asJsonSchema
                                }
                            }
                        }
                    }
                    securityDefinitions {
                        nameKey
                        definition
                    }
                }
            }
  `.trim()

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
    const compressed = await gzip(JSON.stringify({observations, query: this.gqlQuery}))
    const requestBody = JSON.stringify({compressed})

    // @todo -- figure out cert issue so we can use a nicer domain. This currently uses SSL and is safe
    const response = await unirest
      .post('https://01w48ovnq4.execute-api.us-east-2.amazonaws.com/production/observations-to-graph')
      .headers('content-type', 'application/json')
      .send(requestBody)

    return response.body
  }

  ensureDirectory = () => fs.ensureDirSync(this._path)
  apiPath = (id: string, version: string, org?: string): string => {
    const fileName = `${(org) ? (org + '/') : ''}${id}@${version}`

    return path.join(this._path, fileName)
  }

}
