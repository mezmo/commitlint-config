'use strict'

const path = require('node:path')
const fs = require('node:fs')

module.exports = function loadFiles(dir) {
  return fs.globSync('**/*.txt', {
    cwd: dir
  })
    .reduce((acc, filename) => {
      const {name} = path.parse(filename)
      acc[name] = fs.readFileSync(path.join(dir, filename), 'utf8')
      return acc
    }, {})
}
