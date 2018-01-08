const log = require("./lib/logger")(/*pkg.name*/)
const path = require("path")
const {
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval
} = require("timers")
const queue = require("queue")
const fetch = require("node-fetch")
const extractPaths = require("./lib/extract-paths")
const pirateServer = require("./lib/pirate-server")
const pirateFileSystem = require("./lib/pirate-file-system")
const pirateMemory = require("./lib/pirate-memory")
const pirateURL = require("./lib/pirate-url")

const sapperPirateExport = options =>
  // I really don't know what I'm doing
  // I need a resolve func inside run
  //   in order to resolve the Promise from inside an event handler
  new Promise((resolve, reject) => {
    // How else to get around UnhandledPromiseRejectionWarning?
    run(resolve, reject, options).catch(e => reject(e))
  })

/**
 * Runs the export process
 * @param {Object} options - The exporter config
 */
async function run(
  resolve,
  reject,
  {
    serverScript = "server.js",
    exportDir = ".pirates",
    assetsDir = "assets",
    sapperDir = ".sapper",
    cwd = process.cwd(),
    serverStartupTimeout = 3000,
    serverRequestConcurrency = 1200,
    serverRequestTimeout = 600,
    serverPort = 3000,
    initialPaths = ["/", "/service-worker.js"]
  } = {}
) {
  log("Started")

  // fs and server init may execute in parallel
  const [server, pfs] = await Promise.all([
    pirateServer(serverScript, { timeout: serverStartupTimeout }),
    pirateFileSystem({
      exportDir,
      assetsDir,
      sapperDir,
      cwd
    })
  ])

  const q = queue({
    concurrency: serverRequestConcurrency,
    timeout: serverRequestTimeout,
    autostart: true // and keep running until we end() manually
  })

  const pathSeen = pirateMemory()
  const { makeURL, makePathname } = pirateURL(`http://localhost:${serverPort}`)
  const fetchPath = path => {
    if (pathSeen(path)) return

    q.push(() => fetch(makeURL(path)))

    log(`Pushed ${path} onto request queue`)
  }

  log("Setup utils")

  const responseHandler = async response => {
    log(`Received response from %s`, response.url)

    const pathname = makePathname(response.url)
    const body = await response.text()
    const contentType = response.headers.get("content-type")
    const isHTML = contentType.includes("text/html")
    const destFile = isHTML ? path.join(pathname, "index.html") : pathname

    try {
      pfs.writeFile(destFile, body)
      if (isHTML) {
        extractPaths(body).forEach(path => fetchPath(path))
      }
    } catch (e) {
      reject(e)
    }
  }

  const queueEmptyHandler = () => {
    log("Queue empty, waiting for jobs...")

    const timer = setTimeout(() => {
      if (q.length) return // queue has new jobs

      log(`Queue has been empty for ${serverRequestTimeout}ms.`)
      log(`Let's call it a day.`)
      resolve()
    }, serverRequestTimeout) // seems like a good number?
  }

  q.on("success", responseHandler)
  q.on("end", queueEmptyHandler)
  q.on("timeout", (next, job) => {
    log(`Request %o timed out. Moving on...`, job)
    next()
  })
  q.on("error", err => reject(err))

  server.on("message", ({ path }) => path && fetchPath(path))
  server.on("error", err => reject(err))

  log("Setup event handlers")

  // finally, setting things in motion...
  initialPaths.forEach(path => fetchPath(path))

  log("Initial paths queued")
}

module.exports = sapperPirateExport
