export * from './clock'
export * from './darksky'
export * from './github'
export * from './guardian'
export * from './monzo'
export * from './quote'
export * from './spotify'

export const Unknown = (widget, data) => {
  return (
    <div className="widget-chrome">
      <p className="widget-text">Unknown widget configured {widget.type}</p>
    </div>
  )
}

export const Loading = (widget, data) => <p>Loading ...</p>
