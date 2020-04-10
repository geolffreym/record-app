import React from 'react'

import Artwork from '@components/artwork'
import IconButton from '@components/icon-button'
import FormattedTime from '@components/formatted-time'
import Tags from '@components/tags'

import './track.styl'

class Track extends React.Component {
  render () {
    const {
      track,
      isPlaying,
      isSelected,
      isLoading,
      pause,
      play,
      remove,
      add,
      app,
      style,
      index,
      tracklistId
    } = this.props

    if (!track) {
      return null
    }

    const { haveTrack } = track

    let artwork = track.thumbnail
    if (artwork && !haveTrack) {
      artwork += '?localOnly=true'
    }

    return (
      <article className={'track' + (isSelected ? ' selected' : '')} style={style}>
        <div className='track__index'>{index}</div>
        <div className='track__actions'>
          <IconButton
            icon={haveTrack ? 'star-solid' : 'star-outline'}
            label={haveTrack ? 'Save' : 'Remove'}
            isLoading={track.isUpdating}
            onClick={haveTrack ? remove.bind(null, app.address, { trackId: track.id }) : add.bind(null, app.address, { cid: track.contentCID })}
          />
        </div>
        <Artwork className='track__play' url={artwork} background>
          <IconButton
            icon={isPlaying ? 'pause' : 'play'}
            label={isPlaying ? 'Pause' : 'Play'}
            isLoading={isLoading}
            onClick={isPlaying ? pause : play}
          />
        </Artwork>
        <div className='track__body'>
          <div className={`track__title ${track.isLocal ? 'track__available' : ''}`}>{track.name}</div>
        </div>
        <div className='track__artist'>{track.artist}</div>
        <Tags track={track} tracklistId={tracklistId} />
        <small className='track__bitrate'>{track.bitrate ? Math.round(parseInt(track.bitrate) / 1000) : 'Nan'}</small>
        <small className='track__duration'>
          <FormattedTime value={track.duration} unit={'ms'} />
        </small>
        <small className='track__format'>{track.format}</small>
      </article>
    )
  }
}

export default Track