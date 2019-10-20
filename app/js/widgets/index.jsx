export * from './clock'
export * from './darksky'
export * from './github'
export * from './monzo'
export * from './quote'
export * from './spotify'

export const Unknown = (widget, data) => <p>Unknown widget</p>

export const Loading = (widget, data) => <p>Loading ...</p>

export const Guardian = (widget, data) => <p>Guardian widget</p>
