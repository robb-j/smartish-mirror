// eslint-disable-next-line no-unused-vars
import { createElement } from './render'

function ensureData(data, key) {
  let result = data.get(key)

  if (!result) {
    return [undefined, <p>Loading...</p>]
  }

  if (result.status !== 200) {
    return [undefined, <p>Error: {result.status}</p>]
  }

  return [result.data, undefined]
}

export const Unknown = (widget, data) => <p>Unknown widget</p>

export const Loading = (widget, data) => <p>Loading ...</p>

export const Monzo = (widget, data) => <p>Monzo widget</p>

export const GitHub = (widget, data) => <p>GitHub widget</p>

export const Guardian = (widget, data) => <p>Guardian widget</p>

export const Clock = (widget, data) => <p>Clock widget</p>

export const Spotify = (widget, data) => {
  const [current, error] = ensureData(data, 'spotify/current')
  if (error) return error

  const isPlaying = current && current.is_playing

  let body
  if (!isPlaying) body = 'Paused'
  else {
    body = current.item.name + ' / ' + current.item.album.name
  }

  return (
    <div className="widget-chrome">
      <p className="widget-title">Spotify</p>
      <p className="widget-text">{body}</p>
    </div>
  )
}

export const DarkSky = (widget, data) => <p>DarkSky widget</p>

export const Quote = (widget, data) => {
  const [quote, error] = ensureData(data, 'quote/random')
  if (error) return error

  return (
    <div>
      <p className="widget-title">{quote.quoteText}</p>
      <p className="widget-text">– {quote.quoteAuthor || 'Unknown'}</p>
    </div>
  )
}
