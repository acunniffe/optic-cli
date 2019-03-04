process.env.DEBUG = process.env.DEBUG ? `${process.env.DEBUG},optic:*` : 'optic:*'

import {Command} from '@oclif/command'
import {SessionManager} from '@useoptic/core'
import {ObservationsToGraph} from '@useoptic/core/build/src'
import {IOpticYamlConfig} from '@useoptic/core/build/src/optic-config'
import {ReportBuilder} from '@useoptic/core/build/src/report-builder'
import {cli} from 'cli-ux'

import {parseOpticYaml, readOpticYaml, writeOutput} from '../../common/config'

export default class ApiDocument extends Command {
  static description = 'document your API contract'

  static flags = {}

  static args = []

  async run() {
    let config: IOpticYamlConfig
    try {
      config = parseOpticYaml(readOpticYaml())
      if (!config.strategy) {
        throw new Error('Your optic.yml is missing the strategy section')
      }
      if (!config.api) {
        throw new Error('Your optic.yml is missing the api section')
      }
    } catch (error) {
      return this.error(error)
    }

    const sessionManager = new SessionManager(config)
    cli.action.start('Observing API Behavior')
    const successful = await sessionManager.run()
    cli.action.start('Analyzing')
    let shouldBuildReport = true
    if (!successful) {
      if (sessionManager.samples.length === 0) {
        return this.error('The test command was not successful and I did not see any API interactions. Please make sure you are sending requests to the Optic Proxy or Logging Server. https://docs.useoptic.com/#/setup/testing-guidelines')
      }
      cli.log('The test command was not successful :(')
      shouldBuildReport = await cli.confirm('Continue anyway? (y/n)')
    }

    if (!shouldBuildReport) {
      this.log('ok! exiting…')
      return
    }
    cli.action.start('Generating reports')
    const report = new ReportBuilder().buildReport(config, sessionManager.samples)

    const {messages, observations} = report
    messages.forEach(message => this.log(message))

    writeOutput('observations.json', JSON.stringify(observations, null, 2))

    const observationsToGraph = new ObservationsToGraph()
    observationsToGraph.interpretObservations(observations)

    writeOutput('graphviz.txt', observationsToGraph.graph.toGraphViz())

    cli.action.stop()
    cli.log('Your API has now been documented! Next you might want to run api:publish')
  }
}
