'use strict'

const lint = require('./commitlint/lint.js')

module.exports = {
  testCommit
}

function testCommit(t, def, msg) {
  return t.test(def.description, async (t) => {
    const result = await lint(def.commit)

    const {input, ...report} = result
    t.same(report, def.report, msg, {got: report})
  })
}
