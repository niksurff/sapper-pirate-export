const log = require("./logger")("pirate-memory")

/**
 * Check if a string is known
 */
const pirateMemory = () => {
  const pirates = []

  return pirate => {
    if (pirates.includes(pirate)) {
      return true
    }

    pirates.push(pirate)
    return false
  }
}

module.exports = pirateMemory
