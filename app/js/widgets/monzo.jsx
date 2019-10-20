import { ensureData } from '../utils'

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
      <ul className="widget-list">
        {filteredTransations.map(transaction => (
          <li className="widget-listItem">
            <strong>{currency(transaction.amount, 0)}</strong>{' '}
            {name(transaction)}
          </li>
        ))}
      </ul>
    ]
  }

  return (
    <div className="widget-chrome">
      <p className="widget-title">Monzo</p>
      <p className="widget-text">
        balance: {currency(balance.balance)}
        <br />
        today: {currency(balance.spend_today)}
      </p>
      {potsSection}
      {recentSection}
    </div>
  )
}
