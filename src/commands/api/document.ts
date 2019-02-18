process.env.DEBUG = process.env.DEBUG ? `${process.env.DEBUG},optic:*` : 'optic:*'

import {Command} from '@oclif/command'
import {SessionManager} from '@useoptic/core'
import {ObservationsToGraph} from '@useoptic/core/build/src'
import {ReportBuilder} from '@useoptic/core/build/src/report-builder'
import {cli} from 'cli-ux'

import {parseOpticYaml, readOpticYaml, writeOutput} from '../../common/config'

export default class ApiDocument extends Command {
  static description = 'document your API contract'

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
    cli.action.start('Observing API Behavior:')
    const successful = await sessionManager.run()
    cli.action.stop('Analyzing...')
    let shouldBuildReport = true
    if (!successful) {
      if (sessionManager.samples.length === 0) {
        return this.error('The test command was not successful and I did not see any API interactions. Please make sure you are sending requests to the Optic Proxy or Logging Server. https://docs.useoptic.com/#/setup/testing-guidelines')
      }
      shouldBuildReport = await cli.confirm('The test command was not successful :( Continue anyway?')
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
