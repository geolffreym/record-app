const log = require('electron-log')
log.catchErrors()
console.log = log.log
Object.assign(console, log.functions)

require('v8-compile-cache')

const fs = require('fs')
const path = require('path')
const jsonfile = require('jsonfile')
const RecordNode = require('record-node')
const electron = require('electron')

const createIPFSDaemon = require('record-ipfsd')
const ipc = electron.ipcRenderer
const { app, dialog } = electron.remote
const { chromaprintPath, ffmpegPath } = require('./binaries')
const debug = require('debug')

const getIpfsBinPath = () => require('go-ipfs')
  .path()
  .replace('app.asar', 'app.asar.unpacked')

const isDev = process.env.NODE_ENV === 'development'
console.log(`process id: ${process.pid}, isDev: ${isDev}`)

if (isDev || process.env.DEBUG_PROD === 'true') {
  debug.enable('record:*,ipfs*')
} else {
  debug.enable('record:*')
}

let record
let ipfsd

const main = async () => {
  const recorddir = path.resolve(isDev ? app.getPath('temp') : app.getPath('appData'), './record')
  if (!fs.existsSync(recorddir)) { fs.mkdirSync(recorddir) }

  const infoPath = path.resolve(recorddir, 'info.json')
  const info = (fs.existsSync(infoPath) && jsonfile.readFileSync(infoPath)) || {}
  const orbitAddress = info.address || 'record'
  const id = info.id
  console.log(`ID: ${id}`)
  console.log(`Orbit Address: ${orbitAddress}`)
  let opts = {
    directory: recorddir,
    store: {
      replicationConcurrency: 240
    },
    address: orbitAddress,
    api: true,
    chromaprintPath,
    ffmpegPath
  }

  if (isDev) {
    opts.api = { port: 3001 }
    opts.bitboot = { enabled: false }
  }

  if (id) {
    opts.id = id
  }

  if (app.isPackaged) {
    opts.youtubedlPath = path.join(path.dirname(app.getAppPath()), 'app.asar.unpacked/node_modules/youtube-dl/bin/youtube-dl')
  }

  record = new RecordNode(opts)
  record.on('id', (data) => {
    jsonfile.writeFileSync(infoPath, {
      id: data.id,
      address: data.orbitdb.address
    }, { spaces: 2 })
  })

  record.on('ready', async (data) => {
    try {
      console.log(data)
      ipc.send('ready', data)
      record.on('redux', data => ipc.send('redux', data))

      jsonfile.writeFileSync(infoPath, {
        id: data.id,
        address: data.orbitdb.address
      }, { spaces: 2 })

      setTimeout(() => record.logs.connect(), 5000)
    } catch (error) {
      log.error(error)
    }
  })

  try {
    ipfsd = await createIPFSDaemon({
      repo: path.resolve(recorddir, 'ipfs'),
      log: log.info,
      ipfsBin: getIpfsBinPath()
    })
    await record.init(ipfsd)
  } catch (error) {
    log.error(error)

    await dialog.showMessageBox({
      type: 'error',
      message: 'Startup error, please restart.',
      detail: error.toString()
    })

    if (
      process.env.NODE_ENV === 'production' &&
        process.env.DEBUG_PROD !== 'true'
    ) {
      ipc.send('error')
    }
  }
}

try {
  main()
} catch (error) {
  log.error(error)
}

const handler = async () => {
  console.log(`Online: ${navigator.onLine}`)

  if (ipfsd && navigator.onLine) {
    // await ipfsd.stop()
    // await ipfsd.start()
  }
}

window.addEventListener('online', handler)
window.addEventListener('offline', handler)
window.onbeforeunload = async (e) => {
  if (ipfsd) {
    await ipfsd.stop()
    console.log('ipfs shutdown successfully')
  }

  if (record) {
    await record.stop()
    console.log('record shutdown successfully')
  }
  window.onbeforeunload = null
  app.exit()
  e.returnValue = false
}
