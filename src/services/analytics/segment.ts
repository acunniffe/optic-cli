// @ts-ignore
import * as Analytics from 'analytics-node'
// @ts-ignore
import * as os from 'os'
import {Credentials} from '../../common/credentials'
// @ts-ignore
import * as jwtDecode from 'jwt-decode'
const analytics = new Analytics('OD8zxMohDAtzkl0zHpw3IZILNjJwNSkk')

async function tryIdentify() {
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
  } catch () {
    return {
      anonymousId: 'anon',
      traits,
    }
  }
}

export function track(event: string, properties: any = {}) {
  tryIdentify().then(defaults => {
    analytics.track({...defaults, event, properties})
  })
}
