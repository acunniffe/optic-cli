import {SessionManager} from '@useoptic/core/build/src'
import {IApiInteraction} from '@useoptic/core/build/src/common'
import {ISessionManagerOptions} from '@useoptic/core/build/src/session-manager'
import {UrlsToPaths} from '@useoptic/core/build/src/urls-to-paths'

export const inferPaths = async (config: ISessionManagerOptions) => {
  const urls: string[] = await new Promise<string[]>((resolve, reject) => {
    const sessionManager = new SessionManager(config)
    const urls: string[] = []
    sessionManager.onSample((sample: IApiInteraction) => {
      urls.push(sample.request.url)
    })
    sessionManager.run()
      .then(() => {
        resolve(urls)
      })
      .catch(e => {
        reject(e)
      })
  })

  const urlsToPaths = new UrlsToPaths()
  urls.forEach(i => urlsToPaths.addUrl(i))

  const pathComponents = urlsToPaths.getPaths()

  const paths = [...new Set(
    pathComponents
      .map(components => {
        let parameterNumber = 0
        const updatedComponents: string[] = []
        components
          .forEach(component => {
            if (component === ':') {
              parameterNumber += 1

              updatedComponents.push(`:parameter${parameterNumber}`)
            } else {
              updatedComponents.push(component)
            }
          })

        return updatedComponents.join('/')
      }),
  )]

  return paths
}
