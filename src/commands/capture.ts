import {Command} from '@oclif/command'
import {InteractionsToObservations, ObservationsToGraphBuilder} from '@useoptic/core/build/src'
import {DiffingGraph} from '@useoptic/core/build/src/diffing-graph'
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
import * as fs from 'fs-extra'

export default class Capture extends Command {
  private sessions: ICaptureSessionResultWithMetadata[] = []
  private currentSession: ICaptureSessionState | null = null
  private paths: string[] = []

  static description = 'Capture traffic to generate an API specification'

  static flags = {}

  static args = []

  async run() {
    analytics.track('Capture Session Starting')

    const config = {
      paths: [],
      port: 9000
    }

    this.paths.push(...config.paths)

    const serverEvents = await this.startServer(config.port)

    serverEvents.on('pathsChanged', this.handlePathsChanged.bind(this))

    cli.open(`http://localhost:${config.port}`)

    await this.loop(config)

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
      }
    ]

    const optionsString = options
      .map((option, index) => {
        return ` ${index + 1}. ${option.type}`
      })
      .join('\n')

    while (true) {
      const choice = await cli.prompt(`
How do you want to capture your API?
${optionsString}

 - If you want to resume your last session, enter "resume"
 - If you are done capturing, enter "done"

Enter your choice`, {required: true})
      if (choice === 'done') {
        break
      }

      if (choice === 'resume') {
        this.resumeSession()
        continue
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
            this.addSession({
              type: chosenOption.type,
              result: session,
            })
            this.currentSession = null
          }
        } catch (e) {
          cli.warn(e)
        }
      } else {
        cli.warn('Please enter the number of your chosen option')
      }
    }
  }

  addSession(session: ICaptureSessionResultWithMetadata) {
    this.sessions.push(session)
    this.persistSessions()
  }

  persistSessions() {
    fs.writeJsonSync('capture.json', {sessions: this.sessions, paths: this.paths})
  }

  resumeSession() {
    cli.action.start('Resuming from last time')
    try {
      const {sessions, paths} = fs.readJsonSync('capture.json')
      this.sessions = sessions
      this.paths = paths
    } catch (e) {
      this.warn(e)
    } finally {
      cli.action.stop()
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

  async generateReport(sessions: ICaptureSessionResultWithMetadata[]) {
    this.log('generating report')
    return {}
  }

  getDiff(diffingGraph: DiffingGraph) {
    const {uncoveredNodeIds, coveredNodeIds, newNodeIds} = diffingGraph
    return {
      uncoveredNodes: [...uncoveredNodeIds].map(x => {
        const node = diffingGraph.nodes.get(x)
        if (node) {
          return {node, nameKey: node.value.hashCode()}
        }
      }),
      coveredNodes: [...coveredNodeIds].map(x => {
        const node = diffingGraph.nodes.get(x)
        if (node) {
          return {node, nameKey: node.value.hashCode()}
        }
      }),
      newNodes: [...newNodeIds].map(x => {
        const node = diffingGraph.nodes.get(x)
        if (node) {
          return {node, nameKey: node.value.hashCode()}
        }
      })
    }
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
      const allSessionsGraph = this.getGraphForAllSessions()
      const promises = this.sessions.map(session => {
        const diffingGraph = this.samplesToDiff(session.result.samples, this.paths, allSessionsGraph)
        const promise = diffingGraph.toGql()
        return promise.then(gql => {
          return {
            ...session,
            gql,
            diff: this.getDiff(diffingGraph)
          }
        })
      })
      Promise.all(promises).then(sessions => {
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
      const allSessionsGraph = this.getGraphForAllSessions()
      const diffingGraph = this.samplesToDiff(this.currentSession.samples, this.paths, allSessionsGraph)
      const promise = diffingGraph.toGql()
      promise.then(gql => {
        res.json({
          session: {
            ...this.currentSession,
            gql,
            diff: this.getDiff(diffingGraph)
          }
        })
      })
    })

    app.use('/api', bodyParser.json(), apiRouter)
    app.use(express.static(path.join(__dirname, '../static')))

    await new Promise(resolve => app.listen(port, resolve))

    return serverEvents
  }

  getGraphForAllSessions() {
    const samples = this.sessions.map(x => x.result.samples).reduce((acc, values) => [...acc, ...values], [])
    if (this.currentSession) {
      samples.push(...this.currentSession.samples)
    }
    return this.samplesToGraph(samples, this.paths)
  }

  initCaptureSession() {
    const observationsToGraph = ObservationsToGraphBuilder.fromEmptyGraph()

    this.currentSession = {
      samples: [],
      graph: observationsToGraph.graph
    }
  }

  handleSample(sample: IApiInteraction) {
    if (!this.currentSession) {
      return
    }
    const {graph, samples} = this.currentSession
    samples.push(sample)
    cli.action.start(`Observing API interactions (${samples.length} interactions observed)`)
    const observations = InteractionsToObservations.getObservationsForInteraction(sample, {pathMatcherList: this.paths.map(pathToMatcher)})
    const observationsToGraph = ObservationsToGraphBuilder.fromExistingGraph(graph)
    observationsToGraph.interpretObservations(observations)
  }

  handlePathsChanged({paths}: { paths: string[] }) {
    this.paths = paths
    this.persistSessions()
    if (!this.currentSession) {
      return
    }
    const {samples} = this.currentSession
    this.currentSession.graph = this.samplesToGraph(samples, paths)
  }

  samplesToGraph(samples: IApiInteraction[], paths: string[]) {
    const observations = InteractionsToObservations.getObservations(samples, {pathMatcherList: paths.map(pathToMatcher)})
    const observationsToGraph = ObservationsToGraphBuilder.fromEmptyGraph()
    observationsToGraph.interpretObservations(observations)
    return observationsToGraph.graph
  }

  samplesToDiff(samples: IApiInteraction[], paths: string[], baseGraph: Graph) {
    const diffingGraph = new DiffingGraph(baseGraph)
    const observations = InteractionsToObservations.getObservations(samples, {pathMatcherList: paths.map(pathToMatcher)})
    const observationsToGraph = ObservationsToGraphBuilder.fromExistingGraph(diffingGraph)
    observationsToGraph.interpretObservations(observations)
    return diffingGraph
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
