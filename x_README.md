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

## Installing Node on a pi

```
wget http://node-arm.herokuapp.com/node_latest_armhf.deb
sudo dpkg -i node_latest_armhf.deb
rm node_latest_armhf.deb
```

## Mirror Setup

1. Setup the project with `sudo sh setup.sh`
2. Arrange your widgets in `public/js/config.js`, the order of the objects is the order they will be displayed
   - `left` widgets are displayed down the left
   - `right` widgets down the right
   - The `bottom` widget is a single object to display at the bottom. Right now only the `quote` widget works well here
3. Modify the parameters for your widgets, see Widget Configuration below
4. Configure the node server in `web/config.js`
   - `weather.apikey` is your api key for [Open Weather Map](https://openweathermap.org), you'll need
   - `calendar.url` is the url to a shared iCalendar (e.g. generated in iOS's Calendar app)
   - `server.port` is the port the webapp will run on
5. Start the node server with `npm start`

## Widget Configuration

- Each widget is defined by its `type`, the available types are: `calendar`, `clock`, `monzo`, `news`, `quote`, `trello` & `weather`.
- You specify how often a widget updates with its `tick` property, the default tick is every hour. See `example.config.js` for examples.
- Each widget then defines its own configuration like the clock's time format.
- Here are the available customisations:
  - `clock.timeFormat` is the format time will be displayed in [(format)](https://momentjs.com/docs/#/parsing/string-format/)
  - `clock.dateFormat` is the format the date will be displayed in [(format)](https://momentjs.com/docs/#/parsing/string-format/)
    to [generate a one](https://openweathermap.org/appid)
  - `weather.location` is the default location used to get your weather forecast, used if your location cannot be determined, [find your city](http://openweathermap.org/help/city_list.txt)
  - `trello.appkey` Is your Trello app key, [find it here](https://trello.com/app-key)
  - `trello.listId` Is the identifier of the Trello list you want to display, on [Trello.com](https://trello.com) visit a card on the list you want and add `.json` to the url. Your listId is in there under `idList`

## Notes

- Some non-popup based way of authenticating with Trello
- Perhaps a more user-friendly config like yaml?
