'use strict'

const DOC_ONLY_REGEX = /^docs?(?:\([\w-]+\))?:/

module.exports = ignoreDocCommit

function ignoreDocCommit(commit) {
  const [header] = commit.split('\n')
  return DOC_ONLY_REGEX.test(header)
}
