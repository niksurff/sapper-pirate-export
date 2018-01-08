const log = require("./lib/logger")("middleware")
const { CANNONS_READY } = require("./lib/messages")

const sapperPirateExportMiddleware = () => {
  let connected = false

  // Signal exporter we're here
  process.on("message", msg => {
    if (msg === CANNONS_READY) {
      log("Received connection signal from export process")

      connected = true
      process.send(CANNONS_READY)
    }
  })

  return (req, res, next) => {
    connected && process.send({ path: req.url })
    req.url = req.url.replace(".json", "") //@ TODO silly hacky
    next()
  }
}

module.exports = sapperPirateExportMiddleware
