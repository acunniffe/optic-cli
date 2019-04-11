import { LocalResolver } from './resolvers/local-resolver'
import { OpticRegistryResolver } from './resolvers/optic-registry-resolver'
import {
  IApiResolver,
  IResolverPublishRequest, IResolverPublishResult,
  IResolverReadRequest, IResolverReadRequestResult,
} from './resolvers/resolver-types'

export class ApiPackageManager {

  readonly resolvers: IApiResolver[]

  constructor(resolvers: IApiResolver[]) {
    this.resolvers = resolvers
  }

  async lookup(lookupRequest: IResolverReadRequest, credentials?: string): Promise<IResolverReadRequestResult> {

    let result;

    for (let resolver of this.resolvers) {
      const found = await resolver.lookup(lookupRequest, credentials)

      // console.log(`Result for ${resolver.name} `+ JSON.stringify(found))
      if (found.success) {
        result = found.snapshot
        break
      }
    }

    if (!result) {
      const name = `${(lookupRequest.org) ? lookupRequest.org + '/' : ''}${lookupRequest.id}@${lookupRequest.version}`
      return {success: false, error: `API '${name}' not found. Make sure it's been published`}
    } else {
      return {success: true, snapshot: result}
    }

  }

  localResolver(): IApiResolver {
    //returns first local provider
    // @ts-ignore
    return this.resolvers.find(i => i.isLocal)
  }

  resolverByName(name: string): IApiResolver {
    // @ts-ignore
    return this.resolvers.find(i => i.name === name)
  }


}

export const defaultAPM = new ApiPackageManager([
  new LocalResolver(),
  new OpticRegistryResolver(),
])
