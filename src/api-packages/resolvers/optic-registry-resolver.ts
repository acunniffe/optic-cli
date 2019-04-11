import { apiIdToName } from '../../common/api'
import { OpticService } from '../../services/optic'
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

export class OpticRegistryResolver implements IApiResolver {
  readonly isLocal: boolean = false
  readonly name: string = 'optic-registry'
  async lookup(lookupRequest: IResolverReadRequest, credentials?: string, baseUrl?: string): Promise<IResolverReadRequestResult> {

    const opticService = new OpticService(baseUrl || 'https://api.useoptic.com', () => ({token: credentials || ''}))
    const {org, id, version} = lookupRequest

    let snapshotResponse
    if (org) {
      snapshotResponse = await opticService.getTeamApiVersionByTeamSlugAndApiSlugAndVersion(org, id, version)
    } else {
      snapshotResponse = await opticService.getSelfApiVersionByApiSlugAndVersion(id, version)
    }

    console.log(snapshotResponse.statusCode)
    console.log(snapshotResponse.body)


    if (snapshotResponse.statusCode === 200) {
      return {success: true, snapshot: snapshotResponse.body.gqlResponse.snapshot}
    } else {
      return {success: false, error: `Please ensure API "${apiIdToName({org, id})}" version "${version}" has been published.`}
    }

  }

  async publish(request: IResolverPublishRequest, credentials?: string, baseUrl?: string): Promise<IResolverPublishResult> {

    const opticService = new OpticService(baseUrl || 'https://api.useoptic.com', () => ({token: credentials || ''}))

    let uploadResult;
    const {org, id} = request
    if (org) {
      uploadResult = await opticService.postTeamApiSnapshotByTeamSlugAndApiSlug(org, id, request.snapshot)
    } else {
      uploadResult = await opticService.postSelfApiSnapshotByApiSlug(id, request.snapshot)
    }
    if (uploadResult.statusCode !== 200) {
      return {success: false, error: uploadResult.body}
    } else {
      return {success: true, uploadResult: uploadResult.body}
    }

  }

}
