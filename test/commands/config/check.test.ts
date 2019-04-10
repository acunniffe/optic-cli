import {expect, test} from '@oclif/test'
import * as debug from 'debug'

import * as config from '../../../src/common/config'

const log = debug('developer')

const emptyConfig = '# no actual yaml here'
const documentConfig = `
document:
  id: my-api
  version: 1.0.0
  run_tests: npm run test
  paths: []
`

const consumeConfig = `
consume:
  optic/optic-backend:
    version: 1.0.0
    generate: 
      js-client: /src/managed
      md-docs: /src/docs
`

describe('config:check', () => {
  test
    .stub(config, 'readOpticYaml', () => emptyConfig)
    .command(['config:check'])
    .catch(err => expect(err.message).to.be.ok)
    .it('rejects empty config')

  test
    .stub(config, 'readOpticYaml', () => `${documentConfig}
optic:
  version: v9000
`)
    .stdout()
    .command(['config:check'])
    .it('accepts document config', ctx => {
      log(ctx.stdout)
      expect(ctx.stdout).to.match(/ok/)
    })

  test
    .stub(config, 'readOpticYaml', () => consumeConfig)
    .stdout()
    .command(['config:check'])
    .it('accepts consume config', ctx => {
      log(ctx.stdout)
      expect(ctx.stdout).to.match(/ok/)
    })
})
