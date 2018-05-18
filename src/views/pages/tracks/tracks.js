import React from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'

import { tracklistActions } from '@core/tracklists'
import Tracklist from '@components/Tracklist'

export class TracksPage extends React.Component {
  componentWillMount() {
    // '/me' or proper orbitdb address
    const { logId } = this.props.match.params
    this.props.loadTracks(logId)
  }

  render() {
    return (
      <section>
	<h1>Tracks Page</h1>
	<Tracklist />
      </section>
    )
  }
}

const mapDispatchToProps = {
  loadTracks: tracklistActions.loadTracks
}

export default connect(
  null,
  mapDispatchToProps
)(TracksPage)
