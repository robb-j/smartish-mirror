# Smart(ish) Mirror
- Rob Anderson, robb-j
- A JQuery based webapp to display a heads up for your day


###### Requirements
- Something running Apache/Nginx
- Some form of php
- A rough understanding of json


## Features
- The date & time
- Your iCal events
- The weather forecast in your area
- The latest [BBC News](http://bbc.co.uk/news) articles
- Display cards from [Trello](https://trello.com)
- Motivational quotes


## Setup
1. Make a copy of `js/example.config.js` called `js/config.js`
2. Arrange your widgets, the order of the objects is the order they will be displayed
    * `left` Widgets are displayed down the left hand side
    * `right` Widgets are displayed down the right hand side
    * The `bottom` widget is a single widget object to display at the bottom. Right now only the `quote` widget works well here
3. Modify the keys for your widgets
    * `calendar.url` is the url to a shared iCalendar (e.g. generated in iOS's Calendar app)
    * `weather.apikey` is your api key for [Open Weather Map](https://openweathermap.org), you'll need to [generate a one](https://openweathermap.org/appid)
    * `weather.location` is the default location used to get your weather forecast, used if your location cannot be determined, [find your city](http://openweathermap.org/help/city_list.txt)
    * `trello.appkey` Is your Trello app key, [find it here](https://trello.com/app-key)
    * `trello.listId` Is the identifier of the Trello list you want to display, on [Trello.com](https://Trello.com) visit a card on the list you want and add `.json` to the url. Your listId is in there under `idList`



## Notes
* Doesn't handle multiple widgets of the same type
* Handle Trello library fetching failing
* Some non-popup based way of authenticating with Trello
