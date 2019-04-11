import {IOpticApiSnapshotRequest} from '../../services/optic'

export interface IResolverPublishRequest {
  org?: string
  id: string
  snapshot: IOpticApiSnapshotRequest
}

export interface IResolverPublishResult {
  success: boolean
  uploadResult?: any,
  error?: any
}

export interface IResolverReadRequest {
  org?: string
  id: string
  version: string
}

export interface IResolverReadRequestResult {
  success: boolean
  snapshot?: any
  error?: any
}

export interface IApiResolver {
  publish(request: IResolverPublishRequest, credentials?: string, baseUrl?: string): Promise<IResolverPublishResult>

  lookup(lookupRequest: IResolverReadRequest, credentials?: string, baseUrl?: string): Promise<IResolverReadRequestResult>

  isLocal: boolean,
  name: string,
}
