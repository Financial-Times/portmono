const expect = require("chai").expect
const HerokuClient = require('../src/heroku-client')
const herokuClient = new HerokuClient()

describe("HerokuClient", () => {
  const apps = [
    {
      app: {
        id: 'abc',
      },
      id: 'xyz',
      pipeline: {
        id: '123',
        name: 'test-app',
      },
      stage: 'staging',
    },
  ]

  it('Should get an app by stage', () => {
    expect(herokuClient.getAppIdByStage('staging', apps, 'test-app')).to.equal('abc')
  })

  it('Should throw an exception when unable to retrieve an application id by stage', () => {
    const func = () => herokuClient.getAppIdByStage('development', apps, 'abc')
    expect(func).to.throw('No apps found within pipeline for abc on stage development')
  })
})
