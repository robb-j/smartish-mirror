import { ensureData, renderError } from '../utils'

const repo = event => (
  <span className="github-repository">{event.repo.name}</span>
)

const eventTypes = {
  CreateEvent: event => (
    <>
      created {event.payload.ref_type} {event.payload.ref}
      {' in '}
      {repo(event)}
    </>
  ),
  PushEvent: event => <>pushed to {repo(event)}</>,
  RepositoryEvent: event => (
    <>
      {event.payload.action} repo {repo(event)}{' '}
    </>
  )
}

export const GitHub = (widget, data) => {
  const [activity, error] = ensureData(data, 'github/activity')
  if (error) return renderError('GitHub', error)

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
