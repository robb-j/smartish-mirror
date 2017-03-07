# Smart(ish) Mirror
- Rob Anderson, robb-j
- A JQuery & Handlebars webapp to display a heads up for your day with a node server for fetching data


###### Requirements
- Something running node
- A rough understanding of json


## Features
- The date & time
- Your iCal events
- The weather forecast in your area
- The most positive news from [Good News!](http://gdnws.co.uk/)
- Display cards from [Trello](https://trello.com)
- Motivational quotes


## Setup
1. Make a copy of `public/js/example.config.js` called `public/js/config.js`
2. Arrange your widgets, the order of the objects is the order they will be displayed
    * `left` widgets are displayed down the left
    * `right` widgets down the right
    * The `bottom` widget is a single object to display at the bottom. Right now only the `quote` widget works well here
3. Modify the parameters for your widgets
    * `clock.timeFormat` is the format time will be displayed in [(format)](https://momentjs.com/docs/#/parsing/string-format/)
    * `clock.dateFormat` is the format the date will be displayed in [(format)](https://momentjs.com/docs/#/parsing/string-format/)
     to [generate a one](https://openweathermap.org/appid)
    * `weather.location` is the default location used to get your weather forecast, used if your location cannot be determined, [find your city](http://openweathermap.org/help/city_list.txt)
    * `trello.appkey` Is your Trello app key, [find it here](https://trello.com/app-key)
    * `trello.listId` Is the identifier of the Trello list you want to display, on [Trello.com](https://Trello.com) visit a card on the list you want and add `.json` to the url. Your listId is in there under `idList`
4. Make a copy of `web/example.config.js` called `web/config.js`
5. Add your credentials for the apis you want to use
    * `weather.apikey` is your api key for [Open Weather Map](https://openweathermap.org), you'll need
    * `calendar.url` is the url to a shared iCalendar (e.g. generated in iOS's Calendar app)
6. (optional) Set the port you want the server to run on with `export MIR_PORT=80`
7. Start the node server with `npm start`



## Notes
* Doesn't handle multiple widgets of the same type
* Handle Trello library fetching failing
* Some non-popup based way of authenticating with Trello
* Better way of storing config & default values
* Perhaps a more user-friendly config like yaml?
