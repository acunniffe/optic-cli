// @ts-ignore
import * as Analytics from 'analytics-node'
import * as os from 'os'
import {Credentials} from '../../common/credentials'
// @ts-ignore
import * as jwtDecode from 'jwt-decode'

interface IAnalyticsProperties {
  [key: string]: any
}

interface IAnalytics {
  track(event: string, properties?: IAnalyticsProperties): void
}

class NullAnalytics implements IAnalytics {
  public track(_event: string, _properties?: IAnalyticsProperties): void {

  }
}

class SegmentAnalytics implements IAnalytics {
  private readonly client: Analytics

  constructor(key = 'OD8zxMohDAtzkl0zHpw3IZILNjJwNSkk') {
    this.client = new Analytics(key)
  }

  private async tryIdentify() {
    const traits = {
      platform: os.platform(),
      release: os.release(),
    }
    try {
      const token = await new Credentials().get()
      const {subject} = jwtDecode(token)
      return {
        userId: subject,
        traits,
      }
    } catch {
      return {
        anonymousId: 'anon',
        traits,
      }
    }
  }

  public track(event: string, properties: IAnalyticsProperties = {}): void {
    this.tryIdentify()
      .then(defaults => {
        this.client.track({...defaults, event, properties})
      })
  }

}

const analytics = process.env.ANALYTICS_IMPL === 'null' ? new NullAnalytics() : new SegmentAnalytics()

export default analytics
