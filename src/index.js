/* global __DEV__ */

import React from 'react'
import ReactDOM from 'react-dom'
import { hot } from 'react-hot-loader'

import Root from '@views/root'

const rootElement = document.getElementById('root')

let render = () => {
  const App = hot(module)(Root)
  ReactDOM.render(<App />, rootElement)
}

// This code is excluded from production bundle
if (__DEV__ && module.hot) {
  // Development render functions
  const renderApp = render
  const renderError = (error) => {
    const RedBox = require('redbox-react').default

    ReactDOM.render(<RedBox error={error} />, rootElement)
  }

  // Wrap render in try/catch
  render = () => {
    try {
      renderApp()
    } catch (error) {
      console.error(error)
      renderError(error)
    }
  }
}

// ========================================================
// Go!
// ========================================================
render()
