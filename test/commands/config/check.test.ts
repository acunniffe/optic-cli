import {expect, test} from '@oclif/test'
import * as debug from 'debug'

import * as config from '../../../src/common/config'

const log = debug('developer')

const emptyConfig = '# no actual yaml here'
const loggingServerConfig = `
commandToRun: sbt test
documentationStrategy:
  type: logging
api:
  paths:
    - /users
`
const proxyServerConfig = `
commandToRun: "npm test"
documentationStrategy:
  type: proxy
  targetHost: localhost
  targetPort: 9000
api:
  paths:
    - /users
`

const configWithBasicSecurity = `
${proxyServerConfig}
  security:
    - type: basic
`
const configWithBearerSecurity = `
${loggingServerConfig}
  security:
    - type: bearer
`
const configWithApiKeyHeaderSecurity = `
${proxyServerConfig}
  security:
    - type: apiKey
      in: header
      name: api-key
`
const configWithApiKeyCookieSecurity = `
${loggingServerConfig}
  security:
    - type: apiKey
      in: cookie
      name: api-key
`
const configWithApiKeyQuerySecurity = `
${proxyServerConfig}
  security:
    - type: apiKey
      in: query
      name: api-key
`

describe('config:check', () => {
  test
    .stub(config, 'readOpticYaml', () => emptyConfig)
    .command(['config:check'])
    .catch(err => expect(err.message).to.be.ok)
    .it('rejects empty config')

  test
    .stub(config, 'readOpticYaml', () => loggingServerConfig)
    .stdout()
    .command(['config:check'])
    .it('accepts logging server config', ctx => {
      log(ctx.stdout)
      expect(ctx.stdout).to.match(/ok/)
    })

  test
    .stub(config, 'readOpticYaml', () => proxyServerConfig)
    .stdout()
    .command(['config:check'])
    .it('accepts proxy server config', ctx => {
      log(ctx.stdout)
      expect(ctx.stdout).to.match(/ok/)
    })

  test
    .stub(config, 'readOpticYaml', () => configWithBasicSecurity)
    .stdout()
    .command(['config:check'])
    .it('accepts config with basic auth', ctx => {
      log(ctx.stdout)
      expect(ctx.stdout).to.match(/ok/)
    })

  test
    .stub(config, 'readOpticYaml', () => configWithBearerSecurity)
    .stdout()
    .command(['config:check'])
    .it('accepts config with bearer auth', ctx => {
      log(ctx.stdout)
      expect(ctx.stdout).to.match(/ok/)
    })

  test
    .stub(config, 'readOpticYaml', () => configWithApiKeyHeaderSecurity)
    .stdout()
    .command(['config:check'])
    .it('accepts config with header api key auth', ctx => {
      log(ctx.stdout)
      expect(ctx.stdout).to.match(/ok/)
    })

  test
    .stub(config, 'readOpticYaml', () => configWithApiKeyCookieSecurity)
    .stdout()
    .command(['config:check'])
    .it('accepts config with cookie api key auth', ctx => {
      log(ctx.stdout)
      expect(ctx.stdout).to.match(/ok/)
    })

  test
    .stub(config, 'readOpticYaml', () => configWithApiKeyQuerySecurity)
    .stdout()
    .command(['config:check'])
    .it('accepts config with query api key auth', ctx => {
      log(ctx.stdout)
      expect(ctx.stdout).to.match(/ok/)
    })
})
