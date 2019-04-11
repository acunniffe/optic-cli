import {Observation} from '@useoptic/core/build/src/interactions-to-observations'

// @ts-ignore
export function harToObservations(harPath: string): Observation[] {
  // @ts-ignore
  console.log(harPath)
  return []
}

// function collectHostEntries(har, targetHost) {
//   return har.log.entries.filter(entry => {
//     const {host} = url.parse(entry.request.url);
//     return host === targetHost;
//   });
// }

// function nameAndValueListToObject(nameAndValueList) {
//   return nameAndValueList.reduce((acc, {name, value}) => {
//     acc[name] = value;
//     return acc;
//   }, {});
// }
//
// function decodeRequestBody(harRequest) {
//   const {postData = {}} = harRequest;
//   const {mimeType, text} = postData;
//   if (mimeType === 'application/json' || mimeType === 'text/plain') {
//     try {
//       return JSON.parse(text);
//     } catch {
//       return text;
//     }
//   }
//   return text;
// }
//
// function decodeResponseBody(harResponse) {
//   const {content} = harResponse;
//   const {size, mimeType, text} = content;
//   if (mimeType === 'application/json') {
//     return size === 0 ? null : JSON.parse(text);
//   }
//   return text;
// }
//
// export function toAPIInteractions(entry) {
//   const parsedUrl = url.parse(entry.request.url, true);
//   const cookies = nameAndValueListToObject(entry.request.cookies);
//   return {
//     request: {
//       url: parsedUrl.pathname,
//       method: entry.request.method,
//       headers: nameAndValueListToObject(entry.request.headers),
//       cookies,
//       queryParameters: parsedUrl.query,
//       body: (entry.request.postData) ? decodeRequestBody(entry.request) : null
//     },
//     response: {
//       statusCode: entry.response.status,
//       headers: nameAndValueListToObject(entry.response.headers),
//       body: (entry.response.content) ? decodeResponseBody(entry.response) : null
//     }
//   };
// }
