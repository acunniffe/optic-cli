import {expect, test} from '@oclif/test'
import * as config from '../../src/common/config'

describe('config', () => {
  describe('parseOpticYaml', () => {
    test
      .it('sets defaults', () => {
        const opticYamlWithoutOpticSection =
          `
strategy:
  type: logging
  commandToRun: sbt test
api:
  id: team/id
  version: vvv
  paths:
    - /users
`
        const value = config.parseOpticYaml(opticYamlWithoutOpticSection)
        expect(value.strategy).to.deep.equal({
          type: 'logging',
          commandToRun: 'sbt test'
        })
        expect(value.api).to.deep.equal({
          id: 'team/id',
          version: 'vvv',
          paths: ['/users']
        })
        expect(value.optic.apiBaseUrl).to.equal('https://api.useoptic.com')
        expect(value.optic.baseUrl).to.equal('https://app.useoptic.com')
        expect(value.optic.version).to.be.a('string')
        expect(value.dependencies).to.deep.equal([])
      })

    test
      .it('merges defaults', () => {
        const opticYamlWithPartialOpticSection =
          `
strategy:
  type: logging
  commandToRun: sbt test
api:
  id: team/id
  version: vvv
  paths:
    - /users
optic:
  version: v9000
dependencies:
  - id: team/id2
    version: zzz
  - id: team/id3
    version: yyy
`
        const value = config.parseOpticYaml(opticYamlWithPartialOpticSection)
        expect(value.strategy).to.deep.equal({
          type: 'logging',
          commandToRun: 'sbt test'
        })
        expect(value.api).to.deep.equal({
          id: 'team/id',
          version: 'vvv',
          paths: ['/users']
        })
        expect(value.optic.apiBaseUrl).to.equal('https://api.useoptic.com')
        expect(value.optic.baseUrl).to.equal('https://app.useoptic.com')
        expect(value.optic.version).to.equal('v9000')
        expect(value.dependencies).to.deep.equal([
          {id: 'team/id2', version: 'zzz'},
          {id: 'team/id3', version: 'yyy'}
        ])
      })

  })
})
