var MIRROR_CONF = {
	
	left: [
		{
			apikey: "api key for https://openweathermap.org/",
			location: "your default location id for https://openweathermap.org/ (used if no geolocation)",
			usePrecise: true,
		},
		{
			name: "news",
			stories: 3
		},
		{
			name: "trello",
			appkey: "your trello app key from https://trello.com/app-key",
			listId: "the id of the list you want to display"
		}
	],
	
	right: [
		{
			name: "clock",
		},
		{
			name: "calendar",
			url: "the url to your ical feed"
		}
	],
	
	bottom: {
		name: "quote"
	}
	
};
