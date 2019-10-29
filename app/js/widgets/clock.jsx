const TICK_INTERVAL = 200

const CurrentTime = (attrs, children) => {
  const now = new Date()

  const pad = number => number.toString().padStart(2, '0')

  const hours = pad(now.getHours())
  const minutes = pad(now.getMinutes())
  const seconds = pad(now.getSeconds())

  return (
    <p className="widget-title">
      {hours}:{minutes}:{seconds}
    </p>
  )
}

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
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

const CurrentDate = (attrs, children) => {
  const now = new Date()

  // const formatter = new Intl.DateTimeFormat('en-GB', {
  //   dateStyle: 'full'
  // })

  const dayOfWeek = days[now.getDay()]
  const dayOfMonth = now.getDate()
  const month = months[now.getMonth()]
  const year = now.getFullYear()

  return (
    <p className="widget-text">
      {dayOfWeek},
      <br />
      {dayOfMonth} {month} {year}
    </p>
  )
}

export const Clock = (widget, data) => {
  let time = <CurrentTime />
  let date = <CurrentDate />

  const elem = (
    <div className="widget-chrome">
      {time}
      {date}
    </div>
  )

  setInterval(() => {
    let newTime = <CurrentTime />
    let newDate = <CurrentDate />

    if (time.innerText !== newTime.innerText) {
      elem.replaceChild(newTime, time)
      time = newTime
    }

    if (date.innerText !== newDate.innerText) {
      elem.replaceChild(newDate, date)
      date = newDate
    }
  }, TICK_INTERVAL)

  return elem
}
