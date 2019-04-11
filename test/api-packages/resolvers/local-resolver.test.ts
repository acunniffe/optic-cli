import * as assert from 'assert'
import { defaultLocalRegistry, LocalResolver } from '../../../src/api-packages/resolvers/local-resolver'

import * as observations from './observations.json'

describe('local resolver', () => {

  const example = {
    org: 'optic',
    id: 'test',
    snapshot: {
      version: '1.0.0',
      observations,
      published: true,
      opticVersion: '1',
      branch: 'test',
      commitName: 'example'
    }
  }

  const localResolver = new LocalResolver()

  it('uses proper file path for registry', () => {
    assert(localResolver._path === defaultLocalRegistry)
  })

  it('can publish a version to the registry', () => {
    const publishResult = localResolver.publish(example)
    assert(publishResult)
  })

  it('can lookup a version from the registry', (done) => {
    const publishResult = localResolver.publish(example)
    localResolver.lookup({org: example.org, id: example.id, version:example.snapshot.version})
      .then((result) => {
        assert(result.success)
        done()
      })

  }).timeout(30000)

})
