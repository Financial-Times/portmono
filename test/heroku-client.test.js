const expect = require("chai").expect;
const HerokuClient = require('../src/heroku-client')
const herokuToken = process.env.HEROKU_API_TOKEN
const herokuClient = new HerokuClient({token: herokuToken})

describe("heroku-client", () => {
  it('Should return a list of available apps', async() => {
    const apps = await herokuClient.listApps()
    expect(apps).length.to.greaterThan(0)
  })

  it('Should return a list of available pipelines', async() => {
    const pipelines = await herokuClient.listPipelines()
    expect(pipelines).length.to.have.lengthOf(4)
  })

  it('Should get application\'s data by from its name', async() => {
    const appData = await herokuClient.getAppData('fdi-content')

    expect(appData).to.haveOwnProperty('pipeline').to.haveOwnProperty('name').and.to.equal('fdi-content')
  })

  it('Should get a list of applications in a pipeline', async() => {
    const pipelineId = '0a48a129-e310-47e2-b249-2426bae12c09'
    const appsInPipeline = await herokuClient.getAppsInPipeline(pipelineId)

    expect(appsInPipeline).to.have.lengthOf(3)
  })

  it('Should get an application id by stage', async() => {
    const appsInPipeline = [
        {
        created_at: '2019-03-04T11:05:54Z',
        app: {
          id: 'a62cda64-4110-4bef-a773-38bc33c9a4f8'
        },
        id: '832ac758-e815-4256-b67d-33dc958d7c3d',
        pipeline: {
          id: '0a48a129-e310-47e2-b249-2426bae12c09',
          name: 'fdi-content'
        },
        stage: 'development',
        updated_at: '2019-03-04T11:06:02Z'
      }
    ]

    const appAtStage = await herokuClient.getAppIdByStage('development', appsInPipeline, 'fdi-content')

    expect(appAtStage).to.have.lengthOf(36)
  })

  it('Should throw an exception when unable to retrieve an application id by stage', async() => {
    const appsInPipeline = [
      {
        created_at: '2019-01-14T08:43:11Z',
        app: {id: '4fefcdff-3760-4fc3-9417-f28b28d3e224'},
        id: '000158d1-ffff-4af5-b9b8-54dbd7e87dab',
        pipeline:
          {
            id: '0a48a129-e310-47e2-b249-2426bae12c09',
            name: 'fdi-content'
          },
        stage: 'staging',
        updated_at: '2019-01-14T08:43:11Z'
      }
    ]

    const func = await function() { herokuClient.getAppIdByStage('development', appsInPipeline, 'fdi-content')}

    expect(func).to.throw('No apps found within pipeline for fdi-content on stage development')
  })
})
