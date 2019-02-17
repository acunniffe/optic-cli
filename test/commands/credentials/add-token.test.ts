import {expect, test} from '@oclif/test'
import * as debug from 'debug'

import {Credentials} from '../../../src/common/credentials'

const log = debug('developer')

describe('credentials:add-token', () => {
  test
    .stdout()
    .stdin('secret-token', 50)
    .command(['credentials:add-token'])
    .it('saves the input token', async ctx => {
      log(ctx.stdout)
      expect(ctx.stdout).to.contain('I saved your token')
      expect(await new Credentials().get()).to.equal('secret-token')
    })
})
