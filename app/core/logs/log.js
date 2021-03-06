import hashicon from 'hashicon'
import { Record, List } from 'immutable'

const getShortAddress = (address) => {
  const parts = address.toString()
    .split('/')
    .filter((e, i) => !((i === 0 || i === 1) && address.toString().indexOf('/orbit') === 0 && e === 'orbitdb'))
    .filter(e => e !== '' && e !== ' ')

  const multihash = parts[0]
  return `${multihash.slice(0, 5)}...${multihash.slice(-5)}`
}

const generateAvatar = (id) => {
  const opts = { size: 100 }
  const icon = hashicon(id, opts)
  return icon.toDataURL()
}

export const Log = new Record({
  id: null,
  address: null,
  alias: null,
  avatar: null,
  name: null,
  logName: null,
  displayName: null,
  shortAddress: null,
  location: null,
  bio: null,
  isLinked: false,
  isReplicating: false,
  isLoadingIndex: false,
  isProcessingIndex: false,
  latestHeadTimestamp: null,
  processingCount: 0,
  peers: new List(),
  isUpdating: false,
  trackCount: 0,
  logCount: 0,
  max: 0,
  length: 0,
  isMe: false
})

export function createLog (data) {
  if (!data.content) {
    return
  }

  const shortAddress = getShortAddress(data.content.address)
  const displayName = data.content.alias || data.content.name || shortAddress
  const latestHead = data.heads.sort((a, b) => b.timestamp - a.timestamp)[0]
  const logName = data.isMe
    ? (data.content.name || shortAddress)
    : (displayName)

  return new Log({
    logName,
    shortAddress,
    displayName,
    id: data.id,
    latestHeadTimestamp: latestHead ? latestHead.payload.value.timestamp : null,
    address: data.content.address,
    alias: data.content.alias,
    avatar: data.content.avatar || data.avatar || generateAvatar(data.content.address),
    name: data.content.name,
    location: data.content.location,
    bio: data.content.bio,
    peers: new List(data.peers),
    isLinked: !!data.isLinked,
    isMe: !!data.isMe,
    isReplicating: !!data.isReplicating,
    isLoadingIndex: !!data.isLoadingIndex,
    isProcessingIndex: !!data.isProcessingIndex,
    trackCount: data.trackCount,
    logCount: data.logCount,
    max: Math.max(data.heads.length && data.heads[0].clock.time, data.replicationStatus.max, 0),
    length: data.length
  })
}
