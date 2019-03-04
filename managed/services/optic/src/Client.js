const unirest = require('unirest');
class Client {
  constructor(baseUrl, getCredentials) {
    this.baseUrl = baseUrl;
    this.getCredentials = getCredentials;
  }

    postSelfApi(selfApi) {
      return Promise
        .resolve(this.getCredentials())
        .then((_credentials) => {
          return unirest
            .post(`${this.baseUrl}/self/apis`)
        .header("Authorization", `Bearer ${_credentials.token}`)
        .headers("content-type", "application/json")
        .send(selfApi);
        })
    }
        

    getTeamByTeamSlug(teamSlug) {
      return Promise
        .resolve(this.getCredentials())
        .then((_credentials) => {
          return unirest
            .get(`${this.baseUrl}/teams/${teamSlug}`)
        .header("Authorization", `Bearer ${_credentials.token}`);
        })
    }


    postSelfApiSnapshotByApiSlug(apiSlug, selfApiSnapshot) {
      return Promise
        .resolve(this.getCredentials())
        .then((_credentials) => {
          return unirest
            .post(`${this.baseUrl}/self/apis/${apiSlug}/snapshots`)
        .header("Authorization", `Bearer ${_credentials.token}`)
        .headers("content-type", "application/json")
        .send(selfApiSnapshot);
        })
    }


    postTeamApiSnapshotByTeamSlugAndApiSlug(teamSlug, apiSlug, teamApiSnapshot) {
      return Promise
        .resolve(this.getCredentials())
        .then((_credentials) => {
          return unirest
            .post(`${this.baseUrl}/teams/${teamSlug}/apis/${apiSlug}/snapshots`)
        .header("Authorization", `Bearer ${_credentials.token}`)
        .headers("content-type", "application/json")
        .send(teamApiSnapshot);
        })
    }


    getSelfApiVersionByApiSlugAndVersion(apiSlug, version) {
      return Promise
        .resolve(this.getCredentials())
        .then((_credentials) => {
          return unirest
            .get(`${this.baseUrl}/self/apis/${apiSlug}/versions/${version}`)
        .header("Authorization", `Bearer ${_credentials.token}`);
        })
    }


    getTeamApiVersionByTeamSlugAndApiSlugAndVersion(teamSlug, apiSlug, version) {
      return Promise
        .resolve(this.getCredentials())
        .then((_credentials) => {
          return unirest
            .get(`${this.baseUrl}/teams/${teamSlug}/apis/${apiSlug}/versions/${version}`)
        .header("Authorization", `Bearer ${_credentials.token}`);
        })
    }


    postTeamInviteAcceptByTeamSlug(teamSlug, teamInviteAccept) {
      return Promise
        .resolve(this.getCredentials())
        .then((_credentials) => {
          return unirest
            .post(`${this.baseUrl}/teams/${teamSlug}/invite/accept`)
        .header("Authorization", `Bearer ${_credentials.token}`)
        .headers("content-type", "application/json")
        .send(teamInviteAccept);
        })
    }


    getSelfApiByApiSlug(apiSlug) {
      return Promise
        .resolve(this.getCredentials())
        .then((_credentials) => {
          return unirest
            .get(`${this.baseUrl}/self/apis/${apiSlug}`)
        .header("Authorization", `Bearer ${_credentials.token}`);
        })
    }


    getTeamApiByTeamSlugAndApiSlug(teamSlug, apiSlug) {
      return Promise
        .resolve(this.getCredentials())
        .then((_credentials) => {
          return unirest
            .get(`${this.baseUrl}/teams/${teamSlug}/apis/${apiSlug}`)
        .header("Authorization", `Bearer ${_credentials.token}`);
        })
    }


    getSelf() {
      return Promise
        .resolve(this.getCredentials())
        .then((_credentials) => {
          return unirest
            .get(`${this.baseUrl}/self`)
        .header("Authorization", `Bearer ${_credentials.token}`);
        })
    }


    postTeamInviteByTeamSlug(teamSlug, teamInvite) {
      return Promise
        .resolve(this.getCredentials())
        .then((_credentials) => {
          return unirest
            .post(`${this.baseUrl}/teams/${teamSlug}/invite`)
        .header("Authorization", `Bearer ${_credentials.token}`)
        .headers("content-type", "application/json")
        .send(teamInvite);
        })
    }


    getSelfMemberships() {
      return Promise
        .resolve(this.getCredentials())
        .then((_credentials) => {
          return unirest
            .get(`${this.baseUrl}/self/memberships`)
        .header("Authorization", `Bearer ${_credentials.token}`);
        })
    }


    postTeam(team) {
      return Promise
        .resolve(this.getCredentials())
        .then((_credentials) => {
          return unirest
            .post(`${this.baseUrl}/teams`)
        .header("Authorization", `Bearer ${_credentials.token}`)
        .headers("content-type", "application/json")
        .send(team);
        })
    }


    getSelfApiSnapshotByApiSlugAndSnapshotId(apiSlug, snapshotId) {
      return Promise
        .resolve(this.getCredentials())
        .then((_credentials) => {
          return unirest
            .get(`${this.baseUrl}/self/apis/${apiSlug}/snapshots/${snapshotId}`)
        .header("Authorization", `Bearer ${_credentials.token}`);
        })
    }


    getSelfApiTokens() {
      return Promise
        .resolve(this.getCredentials())
        .then((_credentials) => {
          return unirest
            .get(`${this.baseUrl}/self/api-tokens`)
        .header("Authorization", `Bearer ${_credentials.token}`);
        })
    }


    postSelfApiToken() {
      return Promise
        .resolve(this.getCredentials())
        .then((_credentials) => {
          return unirest
            .post(`${this.baseUrl}/self/api-tokens`)
        .header("Authorization", `Bearer ${_credentials.token}`);
        })
    }


    deleteSelfApiTokenByToken(token) {
      return Promise
        .resolve(this.getCredentials())
        .then((_credentials) => {
          return unirest
            .delete(`${this.baseUrl}/self/api-tokens/${token}`)
        .header("Authorization", `Bearer ${_credentials.token}`);
        })
    }


}

module.exports = {
  Client
}
