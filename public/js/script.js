/* globals MIRROR_CONF, Trello, $, moment, Handlebars */

/**
*	The script that powers the app
*	Updated: Mar 2016
*	@author robb-j
*/
(function($, moment, Handlebars, _) {
    
    
    //	Internal Properties
    var templateCache = {};
    var allWidgets = [];
    var updateMap = {
        weather: updateWeather,
        news: updateNewsFeed,
        trello: updateTrello,
        clock: updateClock,
        calendar: updateCalendar,
        quote: updateQuote,
        monzo: updateMonzo,
        spotify: updateSpotify
    }
    
    // Useful consts
    var second = 1000;
    var minute = second * 60;
    var hour = minute * 60;
    
    
    
    // App Entrypoint
    $(document).ready(function() {
        
        // The data to render our app with
        var positions = {
            left: [],
            right: [],
            bottom: null
        };
        
        // Parse the left side widgets
        MIRROR_CONF.left.forEach(function(conf) {
            var w = parseWidget(conf);
            positions.left.push(w);
            allWidgets.push(w);
        });
        
        // Parse the right side widgets
        MIRROR_CONF.right.forEach(function(conf) {
            var w = parseWidget(conf);
            positions.right.push(w);
            allWidgets.push(w);
        });
        
        // Parse the bottom widget (if there is one)
        if (MIRROR_CONF.bottom) {
            positions.bottom = parseWidget(MIRROR_CONF.bottom);
            allWidgets.push(positions.bottom);
        }
        
        
        // Use the widgets to setup the app
        renderTemplate('app', positions, function(renderedApp) {
            
            // Add the app to the dom
            $(".mirror-app").html(renderedApp);
            
            // Render each widget
            allWidgets.forEach(function(widget) {
                widget.schedule();
                widget.update(widget);
            });
        });
    });
    
    function parseWidget(widget) {
        
        // Generate a uuid for the widget
        widget.id = guid();
        widget.selector = "#" + widget.id;
        
        // Add the update method to the widget
        widget.update = updateMap[widget.type];
        widget.interval = parseUpdate(widget.tick)
        
        // Add a function to unschedule the widget's tick
        widget.unschedule = function() {
            if (this.updateId) {
                clearInterval(this.updateId)
                this.updateId = null
            }
        }
        
        // Add a function to schedule the widget's tick
        widget.schedule = function() {
            this.unschedule()
            if (this.interval) {
                this.updateId = setInterval(this.update, this.interval, this)
            }
        }
        
        // Add a function to render the widget with params
        widget.render = function(params) {
            renderTemplateTo(this.selector, this.type, params);
        }
        
        // Store config for global use later
        return widget;
    }
    
    function parseUpdate(update) {
        update = update || { h: 1 }
        var interval = 0
        if (update.h) interval += hour * update.h
        if (update.m) interval += minute * update.m
        if (update.s) interval += second * update.s
        return interval
    }
    
    
    
    
    
    //	Utilities
    
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
        $.get('templates/'+template+'.hbs', function(rawTemplate) {
            
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
    
    /** Generate a random guid */
    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }
    
    
    
    
    //	Clock Widget
    
    /** Updates the clock widget */
    function updateClock(widget) {
        
        // Get the formats from the config
        var timeFormat = widget.timeFormat || "h:mm a";
        var dateFormat = widget.dateFormat || "Do MMMM YYYY";
        
        
        // The params to render the clock
        var params = {
            time: moment().format(timeFormat),
            day: moment().format("dddd,"),
            date: moment().format(dateFormat)
        };
        
        // If the time hasn't changed since the last tick, don't re-render
        if (params.time !== widget.lastUpdate) {
            
            // Render the clock
            widget.render(params);
            
            // Remember when last updated
            // -> Uses the param which updates the most
            widget.lastUpdate = params.time;
        }
    }
    
    
    
    
    
    //	Quote Widget
    
    /** Updates the quotes widget */
    function updateQuote(widget) {
        
        $.ajax('api/quote').then(function(data) {
            if (data.replace) {
                var cleaned = data.replace(/\\'/g, "'");
                data = JSON.parse(cleaned);
            }
            setQuote(widget, data)
        });
    }
    
    // Set the current quote
    function setQuote(widget, quote) {
        
        // Get the message's author
        var author = quote.quoteAuthor.trim();
        
        widget.render({
            message: quote.quoteText.trim(),
            author: (author.length === 0) ? "unknown" : author
        })
    }
    
    
    
    
    
    //	Calendar Widget
    
    /** Updates the calendar widget */
    function updateCalendar(widget) {
        
        // Get the iCal data
        $.ajax('api/calendar').then(function(data) {
            processCalendar(widget, data);
        })
    }
    
    /** Processes ical data to render it */
    function processCalendar(widget, result) {
        
        // Some handy times, formatted for ical data
        var today = moment().format("YYYYMMDD");
        
        
        // Get the events that are today
        var events = findEvents(result, function(event) {
            return event.DTSTART.indexOf(today) === 0;
        });
        
        
        // Sort the events, newest first
        events = events.sort(function(a, b) {
            return (a.start < b.start) ? -1 : 1;
        });
        
        
        widget.render({
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
    
    
    
    
    
    
    //	Weather Widget
    
    /** Updates the weather widget */
    function updateWeather(widget) {
        
        var query = $.param({
            location: widget.location
        });
        
        $.ajax('api/weather?'+query).then(function(data) {
            
            processWeather(widget, data)
            
            if (widget.usePrecise) { preciseWeather(widget); }
        });
        
    }
    
    /** Takes a weather API's response and renders in into .weather-widget */
    function processWeather(widget, data) {
        
        
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
        widget.render(params);
    }
    
    /** Performs a weather API request using the user's geolocation (if available) */
    function preciseWeather(widget) {
        
        // Check if geolocation is available
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(pos) {
                
                // Configure our GET params
                var params = $.param({
                    lat: pos.coords.latitude,
                    lon: pos.coords.longitude
                });
                
                // Perform the request & render the result on success
                $.ajax('api/weather?'+params).then(function(data) {
                    processWeather(widget, data);
                });
            });
        } else {
            console.log("Geolocation is not supported :-(");
        }
    }
    
    
    
    
    
    
    //	News Widget
    
    /** Updates the weather widget */
    function updateNewsFeed(widget) {
        
        // Fetch the news from the rss feed
        $.ajax('api/news').then(function(data) {
            
            let numStories = widget.stories || 3;
            let stories = _.map(data.slice(0, numStories), function(story) {
                return story.title
            });
            
            widget.render({ items: stories });
        });
    }
    
    
    
    
    //	Trello Widget
    
    function updateTrello(widget) {
        
        
        // If the Trello lib hasn't been downloaded, download it
        if (typeof Trello === "undefined") {
            
            // If we got here and already tried to load, fail
            if (widget.addedScript) {
                console.log('Failed to load trello');
                return;
            }
            
            // Remember we added the script
            widget.addedScript = true;
            
            // Load the script through js so we can insert the appkey
            // Meaning the appkey isn't stored in the html & therefore the git repo
            // Calls updateTrello `async-recursively` when trello was downloaded
            // TODO: catch if multiple attempts fail?
            var src =  'https://api.trello.com/1/client.js?key=' + widget.appkey;
            loadScript(src, function() { updateTrello(widget) });
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
            success: function() { updateTrelloWithAuth(widget) },
            error: function() { console.log("Trello Auth failed"); }
        });
    }
    
    function updateTrelloWithAuth(widget) {
        
        
        var base = '/lists/' + widget.listId;
        
        
        // A promise to fetch the board
        var fetchBoard = Trello.get(base);
        
        
        // A promise to get the cards from the board
        var fetchCards = fetchBoard.then(function() {
            return Trello.get(base + '/cards?checklists=all');
        });
        
        
        // Executes when the other promises both resolve
        Promise.all([fetchBoard, fetchCards]).then(values => {
            
            // Unpack the previous promise's values
            var [board, cards] = values;
            
            
            // Format each card for rendering
            var processedCards = _.map(cards, function(card) {
                
                // Parse each card to simplify for rendering
                return {
                    name: card.name, lists: _.map(card.checklists, function(list) {
                        
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
            widget.render({
                board: board,
                cards: processedCards
            });
        });
        
    }
    
    
    
    
    // Monzo Widget
    
    function updateMonzo(widget) {
        
        $.ajax('api/monzo').then(function(data) {
            widget.render({ data: data });
        })
        .catch(function() {
            widget.render(null);
        })
    }
    
    
    
    
    // Spotify Widget
    
    function updateSpotify(widget) {
        
        $.ajax('api/spotify').then(function(data) {
            
            // Assume non-playing
            if (widget.state !== 'playing' && data.playing) {
                
                // Go into playing state
                widget.unschedule()
                widget.updateId = setInterval(widget.update, 3000, widget)
                widget.state = 'playing'
                console.log('Spotify: entering playing state');
            }
            
            if (widget.state === 'playing' && !data.playing) {
                
                // Go into sleep state
                widget.schedule()
                widget.state = 'sleep'
                console.log('Spotify: entering sleep state');
            }
            
            widget.render({data: data})
        })
        .catch(function() {
            widget.render(null)
        })
    }
    
    
    
})($, moment, Handlebars, _);
