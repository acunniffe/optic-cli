// @ts-ignore
import {Client} from 'api-js-client'

export interface IOpticApiSnapshotRequest {
  observations: object
  opticVersion: string
  branch: string
  commitName: string
  version: string
  published: boolean
}

const OpticService = Client

export {
  OpticService
}
