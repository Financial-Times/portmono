const {expect, test} = require('@oclif/test')

describe('deploy', () => {
  test
    .stdout()
    .command(['portmono'])
    .it('runs', ctx => {
      expect(ctx.stdout).to.contain('deploy')
    })
})
