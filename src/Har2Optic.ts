import {IApiInteraction, pathToMatcher} from '@useoptic/core/build/src/common'
import {
  InteractionsToObservations,
  IObserverConfig,
  Observation
} from '@useoptic/core/build/src/interactions-to-observations'
import {IDocumentConfig} from '@useoptic/core/build/src/optic-config/document-config'
// tslint:disable-next-line:no-implicit-dependencies
import {Content, Entry, Har, Header, PostData} from 'har-format'
import * as url from 'url'
import {readJsonSync} from 'fs-extra'

export function harToObservations(harFilePath: string, config: IDocumentConfig): Observation[] {
  const harJson: Har = readJsonSync(harFilePath)
  const samples = harJson.log.entries.map(toApiInteraction)
  const observerConfig: IObserverConfig = {
    pathMatcherList: config.paths.map(pathToMatcher)
  }
  const observations = InteractionsToObservations.getObservations(samples, observerConfig)
  return observations
}

function nameAndValueListToObject(nameAndValueList: { name: string, value: string }[]) {
  const object: { [key: string]: string } = {}
  return nameAndValueList.reduce((acc, {name, value}) => {
    acc[name] = value
    return acc
  }, object)
}

function decodeRequestBody(postData: PostData) {
  const {mimeType, text} = postData
  //@TODO: support postData.params
  if (mimeType === 'application/json' || mimeType === 'text/plain') {
    try {
      return JSON.parse(text)
    } catch {
    }
  }
  return text
}

function decodeResponseBody(responseContent: Content) {
  const {size, mimeType, text = ''} = responseContent
  if (mimeType === 'application/json' || mimeType === 'text/plain') {
    if (size === 0) {
      return null
    }
    try {
      return JSON.parse(text)
    } catch {
      console.log('could not parse', text)
    }
  }
  return text
}

function normalizeHeaders(headers: Header[]): Header[] {
  return headers.map(header => ({...header, name: header.name.toLocaleLowerCase()}))
}

export function toApiInteraction(entry: Entry): IApiInteraction {
  const parsedUrl = url.parse(entry.request.url, true)
  const cookies = nameAndValueListToObject(entry.request.cookies)
  if (entry.response.content) {
    console.log(entry.request.url)
  }
  return {
    request: {
      url: parsedUrl.pathname || '/',
      method: entry.request.method,
      headers: nameAndValueListToObject(normalizeHeaders(entry.request.headers)),
      cookies,
      queryParameters: parsedUrl.query,
      body: (entry.request.postData) ? decodeRequestBody(entry.request.postData) : null
    },
    response: {
      statusCode: entry.response.status,
      headers: nameAndValueListToObject(normalizeHeaders(entry.response.headers)),
      body: (entry.response.content) ? decodeResponseBody(entry.response.content) : null
    }
  }
}
