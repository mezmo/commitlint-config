'use strict'

const BOT_COMMIT_REGEX = /^signed-off-by: dependabot\[bot\] <support@github\.com>$/i

module.exports = ignoreDependabot

function ignoreDependabot(commit) {
  for (const bit of commit.split('\n')) {
    if (BOT_COMMIT_REGEX.test(bit)) return true
  }

  return false
}
