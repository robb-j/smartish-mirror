import { ensureData, renderError, FaIcon } from '../utils'

const iconMap = {
  'clear-day': ['far', 'sun'],
  'clear-night': ['fas', 'moon'],
  rain: ['fas', 'umbrella'],
  snow: ['far', 'snowflake'],
  sleet: ['fas', 'cloud-rain'],
  wind: ['fas', 'wind'],
  fog: ['fas', 'smog'],
  cloudy: ['fas', 'cloud'],
  'partly-cloudy-day': ['fas', 'cloud-sun'],
  'partly-cloudy-night': ['fas', 'cloud-moon']
}

function WeatherIcon(attrs, children) {
  const { iconKey } = attrs
  const icon = iconKey && iconMap[iconKey]

  if (!icon) return ''

  const [prefix, iconName] = icon
  return <FaIcon prefix={prefix} iconName={iconName} />
}

export const DarkSky = (widget, data) => {
  let [forcast, error] = ensureData(data, 'darksky/forecast')

  if (error) return renderError('DarkSky', error)

  const toTemp = num => `${num.toFixed(1)}°C`
  const toMph = num => `${num.toFixed(0)}Mph`
  const toPercent = num => (num * 100).toFixed(0) + '%'

  const high = Math.max(...forcast.hourly.data.map(f => f.apparentTemperature))
  const low = Math.min(...forcast.hourly.data.map(f => f.apparentTemperature))

  return (
    <div className="widget-chrome">
      <p className="widget-title">DarkSky</p>
      <p className="widget-heading">
        <WeatherIcon iconKey={forcast.currently.icon} />
        {forcast.currently.summary}
      </p>
      <p className="widget-text">{forcast.hourly.summary}</p>
      <p className="widget-label">Forcast</p>
      <ul className="widget-list">
        <li className="widget-listItem">
          Feels like {toTemp(forcast.currently.apparentTemperature)}
        </li>
        <li className="widget-listItem">
          H: {toTemp(high)}, L: {toTemp(low)}
        </li>
        <li className="widget-listItem">
          {toPercent(forcast.currently.precipProbability)} chance of rain
        </li>
        <li className="widget-listItem">
          {toMph(forcast.currently.windSpeed)} wind at{' '}
          {forcast.currently.windBearing}&deg;
        </li>
      </ul>
    </div>
  )
}
