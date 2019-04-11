import * as keytar from 'keytar'

const serviceName = 'optic-cli'
const defaultAccountName = 'default'

class Credentials {
  private readonly accountName: string

  constructor(accountName = defaultAccountName) {
    this.accountName = accountName
  }

  set(token: string) {
    return keytar.setPassword(serviceName, this.accountName, token)
  }

  get() {
    return keytar.getPassword(serviceName, this.accountName)
  }

  clear() {
    return keytar.deletePassword(serviceName, this.accountName)
  }
}

export {
  Credentials
}
