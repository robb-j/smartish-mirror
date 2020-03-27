import { setInnerTextIfDifferent } from '../utils'

const TICK_INTERVAL = 200

const days = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
]
const months = [
  'January',
  'Febuary',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

function formatTime(date) {
  const pad = number => number.toString().padStart(2, '0')

  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())

  return `${hours}:${minutes}`
}

function formatDay(date) {
  return days[date.getDay()]
}

function formatDate(date) {
  const dayOfMonth = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()

  return `${dayOfMonth} ${month} ${year}`
}

export const Clock = (widget, data) => {
  const startDate = new Date()

  const time = <span>{formatTime(startDate)}</span>
  const day = <span>{formatDay(startDate)}</span>
  const date = <span>{formatDate(startDate)}</span>

  const elem = (
    <div className="widget-chrome">
      <p className="widget-title">{time}</p>
      <p className="widget-text">
        {day}
        <br />
        {date}
      </p>
    </div>
  )

  setInterval(() => {
    const newDate = new Date()

    setInnerTextIfDifferent(time, formatTime(newDate))
    setInnerTextIfDifferent(day, formatDay(newDate))
    setInnerTextIfDifferent(date, formatDate(newDate))
  }, TICK_INTERVAL)

  return elem
}
