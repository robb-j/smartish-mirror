$(document).ready(function() {
	
	
	var second = 1000;
	var minute = second * 60;
	var hour = minute * 60;
	
	/*
		The Clock Widget
	*/
	updateClock();
	setInterval(updateClock, 0.5 * second);
	
	
	
	
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
});




/** Fetch a resource, using proxy.php to get around XSS */
function proxyLink(params) {
	
	if (params.data === undefined) {
		params.data = {};
	}
	
	params.data.url = encodeURI(params.url);
	params.url = "proxy.php";
	
	$.ajax(params);
}






function updateClock() {
	
	// Update the time element
   $(".clock-widget .widget-title").html(moment().format("h:mm a"));
	
	// Update the date elements
	$(".clock-widget .widget-content .clock-day").html(moment().format("dddd,"));
	$(".clock-widget .widget-content .clock-date").html(moment().format("Do MMMM YYYY"));
}





function updateQuote() {
	
	proxyLink({
		url: "http://api.forismatic.com/api/1.0/?method=getQuote&format=json&lang=en",
		success: function(result) {
			
			// For some reason the api's single-quote character isn't escaped properly?
			var removed = result.replace("\\'", "'");
			setQuote(JSON.parse(removed));
		}
	});
	
}

function setQuote(quote) {
	
	var message = quote.quoteText.trim();
	var author = quote.quoteAuthor.trim();
	
	if (author.length === 0) { author = "unknown"; }
	
	$(".message-widget .message-quote").text(message);
	$(".message-widget .message-author").text(author);
}




function updateCalendar() {
	
	proxyLink({
		url: CONFIG.ical.url,
		success: processCalendar
	});
	
	function processCalendar(result) {
		
		var today = moment().format("YYYYMMDD");
		var tomorrow = moment().add(1, 'days').format("YYYYMMDD");
		
		var events = findEvents(result, function(event) {
			return event.DTSTART.indexOf(today) === 0;
		});
		
		
		events.sort(function(a, b) {
			return (a.START < b.START) ? -1 : 1;
		});
		
		
		var allRows = "";
		
		if (events.length === 0) {
			allRows = "<tr><td>No Events</td></tr>";
		}
		
		for (var i in events) {
			
			var row = "<tr>";
			
			var summary = events[i].SUMMARY;
			var start = events[i].START;
			var end = events[i].END;
			
			if (start === today && end === tomorrow) {
				
				row += "<td align='right'>All Day</td>";
			}
			else {
				
				var date = moment(events[i].START).format("h:mm a");
				row += "<td align='right'>" + date + "  </td>";
			}
			
			row += "<td>" + summary + "</td>";
			row += "</tr>";
			allRows += row;
		}
		
		$(".calendar-widget .widget-content table").html(allRows);
	}
}

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

function processEvents(events) {
	
	var output = [];
	
	for (var i in events) {
		
		var newEvent = {};
		
		for (var property in events[i]) {
			if (events[i].hasOwnProperty(property)) {
				
				var value = events[i][property];
				
				if (property.indexOf("DT") === 0) {
					
					// Its a datetime
					var newName = property.substring(2);
					
					// Do something with the locale?
					// ...
					
					newEvent[newName] = value;
				}
				else if (property !== ""){
					
					newEvent[property] = value;
				}
				
			}
			
			
		}
		
		output.push(newEvent);
	}
	
	return output;
}









function roundTo(val, dp) {
	
	var factor = Math.pow(10, dp);
	return (Math.round(val * factor) / factor).toFixed(dp);
}

function updateWeather() {
	
	function toDeg(kelvin, dp) { return roundTo(kelvin - 273.15, dp); }
	
	function capitalise(string) { return string.charAt(0).toUpperCase() + string.slice(1); }
	
	function processWeather(result) {
		
		var data = JSON.parse(result);
		
		var temp = toDeg(data.main.temp, 1);
		var forcast = data.weather[0].main;
		
		var sunrise = new Date(parseInt(data.sys.sunrise) * 1000);
		var sunset = new Date(parseInt(data.sys.sunset) * 1000);
		
		var text = "";
		
		text += "<p class='widget-heading'>" + data.name + ":</p>";
		
		
		text += "<p>H: " + toDeg(data.main.temp_max, 0) + "&deg; L: " + toDeg(data.main.temp_min, 0) + "&deg;</p>";
		text += "<p>" + capitalise(data.weather[0].description) + "</p>";
		
		
		// If after sunrise or after sunset: show the sunset time
		var now = Date();
		if (now < sunrise || now > sunset) {
			text += "<p>Sunrise at " + moment(sunrise).format("h:mm a") + "</p>";
		}
		else {
			
			// If inbetween sunrise and sunset, show the sunset time
			text += "<p>Sunset at " + moment(sunset).format("h:mm a") + "</p>";
		}
		
		
		$('.weather-widget .widget-title').html(temp + "&deg; " + forcast);
		$('.weather-widget .widget-content').html(text);
	}
	
	function preciseWeather() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(pos) {
				
				var params = $.param({
					appid: CONFIG.weather.apikey,
					lat: pos.coords.latitude,
					lon: pos.coords.longitude
				});
				
				proxyLink({
					url: "http://api.openweathermap.org/data/2.5/weather?" + params,
					success: function(data) {
						processWeather(data, true);
					}
				});
			});
		} else {
			console.log("Geolocation is not supported :-(");
		}
	}
	
	// Load the default location's weather
	proxyLink({
		url: "http://api.openweathermap.org/data/2.5/weather?" + $.param({
			appid: CONFIG.weather.apikey, id: CONFIG.weather.location
		}),
		success: function(data) {
			
			processWeather(data, true);
			
			preciseWeather();
		}
	});
}







function updateNewsFeed() {
	
	proxyLink({
		url: "http://feeds.bbci.co.uk/news/rss.xml?edition=uk",
		success: function(data) {
			
			var news = "";
			var xml = $.parseXML(data);
			
			$(xml).find("item").slice(0,3).each(function() {
				news += "<li>" + $(this).find("title").text() + "</li>";
			});
			
			$(".news-widget .widget-content ul").html(news);
		}
		
	});
}
