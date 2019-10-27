import { ensureData } from '../utils'

function LatestStories(attrs, children) {
  let { stories = [] } = attrs

  if (stories.length === 0) {
    return <p className="widget-text">No stories right now</p>
  }

  let trimmedStories = stories
    .slice(0, 5)
    .map(story => <li className="widget-listItem">{story.webTitle}</li>)

  console.log(trimmedStories)

  return (
    <>
      <p className="widget-label">Recent stories</p>
      <ol className="widget-list widget-list--padded">{trimmedStories}</ol>
    </>
  )
}

export function Guardian(widget, data) {
  let [stories, error] = ensureData(data, 'guardian/latest')

  if (error) return error

  return (
    <div className="widget-chrome">
      <p className="widget-title">Guardian</p>
      <LatestStories stories={stories} />
    </div>
  )
}
