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
          paths: ['/users']
        })
        expect(value.optic.apiBaseUrl).to.equal('https://api.useoptic.com')
        expect(value.optic.baseUrl).to.equal('https://app.useoptic.com')
        expect(value.optic.version).to.be.a('string')
      })

    test
      .it('merges defaults', () => {
        const opticYamlWithoutOpticSection =
          `
strategy:
  type: logging
  commandToRun: sbt test
api:
  id: team/id
  paths:
    - /users
optic:
  version: v9000
`
        const value = config.parseOpticYaml(opticYamlWithoutOpticSection)
        expect(value.strategy).to.deep.equal({
          type: 'logging',
          commandToRun: 'sbt test'
        })
        expect(value.api).to.deep.equal({
          id: 'team/id',
          paths: ['/users']
        })
        expect(value.optic.apiBaseUrl).to.equal('https://api.useoptic.com')
        expect(value.optic.baseUrl).to.equal('https://app.useoptic.com')
        expect(value.optic.version).to.equal('v9000')
      })

  })
})
