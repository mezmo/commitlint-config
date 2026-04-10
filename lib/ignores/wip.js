'use strict'

const WIP_REGEX = /^wip(?:\(\w+\))?:/i

module.exports = ignoreWipCommit

function ignoreWipCommit(commit) {
  const [header] = commit.split('\n')
  return WIP_REGEX.test(header)
}
