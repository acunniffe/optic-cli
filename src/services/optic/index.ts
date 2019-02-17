import * as requestPromise from 'request-promise-native'

const baseUrl = 'https://api.useoptic.com'

export interface IOpticApiSnapshot {
  snapshot: object
  opticVersion: string
  branch: string
  commitName: string
  published: boolean
}

function postJsonWithToken(token: string, url: string, body: object) {
  const headers = {
    Authorization: `Bearer ${token}`
  }
  require('debug')('developer')(token)

  return requestPromise
    .defaults({baseUrl})
    .post(url, {headers, body, json: true})
}

class OpticService {
  static saveSnapshot(token: string, projectName: string, snapshot: IOpticApiSnapshot) {
    return postJsonWithToken(token, `/apis/${projectName}/snapshot`, snapshot)
  }
}

export {
  OpticService
}
