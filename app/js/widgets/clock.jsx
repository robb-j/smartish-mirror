import { removeAllChildren } from '../utils'

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

const CurrentDate = (attrs, children) => {
  const now = new Date()

  const formatter = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full'
  })

  console.log(formatter.format(now))

  return <p className="widget-text">{formatter.format(now)}</p>
}

export const Clock = (widget, data) => {
  let time = <CurrentTime />

  const date = <CurrentDate />

  const elem = (
    <div className="widget-chrome">
      {time}
      {date}
    </div>
  )

  setInterval(() => {
    let newTime = CurrentTime()

    // console.log(
    //   time.innerText,
    //   newTime.innerText,
    //   time.innerText === newTime.innerText
    // )

    if (time.innerText === newTime.innerText) return

    elem.replaceChild(newTime, time)
    time = newTime

    // removeAllChildren(time)
    // time.replaceWith(newTime)
    // time.append(newTime)
  }, TICK_INTERVAL)

  return elem
}
