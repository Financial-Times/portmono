const Heroku = require('heroku-client')

/**
 *  A wrapper around the heroku-client package, provides access to common functionality required for managing a monorepo
 */
class HerokuClient extends Heroku {

  /**
   * Search for a version of an application within a given stage in a pipeline
   * @param stage {string} - development, staging or production
   * @param apps {array} - The given application in an array of stages
   * @param appName {string}
   * @returns {boolean}
   */
  getAppIdByStage(stage, apps, appName) {
    var result = false

    apps.forEach(app => {
      if (app.stage === stage) {
        result = app.app.id
      }
    })

    if (result === false) {
      throw('No apps found within pipeline for ' + appName + ' on stage ' + stage)
    } else {
      return result
    }
  }

  /**
   * Correctly format the parameters required for making a promotion request
   * @todo Allow an array of targets
   * @param pipelineId {string}
   * @param sourceAppId {string}
   * @param targetAppId {string}
   * @returns {object}
   */
  buildParametersForPromotion(pipelineId, sourceAppId, targetAppId) {
    return {
      pipeline: {
        id: pipelineId,
      },
      source: {
        app: {
          id: sourceAppId,
        },
      },
      targets: [
        {
          app: {
            id: targetAppId,
          },
        },
      ],
    }
  }

  /**
   * Promote an application within a pipeline
   * https://devcenter.heroku.com/articles/pipelines-using-the-platform-api#performing-a-promotion
   * @param pipelineId {string}
   * @param sourceAppId {string}
   * @param targetAppId {string}
   */
  promote(pipelineId, sourceAppId, targetAppId) {
    this.post('/pipeline-promotions', {
      body: this.buildParametersForPromotion(pipelineId, sourceAppId, targetAppId)
    })
    .then(response => {
      console.log('Promotion successful')
    })
    .catch(error => {
      console.log(error)
    })
  }

  /**
   * Return metadata for an application, specified by its name
   * https://devcenter.heroku.com/articles/pipelines-using-the-platform-api#finding-which-pipeline-an-app-belongs-to
   * @param appName {string}
   * @returns {Promise<*>}
   */
  async getAppData(appName) {
    return this.get('/apps/' + appName + '/pipeline-couplings')
  }

  /**
   * Return an array of applications within a pipeline, specified by its unique id
   * https://devcenter.heroku.com/articles/pipelines-using-the-platform-api#inspecting-a-pipeline
   * @param pipelineId {string}
   * @returns {Promise<*>}
   */
  async getAppsInPipeline(pipelineId) {
    return this.get('/pipelines/' + pipelineId + '/pipeline-couplings')
  }

  /**
   * Return an application, specified by its unique id
   * @param id
   * @returns {Promise<void>}
   */
  async getApp(id) {
    try {
      const app = await this.get(`/apps/${id}`)
      return app
    } catch (error) {
      throw new Error(error.body.message)
    }
  }

  /**
   * Return an array of available apps
   */
  listApps() {
    this.get('/apps').then(apps => {
      console.log(apps)
    })
    .catch(error => {
      console.log(error)
    })
  }

  /**
   * Return an array of available pipelines
   */
  listPipelines() {
    this.get('/pipelines').then(pipelines => {
      console.log(pipelines)
    })
    .catch(error => {
      console.log(error)
    })
  }
}

module.exports = HerokuClient
