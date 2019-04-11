import {
  IApiResolver,
  IResolverPublishRequest, IResolverPublishResult,
  IResolverReadRequest,
  IResolverReadRequestResult,
} from './resolver-types'

import * as path from 'path'
import * as fs from 'fs-extra'
import undefinedError = Mocha.utils.undefinedError
// @ts-ignore
import * as unirest from 'unirest'

export const defaultLocalRegistry = path.join(require('os').homedir(), '.optic-local-registry')

export class LocalResolver implements IApiResolver {
  readonly isLocal: boolean = true
  readonly name: string = 'local'
  readonly _path: string

  constructor(registryPath?: string) {
    this._path = registryPath || defaultLocalRegistry
  }

  async lookup(lookupRequest: IResolverReadRequest, credentials?: string, baseUrl?: string): Promise<IResolverReadRequestResult> {
    this.ensureDirectory()

    const apiPath = this.apiPath(lookupRequest.id, lookupRequest.version, lookupRequest.org)

    if (fs.existsSync(apiPath)) {
      const {observations} = JSON.parse(fs.readFileSync(apiPath).toString())

      //@todo -- figure out cert issue so we can use a nicer domain. This currently uses SSL and is safe
      const response = await unirest
        .post(`https://01w48ovnq4.execute-api.us-east-2.amazonaws.com/production/observations-to-graph`)
        .headers('content-type', 'application/json')
        .send({observations: observations, query: this.gqlQuery})

      const body = response.body

      if (body.snapshot) {
        return { success: true, snapshot: body.snapshot }
      } else {
        return { success: false, error: body }
      }

    } else {
      return { success: false }
    }
  }

  async publish(request: IResolverPublishRequest, credentials?: string, baseUrl?: string): Promise<IResolverPublishResult> {
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

    return { success: true }
  }

  ensureDirectory = () => fs.ensureDirSync(this._path)
  apiPath = (id: string, version: string, org?: string): string => {
    const fileName = `${(org) ? (org + '/') : ''}${id}@${version}`

    return path.join(this._path, fileName)
  }

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

}
