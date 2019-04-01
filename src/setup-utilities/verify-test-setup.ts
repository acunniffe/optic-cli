import {SessionManager} from '@useoptic/core/build/src'
import {ISessionManagerOptions} from '@useoptic/core/build/src/session-manager'

export const verifyTestSetup = (config: ISessionManagerOptions) => {
  return new Promise<boolean>((resolve, reject) => {
    const sessionManager = new SessionManager(config)
    sessionManager.onSample(() => {
      sessionManager.stop()
      resolve(true)
    })
    sessionManager.run()
      .then(() => {
        resolve(sessionManager.samples.length > 0)
      })
      .catch(e => reject(e))
  })
}
