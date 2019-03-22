import { SessionManager } from '@useoptic/core/build/src'
import { ISessionManagerOptions } from '@useoptic/core/build/src/session-manager'
import { IApiInteraction } from '@useoptic/core/src/common'

export const verifyTestSetup = (config: ISessionManagerOptions) => {
  return new Promise<Boolean>((resolve, reject) => {
    const sessionManager = new SessionManager(config)
    sessionManager.onSample((sample: IApiInteraction) => {
      sessionManager.stop()
      resolve(true)
    })
    sessionManager.run().then(() => {
      resolve(sessionManager.samples.length > 0)
    })
  })
}
