process.env.DEBUG = process.env.DEBUG ? `${process.env.DEBUG},optic:*` : 'optic:*'

import {Command} from '@oclif/command'
import {SessionManager} from '@useoptic/core'
import {ObservationsToGraph} from '@useoptic/core/build/src'
import { IOpticYamlConfig, toSessionConfig } from '@useoptic/core/build/src/optic-config'
import {ReportBuilder} from '@useoptic/core/build/src/report-builder'
import { ISessionManagerOptions } from '@useoptic/core/build/src/session-manager'
import {cli} from 'cli-ux'

import {parseOpticYaml, readOpticYaml, writeOutput} from '../../common/config'

export default class ApiDocument extends Command {
  static description = 'document your API contract'

  static flags = {}

  static args = []

  async run() {
    const config: IOpticYamlConfig = parseOpticYaml(readOpticYaml())
    const sessionConfig: ISessionManagerOptions = toSessionConfig( config )

    const sessionManager = new SessionManager(sessionConfig)
    cli.action.start('Observing API Behavior')
    const successful = await sessionManager.run()
    cli.action.start('Analyzing')
    let shouldBuildReport = true
    if (!successful) {
      if (sessionManager.samples.length === 0) {
        return this.error('No API Interactions Observed. Make sure that you have added Optic middleware to your test fixtures https://docs.useoptic.com')
      }
      cli.log('The test command had a non-zero exit. Some tests may have failed.')
      shouldBuildReport = await cli.confirm('Continue anyway? (y/n)')
    }

    if (!shouldBuildReport) {
      this.log('ok! exiting…')
      return
    }
    cli.action.start('Generating reports')
    const report = new ReportBuilder().buildReport(sessionConfig, sessionManager.samples)

    const {messages, observations} = report
    messages.forEach(message => this.log(message))

    writeOutput('observations.json', JSON.stringify(observations, null, 2))

    const observationsToGraph = new ObservationsToGraph()
    observationsToGraph.interpretObservations(observations)

    // writeOutput('graphviz.txt', observationsToGraph.graph.toGraphViz())

    cli.action.stop()
    cli.log('Your API has now been documented! Next you might want to run optic api:publish')
  }
}
