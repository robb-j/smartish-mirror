import { formatMilliseconds } from 'format-ms'
import { setInnerTextIfDifferent } from '../utils'

const TICK_INTERVAL = 5000
const LOCKDOWN_START = new Date('2020-03-24T00:00:00').getTime()

const calculateDuration = () => {
  const diff = Date.now() - LOCKDOWN_START

  return formatMilliseconds(diff, { ignore: ['millisecond', 'second'] })
}

function countBeers(untappdFeed) {
  if (!untappdFeed || untappdFeed.status !== 200) return '~'

  return untappdFeed.data.filter(
    item => new Date(item.pubDate).getTime() > LOCKDOWN_START
  ).length
}

export const Covid19 = (widget, data) => {
  const untappd = data.get('untappd/feed')

  const duration = <span>{calculateDuration()}</span>
  const beers = <span>{countBeers(untappd)}</span>

  const elem = (
    <div className="widget-chrome">
      <div className="widget-title">Lockdown</div>
      <div className="widget-text">Duration {duration}</div>
      <div className="widget-text">Beers drank {beers}</div>
    </div>
  )

  setInterval(() => {
    setInnerTextIfDifferent(duration, calculateDuration())
    setInnerTextIfDifferent(beers, '' + countBeers(untappd))
  }, TICK_INTERVAL)

  return elem
}
