const exec = require('child_process').execFile
const fs = require('fs')
const path = require('path')

async function git(args) {
  return new Promise(function (resolve, reject) {
    exec('git', args, function (error, stdout, stderr) {
      process.stderr.write(stderr)
      if (error) return reject(error)
      resolve(stdout)
    })
  })
}

git.RemoteExists = async function RemoteExists(remote) {
  return git(['remote'])
    .then((remotes) => remotes.split('\n'))
    .then((remotes) => remotes.find((r) => r === remote))
}
git.RemoteCreate =  async function createRemote(remote, url) {
  return git.RemoteExists(remote)
    .then((exists) => !exists ? git(['remote', 'add', remote, url]) : null)
}
git.RemoteList = async function ListRemotes() {
    return git(['remote', '-v'])
      .then((remotes) => remotes.trim().split('\n').map((r) => r.split(/\s/)))
}

git.SubtreePush = async function SubtreePush(prefix, remote, branch, ...args) {
  return git(['subtree', 'push', '--prefix', path.relative('.', prefix), remote, branch, ...args])
}

git.inGitRepo = async function inGitRepo() {
  try {
    fs.lstatSync('.git')
    return true
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
  }
}

git.RemoveRemote = async function RemoteRemove(remote) {
  return git(['remote', 'rm', remote])
}

module.exports = git
