Vue.prototype.$http = axios

var incident_list = new Vue({
	el: '#incident-list',
	data: {
		incidents: []
	},
	created() {
		this.$http
		.get(crime_api_url + "/incidents")
		.then(function(response) {
			incident_list.incidents = response.data;
		})
	}
});

