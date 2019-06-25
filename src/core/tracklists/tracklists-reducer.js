import { Map } from 'immutable'

import { tracklistActions } from './actions'
import { tracklistReducer } from './tracklist-reducer'

export const initialState = new Map({
  currentTracklistId: null,
  pendingTrackCID: null
})

export function tracklistsReducer (state = initialState, action) {
  const { payload } = action

  switch (action.type) {
    case tracklistActions.FETCH_TRACKS_FULFILLED:
    case tracklistActions.FETCH_TRACK_FULFILLED:
      return state.set(
        payload.logId,
        tracklistReducer(state.get(payload.logId), action)
      )

    case tracklistActions.ADD_TRACK:
      return state.set('pendingTrackCID', action.payload.data.cid)

    case tracklistActions.POST_TRACK_FAILED:
    case tracklistActions.POST_TRACK_FULFILLED:
      return state.set('pendingTrackCID', null)

    case tracklistActions.LOAD_TRACKS:
      return state.merge({
        currentTracklistId: payload.logId,
        [payload.logId]: tracklistReducer(undefined, action)
      })

    default:
      return state
  }
}
