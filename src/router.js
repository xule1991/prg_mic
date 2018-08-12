import React from 'react'
import PropTypes from 'prop-types'
import {Switch, Route, routerRedux} from 'dva/router'

import RecordingApp from './routes/RecordingApp'

const { ConnectedRouter } = routerRedux

const Routers = ({ history, app }) => {

	return(
		<ConnectedRouter history ={history}>
			<Switch>
				<Route path="/" exact component={RecordingApp}/>
			</Switch>
		</ConnectedRouter>

	)
}

Routers.propTypes = {
  history: PropTypes.object,
  app: PropTypes.object,
}

export default Routers
