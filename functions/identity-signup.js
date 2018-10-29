import faunadb from 'faunadb' /* Import faunaDB sdk */

export function handler(event, context, callback) {
  isNaN(faunadb)
  const payload = JSON.parse(event.body);
  const user = payload.user;
  console.log(`Netlify user ${user}`)
  callback(null, {
    statusCode: 200,
    body: JSON.stringify(
      {app_metadata: {test: "surely"}}
    )
  })
}
