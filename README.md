# Smart(ish) Mirror
- Rob Anderson, robb-j
- A JQuery based webapp to display a heads up for your day ahead


###### Requirements
- Something running Apache/Nginx
- Some form of php


## Features
- The date & time
- Your iCal events
- The weather forecast in your area
- The latest [BBC News](http://bbc.co.uk/news) articles
- Motivational quotes


## Setup
1. Make a copy of `js/example.secrets.js` called `js/secrets.js`
2. Modify the keys in that file
    1. `ical.url` is the url to a shared iCalendar (e.g. generated in iOS's Calendar app)
    2. `weather.apikey` is your api key for [Open Weather Map](https://openweathermap.org), you'll need to [generate a one](https://openweathermap.org/appid)
    3. `weather.location` is the default location used to get your weather forecast, used if your location cannot be determined, [find your city](http://openweathermap.org/help/city_list.txt)
