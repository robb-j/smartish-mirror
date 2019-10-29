import { ensureData, renderError } from '../utils'

const currencify = (pence, dp = 2) => {
  return (pence < 0 ? '-£' : '£') + Math.abs(pence / 100).toFixed(dp)
}

export const PotsSection = ({ pots = [] }) => {
  if (pots.length === 0) return []

  return [
    <p className="widget-label">Pots</p>,
    <ul className="widget-list">
      {pots.map(pot => (
        <li className="widget-listItem">
          <strong>{currencify(pot.balance, 0)}</strong> {pot.name}
        </li>
      ))}
    </ul>
  ]
}

export const TransactionsSection = ({ transactions = [] }) => {
  const filtered = transactions.filter(t => t.merchant).slice(0, 3)

  if (filtered.length === 0) return []

  const name = t => (t.merchant && t.merchant.name) || t.description

  return [
    <p className="widget-label">Recent</p>,
    <ul className="widget-list">
      {filtered.map(transaction => (
        <li className="widget-listItem">
          <strong>{currencify(transaction.amount, 0)}</strong>{' '}
          {name(transaction)}
        </li>
      ))}
    </ul>
  ]
}

export const Monzo = (widget, data) => {
  const [balance, error1] = ensureData(data, 'monzo/balance')
  const [savings, error2] = ensureData(data, 'monzo/pots')
  const [recent, error3] = ensureData(data, 'monzo/recent')

  if (error1 || error2 || error3) {
    return renderError('Monzo', error1 || error2 || error3)
  }

  return (
    <div className="widget-chrome">
      <p className="widget-title">Monzo</p>
      <p className="widget-text">
        balance: {currencify(balance.balance)}
        <br />
        today: {currencify(balance.spend_today)}
      </p>
      <PotsSection pots={savings.pots} />
      <TransactionsSection transactions={recent.transactions} />
    </div>
  )
}
