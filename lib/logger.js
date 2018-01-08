const { name: pkgName } = require("../package")

const logger = name => {
  const debug = require("debug")(name ? `${pkgName}:${name}` : pkgName)
  return (...args) => debug(...args)
}

module.exports = logger
