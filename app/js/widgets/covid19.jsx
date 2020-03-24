import { formatMilliseconds } from 'format-ms'

const TICK_INTERVAL = 5000

const calculateDuration = () => {
  const start = new Date('2020-03-24T00:00:00')
  const diff = Date.now() - start.getTime()

  return formatMilliseconds(diff, { ignore: ['millisecond', 'second'] })
}

export const Covid19 = (widget, data) => {
  const duration = <div class="widget-text">{calculateDuration()}</div>

  const elem = (
    <div className="widget-chrome">
      <div className="widget-title">Time in lockdown</div>
      {duration}
    </div>
  )

  const trim = str => str.replace(/\s+/g, '')
  const trimmedDifferent = (a, b) => trim(a) !== trim(b)

  setInterval(() => {
    let newDuration = calculateDuration()

    if (trimmedDifferent(duration.innerText, newDuration)) {
      duration.innerText = newDuration
    }
  }, TICK_INTERVAL)

  return elem
}
