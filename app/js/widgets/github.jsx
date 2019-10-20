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

  const eventMessages = activity
    .filter(e => Object.keys(eventTypes).includes(e.type))
    .map(e => eventTypes[e.type](e))
    .slice(0, 3)

  let activitySection = []
  if (eventMessages.length > 0) {
    activitySection = [
      <p className="widget-label">Recent</p>,
      <ul className="widget-list">
        {eventMessages.map(msg => (
          <li className="widget-listItem">{msg}</li>
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
