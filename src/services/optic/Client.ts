const unirest = require('unirest')

class Client {
  private getCredentials: () => PromiseLike<any>
  private baseUrl: string

  constructor(baseUrl: string, getCredentials: () => PromiseLike<any>) {
    this.baseUrl = baseUrl
    this.getCredentials = getCredentials
  }

  postSelfApi(selfApi: any) {
    return Promise
      .resolve(this.getCredentials())
      .then((_credentials: { token: string }) => {
        return unirest
          .post(`${this.baseUrl}/self/apis`)
          .header('Authorization', `Bearer ${_credentials.token}`)
          .headers('content-type', 'application/json')
          .send(selfApi)
      })
  }

  getTeamByTeamSlug(teamSlug: string) {
    return Promise
      .resolve(this.getCredentials())
      .then((_credentials: { token: string }) => {
        return unirest
          .get(`${this.baseUrl}/teams/${teamSlug}`)
          .header('Authorization', `Bearer ${_credentials.token}`)
      })
  }

  postSelfApiSnapshotByApiSlug(apiSlug: string, selfApiSnapshot: string) {
    return Promise
      .resolve(this.getCredentials())
      .then((_credentials: { token: string }) => {
        return unirest
          .post(`${this.baseUrl}/self/apis/${apiSlug}/snapshots`)
          .header('Authorization', `Bearer ${_credentials.token}`)
          .headers('content-type', 'application/json')
          .send(selfApiSnapshot)
      })
  }

  postTeamApiSnapshotByTeamSlugAndApiSlug(teamSlug: string, apiSlug: string, teamApiSnapshot: any) {
    return Promise
      .resolve(this.getCredentials())
      .then((_credentials: { token: string }) => {
        return unirest
          .post(`${this.baseUrl}/teams/${teamSlug}/apis/${apiSlug}/snapshots`)
          .header('Authorization', `Bearer ${_credentials.token}`)
          .headers('content-type', 'application/json')
          .send(teamApiSnapshot)
      })
  }

  getSelfApiVersionByApiSlugAndVersion(apiSlug: string, version: string) {
    return Promise
      .resolve(this.getCredentials())
      .then((_credentials: { token: string }) => {
        return unirest
          .get(`${this.baseUrl}/self/apis/${apiSlug}/versions/${version}`)
          .header('Authorization', `Bearer ${_credentials.token}`)
      })
  }

  getTeamApiVersionByTeamSlugAndApiSlugAndVersion(teamSlug: string, apiSlug: string, version: string) {
    return Promise
      .resolve(this.getCredentials())
      .then((_credentials: { token: string }) => {
        return unirest
          .get(`${this.baseUrl}/teams/${teamSlug}/apis/${apiSlug}/versions/${version}`)
          .header('Authorization', `Bearer ${_credentials.token}`)
      })
  }

  postTeamInviteAcceptByTeamSlug(teamSlug: string, teamInviteAccept: any) {
    return Promise
      .resolve(this.getCredentials())
      .then((_credentials: { token: string }) => {
        return unirest
          .post(`${this.baseUrl}/teams/${teamSlug}/invite/accept`)
          .header('Authorization', `Bearer ${_credentials.token}`)
          .headers('content-type', 'application/json')
          .send(teamInviteAccept)
      })
  }

  getSelfApiByApiSlug(apiSlug: string) {
    return Promise
      .resolve(this.getCredentials())
      .then((_credentials: { token: string }) => {
        return unirest
          .get(`${this.baseUrl}/self/apis/${apiSlug}`)
          .header('Authorization', `Bearer ${_credentials.token}`)
      })
  }

  getTeamApiByTeamSlugAndApiSlug(teamSlug: string, apiSlug: string) {
    return Promise
      .resolve(this.getCredentials())
      .then((_credentials: { token: string }) => {
        return unirest
          .get(`${this.baseUrl}/teams/${teamSlug}/apis/${apiSlug}`)
          .header('Authorization', `Bearer ${_credentials.token}`)
      })
  }

  getSelf() {
    return Promise
      .resolve(this.getCredentials())
      .then((_credentials: { token: string }) => {
        return unirest
          .get(`${this.baseUrl}/self`)
          .header('Authorization', `Bearer ${_credentials.token}`)
      })
  }

  postTeamInviteByTeamSlug(teamSlug: string, teamInvite: any) {
    return Promise
      .resolve(this.getCredentials())
      .then((_credentials: { token: string }) => {
        return unirest
          .post(`${this.baseUrl}/teams/${teamSlug}/invite`)
          .header('Authorization', `Bearer ${_credentials.token}`)
          .headers('content-type', 'application/json')
          .send(teamInvite)
      })
  }

  getSelfMemberships() {
    return Promise
      .resolve(this.getCredentials())
      .then((_credentials: { token: string }) => {
        return unirest
          .get(`${this.baseUrl}/self/memberships`)
          .header('Authorization', `Bearer ${_credentials.token}`)
      })
  }

  postTeam(team: any) {
    return Promise
      .resolve(this.getCredentials())
      .then((_credentials: { token: string }) => {
        return unirest
          .post(`${this.baseUrl}/teams`)
          .header('Authorization', `Bearer ${_credentials.token}`)
          .headers('content-type', 'application/json')
          .send(team)
      })
  }

  getSelfApiSnapshotByApiSlugAndSnapshotId(apiSlug: string, snapshotId: string) {
    return Promise
      .resolve(this.getCredentials())
      .then((_credentials: { token: string }) => {
        return unirest
          .get(`${this.baseUrl}/self/apis/${apiSlug}/snapshots/${snapshotId}`)
          .header('Authorization', `Bearer ${_credentials.token}`)
      })
  }

  getSelfApiTokens() {
    return Promise
      .resolve(this.getCredentials())
      .then((_credentials: { token: string }) => {
        return unirest
          .get(`${this.baseUrl}/self/api-tokens`)
          .header('Authorization', `Bearer ${_credentials.token}`)
      })
  }

  postSelfApiToken() {
    return Promise
      .resolve(this.getCredentials())
      .then((_credentials: { token: string }) => {
        return unirest
          .post(`${this.baseUrl}/self/api-tokens`)
          .header('Authorization', `Bearer ${_credentials.token}`)
      })
  }

  deleteSelfApiTokenByToken(token: string) {
    return Promise
      .resolve(this.getCredentials())
      .then((_credentials: { token: string }) => {
        return unirest
          .delete(`${this.baseUrl}/self/api-tokens/${token}`)
          .header('Authorization', `Bearer ${_credentials.token}`)
      })
  }

}

module.exports = {
  Client
}
