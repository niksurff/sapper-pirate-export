const { CANNONS_READY } = require("./lib/messages")

const sapperPirateExportMiddleware = () => {
  let connected = false

  // Signal exporter we're here and ready
  process.on("message", ({ type }) => {
    if (type === CANNONS_READY) {
      connected = true
      process.send({ type: CANNONS_READY })
    }
  })

  return (req, res, next) => {
    connected && process.send({ path: req.url })
    req.url = req.url.replace(".json", "") //@ TODO silly hacky
    next()
  }
}

module.exports = sapperPirateExportMiddleware
