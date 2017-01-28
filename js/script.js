/* jshint esversion:6 */

/**
 *	The script that powers the app
 *	Updated: Dec 2016
 *	@author robb-j
 */
(function($, moment, Handlebars, _) {
	
	
	
	
	
	/*
	 *	Internal Properties
	 */
	var lastClockUpdate = "";
	
	var CONFIG = {};
	
	var templateCache = {};
	
	
	
	
	/*
	 *	App Entrypoint
	 */
	$(document).ready(function() {
		
		
		// The data to render our app with
		var widgets = {
			left: [],
			right: [],
			bottom: null
		};
		
		
		// A util to get the name of a widget & store its config in our global
		function parseWidget(conf) {
			CONFIG[conf.name] = conf;
			return conf.name;
		}
		
		
		// Parse the left side widgets
		for (var l in MIRROR_CONF.left) {
			widgets.left.push(parseWidget(MIRROR_CONF.left[l]));
		}
		
		// Parse the right side widgets
		for (var r in MIRROR_CONF.right) {
			widgets.right.push(parseWidget(MIRROR_CONF.right[r]));
		}
		
		// Parse the bottom widget (if there is one)
		if (MIRROR_CONF.bottom) {
			widgets.bottom = parseWidget(MIRROR_CONF.bottom);
		}
		
		
		// Use the widgets to setup the app
		renderTemplate('app', widgets, function(renderedApp) {
			
			
			// Set the app
			$(".mirror-app").html(renderedApp);
			
			
			
			
			
			
			// Variables to make scheduling a bit more verbose
			var second = 1000;
			var minute = second * 60;
			var hour = minute * 60;
			
			
			/*
				The Clock Widget
			*/
			updateClock();
			setInterval(updateClock, 0.2 * second);
			
			
			/*
				The Quote widget
			*/
			updateQuote();
			setInterval(updateQuote, hour);
			
			
			/*
				The Calendar widget
			*/
			updateCalendar();
			setInterval(updateCalendar, 5 * minute);
			
			
			/*
				The Weather widget
			*/
			updateWeather();
			setInterval(updateWeather, 10 * minute);
			
			
			/*
				The News Widget
			*/
			updateNewsFeed();
			setInterval(updateNewsFeed, 15 * minute);
			
			
			/*
				The Trello Widget
			*/
			updateTrello();
			setInterval(updateTrello, 5 * minute);
		});
	});
	
	
	
	
	
	/*
	 *	Utilities
	 */

	/** Fetches a resource, using proxy.php to get around XSS */
	function proxyLink(params) {
		
		// If no data subobject, add one
		if (params.data === undefined) {
			params.data = {};
		}
		
		// Set the data's url to the url to pass to proxy.php
		params.data.url = encodeURI(params.url);
		
		// Set the url to the proxy script
		params.url = "proxy.php";
		
		// Use the modified params with jquery's ajax
		$.ajax(params);
	}

	/** Rounds a number to a set number of decimal places */
	function roundTo(val, dp) {
		
		var factor = Math.pow(10, dp);
		return (Math.round(val * factor) / factor).toFixed(dp);
	}

	/** Converts a number in Kelvin to Degrees, rounded to `dp` decimal places */
	function toDeg(kelvin, dp) {
		return roundTo(kelvin - 273.15, dp);
	}

	/** Capitalises a string */
	function capitalise(string) {
		return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
	}
	
	/** Adds a <script> to the html and calls a callback when it loaded */
	function loadScript(src, callback) {
		
		// ref: http://stackoverflow.com/questions/12820953/asynchronous-script-loading-callback
		var s = document.createElement('script');
		s.src = src;
		s.async = true;
		s.onreadystatechange = s.onload = function() {
			if (!callback.done && (!s.readyState || /loaded|complete/.test(s.readyState))) {
				callback.done = true;
				callback();
			}
		};
		document.querySelector('head').appendChild(s);
	}
	
	/** Render a template, calling `success` with the render */
	function renderTemplate(template, data, success) {
		
		// If we've already compiled the template, use that
		if (templateCache.hasOwnProperty(template)) {
			success(templateCache[template](data));
			return;
		}
		
		// Otherwise fetch the raw template
		$.get('templates/'+template+'.html', function(rawTemplate) {
			
			// Compile the template
			templateCache[template] = Handlebars.compile(rawTemplate);
			
			// Render with it
			success(templateCache[template](data));
		});
	}
	
	/** Renders a template and puts it into `dest` */
	function renderTemplateTo(dest, template, data) {
		
		renderTemplate(template, data, function(html) {
			$(dest).html(html);
		});
	}





	/*
	 *	Clock Widget
	 */

	/** Updates the clock widget */
	function updateClock() {
		
		// Get the formats from the CONFIG
		var timeFormat = CONFIG.clock.timeFormat;
		var dateFormat = CONFIG.clock.dateFormat;
		
		
		// If not set, use a default value
		if (timeFormat === undefined) { timeFormat = "h:mm a"; }
		if (dateFormat === undefined) { dateFormat = "Do MMMM YYYY"; }
		
		
		// The params to render the clock
		var params = {
			time: moment().format(timeFormat),
			day: moment().format("dddd,"),
			date: moment().format(dateFormat)
		};
		
		// If the time hasn't changed since the last tick, don't re-render
		if (params.time !== lastClockUpdate) {
			
			// Render the clock
			renderTemplateTo('.widget.clock', 'clock', params);
			
			// Remember when last updated
			// -> Uses the param which updates the most
			lastClockUpdate = params.time;
		}
	}





	/*
	 *	Quote Widget
	 */

	/** Updates the quotes widget */
	function updateQuote() {
		
		// Fetch from the Quote api
		proxyLink({
			url: "http://api.forismatic.com/api/1.0/?method=getQuote&format=json&lang=en",
			success: function(result) {
				
				// For some reason the api's single-quote character isn't escaped properly?
				var processed = result.replace(/\\'/g, '\'');
				setQuote(JSON.parse(processed));
			}
		});
	}

	// Set the current quote
	function setQuote(quote) {
		
		// Get the message's author
		var author = quote.quoteAuthor.trim();
		
		
		// Render the quote
		renderTemplateTo('.widget.quote', 'quote', {
			message: quote.quoteText.trim(),
			author: (author.length === 0) ? "unknown" : author
		});
	}





	/*
	 *	Calendar Widget
	 */

	/** Updates the calendar widget */
	function updateCalendar() {
		
		// Get the iCal data
		proxyLink({url: CONFIG.calendar.url, success: processCalendar});
	}
	
	/** Processes ical data to render it */
	function processCalendar(result) {
		
		// Some handy times, formatted for ical data
		var today = moment().format("YYYYMMDD");
		var tomorrow = moment().add(1, 'days').format("YYYYMMDD");
		
		
		// Get the events that are today
		var events = findEvents(result, function(event) {
			return event.DTSTART.indexOf(today) === 0;
		});
		
		
		// Sort the events, newest first
		events = events.sort(function(a, b) {
			return (a.start < b.start) ? -1 : 1;
		});
		
		
		// Render the events to the calendar widget
		renderTemplateTo('.widget.calendar', 'calendar', {
			events: events,
			noEvents: events.length === 0
		});
	}

	/** Parses ical data to find events that match `predicate` */
	function findEvents(iCalData, predicate) {
		
		var startIndex = 0;
		var endIndex = 0;
		var eventData;
		var evnt;
		var properties;
		
		var semiColonIndex = -1;
		
		var matches = [];
		
		while (startIndex >= 0) {
			
			// Find a pair of Event BEGIN/END tags
			startIndex = iCalData.indexOf("BEGIN:VEVENT", endIndex);
			endIndex = iCalData.indexOf("END:VEVENT", startIndex);
			
			// Get the event data
			eventData = iCalData.substring(startIndex+14, endIndex);
			
			// Construct the event
			evnt = {};
			properties = eventData.split("\n");
			
			// Loop through each line to find a property
			for (var i in properties) {
				
				var propVal = properties[i].split(":");
				
				if (propVal[0] === "" || propVal[1] === undefined) { continue; }
				
				semiColonIndex = propVal[0].indexOf(";");
				
				if (semiColonIndex > 0) {
					propVal[0] = propVal[0].substring(0, semiColonIndex);
				}
				
				evnt[propVal[0]] = propVal[1].substring(0, propVal[1].length - 1);
			}
			
			// Add this event if the predicate matches
			if (predicate(evnt)) {
				
				matches.push(evnt);
			}
		}
		
		return processEvents(matches);
	}

	/** Takes parsed events and lowercases & removes 'dt' from keys, could do something fancy with the dates or extra processing on the events */
	function processEvents(events) {
		
		// Some handy dates
		var today = moment().format("YYYYMMDD");
		var now = moment();
		var tomorrow = moment().add(1, 'days').format("YYYYMMDD");
		
		
		// An array to put the processed events
		var output = [];
		
		
		// Loops through each event
		for (var i in events) {
			
			// Create an event object for the event
			var newEvent = {};
			
			// Loop through each property on the event
			for (var property in events[i]) {
				
				// If the event has the property
				if (events[i].hasOwnProperty(property)) {
					
					// Get the value of the property
					var value = events[i][property];
					var newName = property.toLowerCase();
					
					// If the propert is `DT` convert it to a datetime
					if (newName.indexOf("dt") === 0) {
						
						// Its a datetime
						newName = newName.substring(2);
						
						// Do something with the locale?
						// ...
						
						// Set the datetime back
						newEvent[newName] = value;
					}
					else if (property !== ""){
						
						// If the property name isn't empty, add the property to the event object
						newEvent[newName] = value;
					}
					
				}
				
			}
			
			
			
			
			/*
			 *	Add some extra properties to the events
			 */
			
			// Whether the event an all day event or not
			newEvent.isAllDay = (newEvent.start === today && newEvent.end === tomorrow);
			
			// A formatted version of the date
			newEvent.formattedDate = moment(newEvent.start).format("h:mm a");
			
			
				
			// Add the event to our list
			output.push(newEvent);
			
		}
		
		// Return the processed events
		return output;
	}





	/*
	 *	Weather Widget
	 */

	/** Updates the weather widget */
	function updateWeather() {
		
		// Load the default location's weather first
		proxyLink({
			url: "http://api.openweathermap.org/data/2.5/weather?" + $.param({
				appid: CONFIG.weather.apikey, id: CONFIG.weather.location
			}),
			success: function(data) {
				
				// Process the response & display it
				processWeather(data, true);
				
				// Load the precise weather (using geo-location)
				if (CONFIG.weather.usePrecise) {
					preciseWeather();
				}
			}
		});
	}

	
	/** Takes a weather API's response and renders in into .weather-widget */
	function processWeather(result) {
		
		// Parse the result
		var data = JSON.parse(result);
		
		
		// Get the sunrise & sunset times
		var sunrise = new Date(parseInt(data.sys.sunrise) * 1000);
		var sunset = new Date(parseInt(data.sys.sunset) * 1000);
		
		
		// The base parameters to render with
		var params = {
			curTemp: toDeg(data.main.temp, 1),
			forecast: data.weather[0].main,
			location: data.name,
			maxTemp: toDeg(data.main.temp_max, 0),
			minTemp: toDeg(data.main.temp_min, 0),
			description: capitalise(data.weather[0].description)
		};
		
		
		// Add the sunrise/sunset depending on which is closest
		var now = new Date();
		if (now < sunrise || now > sunset) {
			params.sunrise = moment(sunrise).format("h:mm a");
		}
		else {
			params.sunset = moment(sunset).format("h:mm a");
		}
		
		
		// Render the template into the weather widget
		renderTemplateTo('.widget.weather', 'weather', params);
		
	}
	
	/** Performs a weather API request using the user's geolocation (if available) */
	function preciseWeather() {
		
		// Check if geolocation is available
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(pos) {
				
				// Configure our GET params
				var params = $.param({
					appid: CONFIG.weather.apikey,
					lat: pos.coords.latitude,
					lon: pos.coords.longitude
				});
				
				// Perform the request & render the result on success
				proxyLink({
					url: "http://api.openweathermap.org/data/2.5/weather?" + params,
					success: processWeather
				});
			});
		} else {
			console.log("Geolocation is not supported :-(");
		}
	}
	
	
	
	
	
	/*
	 *	News Widget
	 */
	
	/** Updates the weather widget */
	function updateNewsFeed() {
		
		// Fetch the news from the rss feed
		proxyLink({
			url: "http://feeds.bbci.co.uk/news/rss.xml?edition=uk",
			success: function(data) {
				
				var xml = $.parseXML(data);
				
				var limit = CONFIG.news.stories;
				
				var params = {
					items: $(xml).find("item").slice(0,limit).map(function() {
						return $(this).find("title").text();
					}).toArray()
				};
				
				renderTemplateTo('.widget.news', 'news', params);
			}
			
		});
	}
	
	
	
	
	/*
	 *	Trello Widget
	 */
	function updateTrello() {
		
		// If trello isn't defined, don't bother updading
		if (CONFIG.trello === undefined) {
			return;
		}
		
		
		// If the Trello lib hasn't been downloaded, download it
		if (typeof Trello === "undefined") {
			
			// Load the script through js so we can insert the appkey
			// Meaning the appkey isn't stored in the html & therefore the git repo
			// Calls updateTrello `async-recursively` when trello was downloaded
			// TODO: catch if multiple attempts fail?
			var src =  'https://api.trello.com/1/client.js?key=' + CONFIG.trello.appkey;
			loadScript(src, updateTrello);
			return;
		}
		
		
		// Authorise the js app to use the user's trello boards
		Trello.authorize({
			type: 'popup',
			name: 'Smart(ish) Mirror',
			scope: {
				read: 'true',
				write: 'false'
			},
			expiration: 'never',
			success: updateTrelloWithAuth,
			error: function() {
				console.log("Trello Auth failed");
			}
		});
	}
	
	function updateTrelloWithAuth() {
		
		
		var base = '/lists/' + CONFIG.trello.listId;
		
		var board = null;
		
		
		// A promise to fetch the board
		var fetchBoard = Trello.get(base);
		
		
		// A promise to get the cards from the board
		var fetchCards = fetchBoard.then(function(cards) {
			return Trello.get(base + '/cards?checklists=all');
		});
		
		
		// Executes when the other promises both resolver
		Promise.all([fetchBoard, fetchCards]).then(values => {
			
			// Unpack the previous promise's values
			var [board, cards] = values;
			
			
			// Format each card for rendering
			var processedCards = _.map(cards, function(card) {
				
				// Parse each card to simplify for rendering
				return {
					name: card.name,
					lists: _.map(card.checklists, function(list) {
						
						// Get the list its name and total items
						return {
							name: list.name,
							total: list.checkItems.length,
							complete: _.reduce(list.checkItems, function(count, item) {
								return count + ((item.state === 'complete') ? 1 : 0);
							}, 0)
						};
					})
				};
			});
	
	
			// With the board & cards, render our widget
			renderTemplateTo('.widget.trello', 'trello', {
				board: board,
				cards: processedCards
			});
			
		});
		
	}
	
	
	
	
	
})($, moment, Handlebars, _);
