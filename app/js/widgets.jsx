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

export const Monzo = (widget, data) => {
  const [balance, error1] = ensureData(data, 'monzo/balance')
  const [pots, error2] = ensureData(data, 'monzo/pots')
  const [recent, error3] = ensureData(data, 'monzo/recent')

  if (error1 || error2 || error3) return error1 || error2 || error3

  const currency = (pence, dp = 2) => {
    return (pence < 0 ? '-£' : '£') + Math.abs(pence / 100).toFixed(dp)
  }

  let potsSection = []
  if (pots.pots.length > 0) {
    potsSection = [
      <p className="widget-label">Pots</p>,
      <ol className="widget-list">
        {pots.pots.map(pot => (
          <p className="widget-listItem">
            <strong>{currency(pot.balance, 0)}</strong> {pot.name}
          </p>
        ))}
      </ol>
    ]
  }

  let recentSection = []
  const filteredTransations = recent.transactions
    .filter(t => t.merchant)
    .slice(0, 3)

  if (filteredTransations.length > 0) {
    const name = t => (t.merchant && t.merchant.name) || t.description

    recentSection = [
      <p className="widget-label">Recent</p>,
      <ol className="widget-list">
        {filteredTransations.map(transaction => (
          <p className="widget-listItem">
            <strong>{currency(transaction.amount, 0)}</strong>{' '}
            {name(transaction)}
          </p>
        ))}
      </ol>
    ]
  }

  const recentRows = recent.transactions.slice(0, 5).map(transaction => {
    const name = transaction.merchant
      ? transaction.merchant.name
      : transaction.description

    return (
      <p className="widget-listItem">
        <strong>{currency(transaction.amount, 0)}</strong> {name}
      </p>
    )
  })

  if (recentRows.length > 0) {
    recentRows.unshift(<p className="widget-label">Recent</p>)
  }

  return (
    <div className="widget-chrome">
      <p className="widget-title">Monzo</p>
      <p className="widget-heading">{currency(balance.balance)}</p>
      <p className="widget-subHeading">
        <strong>{currency(balance.spend_today)}</strong> spent today
      </p>
      {potsSection}
      {recentSection}
    </div>
  )
}

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
    <div className="quote-chrome">
      <p className="widget-title">{quote.quoteText}</p>
      <p className="widget-text">– {quote.quoteAuthor || 'Unknown'}</p>
    </div>
  )
}
