import * as requestPromise from 'request-promise-native'

export interface IOpticApiSnapshot {
  observations: object
  opticVersion: string
  branch: string
  commitName: string
  published: boolean
}

class JsonHttpClient {
  private readonly baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  postJsonWithToken(token: string, url: string, body: object) {
    const headers = {
      Authorization: `Bearer ${token}`
    }

    return requestPromise
      .post(url, {
        baseUrl: this.baseUrl,
        headers,
        body,
        json: true,
      })
  }
}

class OpticService {
  private readonly httpClient: JsonHttpClient

  constructor(baseUrl: string) {
    this.httpClient = new JsonHttpClient(baseUrl)
  }

  saveSnapshot(token: string, snapshot: IOpticApiSnapshot, apiId: string, teamId?: string) {
    if (teamId) {
      return this.httpClient.postJsonWithToken(token, `/teams/${teamId}/apis/${apiId}/snapshots`, snapshot)
    } else {
      return this.httpClient.postJsonWithToken(token, `/self/apis/${apiId}/snapshots`, snapshot)
    }
  }
}

export {
  OpticService,
  JsonHttpClient
}
