const path = require("path")
const fs = require("fs-extra")
const { parse } = require("url")

const write = async ({ url, body, contentType, destPath }) => {
  const { pathname } = parse(url)
  let filePath = ""

  if (contentType.includes("text/html")) {
    filePath = path.join(destPath, pathname, "index.html")
  } else {
    filePath = path.join(destPath, pathname)
  }

  console.log(`writing File ${filePath}`)
  return fs.outputFile(filePath, body).then(() => filePath)
  // fs.createWriteStream(filePath).write(body)
}

module.exports = write
