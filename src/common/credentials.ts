import * as keytar from 'keytar'

const serviceName = 'optic-cli'
const accountName = 'default'

class Credentials {
  static set(token: string) {
    return keytar.setPassword(serviceName, accountName, token)
  }

  static get() {
    return keytar.getPassword(serviceName, accountName)
  }
}

export {
  Credentials
}
