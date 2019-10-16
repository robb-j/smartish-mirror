import { library, icon as faIcon } from '@fortawesome/fontawesome-svg-core'
import {
  faHatWizard,
  faStop,
  faPause,
  faMusic
} from '@fortawesome/free-solid-svg-icons'

/** Initially setup fontawesome by adding the icons we need */
export function setupFontawesome() {
  library.add(faHatWizard, faStop, faPause, faMusic)
}

/** A utility to ensure an EndpointData has success=200 or return an error */
export function ensureData(data, key) {
  let result = data.get(key)

  if (!result) {
    return [undefined, <p>Loading...</p>]
  }

  if (result.status !== 200) {
    return [undefined, <p>Error: {result.status}</p>]
  }

  return [result.data, undefined]
}

/** Our jsx function to create a html element */
export function createElement(tagName, attrs = {}, ...children) {
  if (typeof tagName === 'function') return tagName(attrs, children)
  const elem = Object.assign(document.createElement(tagName), attrs)
  for (const child of children) {
    if (Array.isArray(child)) elem.append(...child)
    else elem.append(child)
  }
  return elem
}

/** Our jsx fragment component */
export function DomFragment(attrs, children) {
  return children
}

/** Our jsx fontawesome icon */
export function FaIcon(attrs, children) {
  let icon = faIcon(attrs)
  if (!icon) throw new Error(`Unknown fa-icon ${JSON.stringify(attrs)}`)
  return <span className="fa-icon">{Array.from(icon.node)}</span>
}
