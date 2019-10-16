import { ensureData } from '../utils'

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
