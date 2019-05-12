import {Command} from '@oclif/command'
import {InteractionsToObservations, ObservationsToGraphBuilder} from '@useoptic/core/build/src'
import {Graph} from '@useoptic/core/build/src/graph/graph'
import {cli} from 'cli-ux'
import {IApiInteraction, pathToMatcher} from '@useoptic/core/build/src/common'
import {EventEmitter} from 'events'
import * as path from 'path'
import {harToHostsAndInteractions} from '../common/har-utilities'
import analytics from '../services/analytics/segment'
import {LoggingCaptureSession} from '@useoptic/core/build/src/sessions/logging-capture-session'
import {CommandSession} from '@useoptic/core/build/src/sessions/command-session'
import {ProxyCaptureSession} from '@useoptic/core/build/src/sessions/proxy-capture-session'
import * as express from 'express'
import * as bodyParser from 'body-parser'

export default class Capture extends Command {
  private sessions: ICaptureSessionResultWithMetadata[] = []
  private currentSession: ICaptureSessionState = {samples: [], graph: new Graph()}
  private paths: string[] = []

  static description = 'Capture traffic to generate an API specification'

  static flags = {}

  static args = []

  async run() {
    analytics.track('Capture Session Starting')

    const config = {
      paths: [
        '/api/refreshToken',
        '/api/user',
        '/api/user/referralStatus',
        '/boot/cms/1/plan/recipes',
        '/boot/cms/1/plans',
        '/boot/cms/1/plans/:planSlug/recommendations',
        '/boot/config',
        '/ecommerce/v2/users/:userId/carts',
        //'/ecommerce/v2/users/:userId/carts/:cartId',
        '/ecommerce/v2/users/:userId/subscriptions',
        '/log/click',
        '/log/view',
        '/log/yourPlanPage',
      ],
      port: 9000
    }

    this.paths.push(...config.paths)

    const serverEvents = await this.startServer(config.port)

    serverEvents.on('pathsChanged', this.handlePathsChanged.bind(this))

    await this.loop(config)

    require('fs').writeFileSync('capture.json', JSON.stringify({sessions: this.sessions, paths: this.paths}, null, 2))

    await this.generateReport(this.sessions)
  }

  async loop(config: IBaseCaptureSessionConfig) {
    const options = [
      {
        type: 'logging',
        handler: () => this.runLoggingSession()
      },
      {
        type: 'proxy',
        handler: () => this.runProxySession()
      },
      {
        type: 'har',
        handler: () => this.runHarSession()
      },
      {
        type: 'replay', handler: () => {
          this.warn('unimplemented :(')
        }
      }
    ]

    const optionsString = options
      .map((option, index) => {
        return `${index + 1}. ${option.type}`
      })
      .join('\n')

    while (true) {
      const choice = await cli.prompt(`
How do you want to capture your API?
${optionsString}

If you are done capturing, enter "done"`, {required: true})
      if (choice === 'done') {
        break
      }

      const number = parseInt(choice, 10)
      if (Number.isFinite(number) && (number >= 1 && number <= options.length)) {
        const index = number - 1
        const chosenOption = options[index]
        try {
          const session = await chosenOption.handler()
          cli.log(`${session.samples.length} API interactions observed`)
          const shouldSave = await cli.confirm('Do you want to save this capture session?')
          if (shouldSave) {
            this.sessions.push({
              type: chosenOption.type,
              result: session,
            })
          }
        } catch (e) {
          cli.warn(e)
        }
      } else {
        cli.warn('Please enter the number of your chosen option')
      }
    }
  }

  async runLoggingSession(): Promise<ICaptureSessionResult> {
    this.initCaptureSession()

    const loggingSession = new LoggingCaptureSession()
    await loggingSession.start()

    loggingSession.events.on('sample', (sample: IApiInteraction) => {
      this.handleSample(sample)
    })

    const command = await cli.prompt('What command should I run?')
    const commandSession = new CommandSession()
    const childProcess = await commandSession.start({
      command,
      environmentVariables: {
        OPTIC_SERVER_LISTENING: 'yes'
      }
    })

    cli.action.start('Observing API Interactions')

    const promise = new Promise(resolve => {
      childProcess.on('exit', resolve)
    })
      .then(() => cli.action.stop())

    await promise
    loggingSession.stop()

    const samples = loggingSession.getSamples()

    return {
      samples
    }
  }

  async runProxySession(): Promise<ICaptureSessionResult> {
    this.initCaptureSession()
    const proxySession = new ProxyCaptureSession()

    proxySession.events.on('sample', async (sample: IApiInteraction) => {
      this.handleSample(sample)
    })

    const target = await cli.prompt('What protocol://host:port is serving the API?', {required: true})

    await proxySession.start({target})

    cli.action.start('Observing API Interactions')

    await cli.anykey('Press any key to stop observing')

    proxySession.stop()
    cli.action.stop()

    const samples = proxySession.getSamples()

    return {
      samples
    }
  }

  async runHarSession(): Promise<ICaptureSessionResult> {
    this.initCaptureSession()
    const harFilePath = await cli.prompt('Where is the HAR file you wish to import?')
    const {hosts, samplesByHost} = harToHostsAndInteractions(harFilePath)

    let [host] = hosts
    if (hosts.length > 1) {
      const hostsString = hosts.map(x => ` - ${x}`).join('\n')
      do {
        host = await cli.prompt(`Which host do you want to capture?
${hostsString}`)
      } while (!samplesByHost.has(host))
    }

    const samples = samplesByHost.get(host) || []

    return {
      samples
    }
  }

  async refinePaths(originalPaths: string[], samples: IApiInteraction[]) {

    /*let paths = [...originalPaths]
    let pathMatchers = paths.map(pathToMatcher)
    for (const sample of samples) {
      const {url} = sample.request
      while (!pathMatchers.some(matcher => matcher.regexp.test(url))) {
        cli.log(`The request URL did not match any paths: "${url}"`)
        const path = await cli.prompt('What path should this URL match?')
        paths = [...new Set(paths).add(path)]
        pathMatchers = paths.map(pathToMatcher)
      }
    }
    this.log('paths:')
    this.log(paths.map(x => ` - ${x}`).join('\n'))
    return paths
    */
    return originalPaths
  }

  async generateReport(sessions: ICaptureSessionResultWithMetadata[]) {
    this.log('generating report')
    return {}
  }

  async startServer(port: number) {
    const serverEvents = new EventEmitter()

    const app = express()

    const apiRouter = express.Router()
    apiRouter.post('/paths', (req, res) => {
      this.log(JSON.stringify(req.body))
      serverEvents.emit('pathsChanged', {paths: req.body.paths})
      res.status(204).end()
    })
    apiRouter.get('/sessions', async (req, res) => {
      const promises = this.sessions.map(session => {
        const promise = this.samplesToGraph(session.result.samples, this.paths).toGql()
        return promise.then((gql) => {
          return {
            ...session,
            gql
          }
        })
      })
      Promise.all(promises).then((sessions) => {
        res.json({
          sessions
        })
      })
    })
    apiRouter.get('/paths', (req, res) => {
      res.json({
        paths: this.paths
      })
    })
    apiRouter.get('/current-session', (req, res) => {
      if (!this.currentSession) {
        return res.status(404).end()
      }

      const promise = this.currentSession.graph.toGql()
      promise.then((gql) => {
        res.json({
          session: {
            ...this.currentSession,
            gql
          }
        })
      })
    })

    app.use('/api', bodyParser.json(), apiRouter)
    app.use(express.static(path.join(__dirname, '../static')))

    await new Promise(resolve => app.listen(port, resolve))

    return serverEvents
  }

  initCaptureSession() {
    const observationsToGraph = ObservationsToGraphBuilder.fromEmptyGraph()

    this.currentSession = {
      samples: [],
      graph: observationsToGraph.graph
    }
  }

  handleSample(sample: IApiInteraction) {
    const {graph, samples} = this.currentSession
    samples.push(sample)
    cli.action.status = `${samples.length} interactions observed`
    const observations = InteractionsToObservations.getObservationsForInteraction(sample, {pathMatcherList: this.paths.map(pathToMatcher)})
    const observationsToGraph = ObservationsToGraphBuilder.fromExistingGraph(graph)
    observationsToGraph.interpretObservations(observations)
  }

  handlePathsChanged({paths}: { paths: string[] }) {
    this.paths = paths
    const {samples} = this.currentSession
    this.currentSession.graph = this.samplesToGraph(samples, paths)
  }

  samplesToGraph(samples: IApiInteraction[], paths: string[]) {
    const observations = InteractionsToObservations.getObservations(samples, {pathMatcherList: paths.map(pathToMatcher)})
    const observationsToGraph = ObservationsToGraphBuilder.fromEmptyGraph()
    observationsToGraph.interpretObservations(observations)
    console.log(observationsToGraph.graph)
    return observationsToGraph.graph
  }
}

interface IBaseCaptureSessionConfig {
  paths: string[]
}

interface ICaptureSessionResultWithMetadata {
  type: string
  result: ICaptureSessionResult
}

interface ICaptureSessionResult {
  samples: IApiInteraction[]
}

interface ICaptureSessionState {
  samples: IApiInteraction[]
  graph: Graph
}
