const debug = require("debug")("sapper-pirate-export:request-queue")
const queue = require("queue")
const fetch = require("node-fetch")

const requestQueue = ({ concurrency, timeout, host }) => {
  const q = queue({
    concurrency,
    timeout
    // autostart: true
  })
  const seen = []
  const makeURL = path => `${host}${path}`

  const pushPath = path => {
    if (seen.includes(path)) return

    debug("Pushing path %s onto queue", path)

    seen.push(path)

    debug("Paths seen: %o", seen)

    q.push(() => {
      const url = makeURL(path)
      debug("Fetching url %s", url)
      return fetch(url)
    })
  }

  q.pushPath = pushPath

  return q
}

module.exports = requestQueue
