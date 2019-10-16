import { ensureData } from '../utils'

const repo = event => (
  <span className="github-repository">{event.repo.name}</span>
)

const eventTypes = {
  CreateEvent: event => (
    <span>
      created {event.payload.ref_type} {event.payload.ref}
      {' in '}
      {repo(event)}
    </span>
  ),
  PushEvent: event => <span>pushed to {repo(event)}</span>,
  RepositoryEvent: event => (
    <span>
      {event.payload.action} repo {repo(event)}{' '}
    </span>
  )
}

export const GitHub = (widget, data) => {
  const [activity, error] = ensureData(data, 'github/activity')
  if (error) return error

  const events = activity
    .filter(e => Object.keys(eventTypes).includes(e.type))
    .slice(0, 5)

  let activitySection = []
  if (events.length > 0) {
    activitySection = [
      <p className="widget-label">Recent</p>,
      <ul className="widget-list">
        {events.map(event => (
          <li className="widget-listItem">{eventTypes[event.type](event)}</li>
        ))}
      </ul>
    ]
  } else {
    activitySection = [<p className="widget-text">No recent activity</p>]
  }

  return (
    <div className="widget-chrome">
      <p className="widget-title">GitHub</p>
      {activitySection}
    </div>
  )
}
