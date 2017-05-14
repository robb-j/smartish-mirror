var MIRROR_CONF = {
	
	left: [
		{
			type: "weather",
			tick: { m: 5 },
			apikey: "api key for https://openweathermap.org/",
			location: "your default location id for https://openweathermap.org/ (used if no geolocation)",
			usePrecise: true,
		},
		{
			type: "news",
      tick: { h: 1 },
			stories: 3
		},
		{
			type: "trello",
			tick: { m: 1 },
			appkey: "your trello app key from https://trello.com/app-key",
			listId: "the id of the list you want to display"
		}
	],
	
	right: [
		{
			type: "clock",
			tick: { s: 0.2 },
		},
		{
			type: "calendar",
			tick: { m: 15 },
			url: "the url to your ical feed"
		}
	],
	
	bottom: {
		type: "quote",
		tick: { h: 1 }
	}
	
};
