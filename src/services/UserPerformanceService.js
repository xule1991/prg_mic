import axios from 'axios';

var UserPerformanceService = {
	getTeammates: () => {
		return axios({
			method: 'get',
			url: '/CRSO/api/metricScoreOverview'
			//url: 'http://localhost:3000/metricScoreOverview'
		})
	}
}

export default UserPerformanceService