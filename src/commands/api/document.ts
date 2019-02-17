process.env.DEBUG = process.env.DEBUG ? `${process.env.DEBUG},optic:*` : 'optic:*'

import {Command} from '@oclif/command'
import {SessionManager} from '@useoptic/core'
import {ObservationsToGraph} from '@useoptic/core/build/src'
import {ReportBuilder} from '@useoptic/core/build/src/report-builder'
import {cli} from 'cli-ux'

import {parseOpticYaml, readOpticYaml, writeOutput} from '../../common/config'

export default class ApiDocument extends Command {
  static description = 'describe the command here'

  static flags = {}

  static args = []

  async run() {
    let config
    try {
      config = parseOpticYaml(readOpticYaml())
    } catch (error) {
      return this.error(error)
    }

    const sessionManager = new SessionManager(config)
    cli.action.start('Collecting API Interactions:')
    const successful = await sessionManager.run()
    cli.action.stop('Analyzing...')
    let shouldBuildReport = true
    if (!successful) {
      if (sessionManager.samples.length === 0) {
        return this.error('The command was not successful :( I did not see any API interactions either. Please make sure you are sending requests to the Optic Proxy or Logging Server.')
      }
      shouldBuildReport = await cli.confirm('The command was not successful :( Continue anyway?')
    }

    if (!shouldBuildReport) {
      this.log('ok! exiting...')
      return
    }
    cli.action.start('Generating reports...')
    const report = new ReportBuilder().buildReport(config, sessionManager.samples)

    const {messages, observations} = report
    messages.forEach(message => this.log(message))

    writeOutput('observations.json', JSON.stringify(observations))

    const observationsToGraph = new ObservationsToGraph()
    observationsToGraph.interpretObservations(observations)

    writeOutput('graphviz.txt', observationsToGraph.graph.toGraphViz())

    cli.action.stop('Done!')
  }
}
