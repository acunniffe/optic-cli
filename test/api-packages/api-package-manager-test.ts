import * as assert from 'assert'
import { ApiPackageManager } from '../../src/api-packages/api-package-manager'
import {
  IApiResolver, IResolverPublishRequest, IResolverPublishResult,
  IResolverReadRequest,
  IResolverReadRequestResult,
} from '../../src/api-packages/resolvers/resolver-types'


describe('api package manager', () => {

  class StubResolver implements IApiResolver {
    readonly findOne: boolean
    readonly value: any
    constructor(findOne: boolean, value: any) {
      this.findOne = findOne
      this.value = value
    }

    async lookup(lookupRequest: IResolverReadRequest, credentials?: string): Promise<IResolverReadRequestResult> {
      if (this.findOne) {
        return {success: true, snapshot: this.value}
      } else {
        return {success: false, error: 'Not found'}
      }
    }

    async publish(request: IResolverPublishRequest, credentials?: string): Promise<IResolverPublishResult> {
      return {success: true}
    }
  }


  it('will find package if it exists in last resolver', () => {
      const localExample = new StubResolver(false, 'from local')
      const companyServerExample = new StubResolver(false, 'from company')
      const opticServerExample = new StubResolver(true, 'from optic')

      const apm = new ApiPackageManager([localExample, companyServerExample, opticServerExample])

      apm.lookup({ org: 'any', id: 'any', version: '2.0.0' }).then((result) => {
        assert(result.success)
        assert(result.snapshot === 'from optic')
      })
  })

  it('will find package if it exists in first resolver', () => {
    const localExample = new StubResolver(true, 'from local')
    const companyServerExample = new StubResolver(false, 'from company')
    const opticServerExample = new StubResolver(false, 'from optic')

    const apm = new ApiPackageManager([localExample, companyServerExample, opticServerExample])

    apm.lookup({ org: 'any', id: 'any', version: '2.0.0' }).then((result) => {
      assert(result.success)
      assert(result.snapshot === 'from local')
    })
  })

  it('will return result from first resolver if exists in all', () => {
    const localExample = new StubResolver(true, 'from local')
    const companyServerExample = new StubResolver(true, 'from company')
    const opticServerExample = new StubResolver(true, 'from optic')

    const apm = new ApiPackageManager([localExample, companyServerExample, opticServerExample])

    apm.lookup({ org: 'any', id: 'any', version: '2.0.0' }).then((result) => {
      assert(result.success)
      assert(result.snapshot === 'from local')
    })
  })

  it('will find package if it exists in middle resolver', () => {
    const localExample = new StubResolver(false, 'from local')
    const companyServerExample = new StubResolver(true, 'from company')
    const opticServerExample = new StubResolver(true, 'from optic')

    const apm = new ApiPackageManager([localExample, companyServerExample, opticServerExample])

    apm.lookup({ org: 'any', id: 'any', version: '2.0.0' }).then((result) => {
      assert(result.success)
      assert(result.snapshot === 'from company')
    })
  })

  it('will return false if it does not exist anywhere', () => {
    const localExample = new StubResolver(false, 'from local')
    const companyServerExample = new StubResolver(false, 'from company')
    const opticServerExample = new StubResolver(false, 'from optic')

    const apm = new ApiPackageManager([localExample, companyServerExample, opticServerExample])

    apm.lookup({ org: 'any', id: 'any', version: '2.0.0' }).then((result) => {
      assert(!result.success)
      assert(result.snapshot === 'from company')
    })
  })

})
