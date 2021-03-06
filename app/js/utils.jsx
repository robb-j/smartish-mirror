import { library, icon as faIcon } from '@fortawesome/fontawesome-svg-core'
import {
  faHatWizard,
  faPauseCircle,
  faMusic,
  faMoon,
  faUmbrella,
  faCloudRain,
  faWind,
  faSmog,
  faCloud,
  faCloudSun,
  faCloudMoon
} from '@fortawesome/free-solid-svg-icons'
import { faSun, faSnowflake } from '@fortawesome/free-regular-svg-icons'

/** Initially setup fontawesome by adding the icons we need */
export function setupFontawesome() {
  library.add(
    faHatWizard,
    faPauseCircle,
    faMusic,
    faMoon,
    faUmbrella,
    faCloudRain,
    faWind,
    faSmog,
    faCloud,
    faCloudSun,
    faCloudMoon
  )
  library.add(faSun, faSnowflake)
}

export const renderError = (title, message) => (
  <div className="widget-chrome">
    <p className="widget-title">{title}</p>
    <p className="widget-text">
      <strong>Error</strong> {message}
    </p>
  </div>
)

/** A utility to ensure an EndpointData has success=200 or return an error */
export function ensureData(data, key) {
  let result = data.get(key)

  if (!result) {
    return [undefined, 'Loading...']
  }

  if (result.status !== 200) {
    return [undefined, `http error: ${result.status}`]
  }

  return [result.data, undefined]
}

/** Our jsx function to create a html element */
export function createElement(tagName, attrs = {}, ...children) {
  if (typeof tagName === 'function') return tagName(attrs, children)
  const elem = Object.assign(document.createElement(tagName), attrs)
  for (const child of children) {
    elem.append(...[child].flat(2))
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

/** Remove all children from a DOM element */
export function removeAllChildren(elem) {
  while (elem.firstChild) elem.firstChild.remove()
}

export function setInnerTextIfDifferent(elem, innerText) {
  const trim = str => str.replace(/\s+/g, '')

  if (trim(elem.innerText) === trim(innerText)) return

  elem.innerText = innerText
}

export const timeout = t => new Promise(resolve => setTimeout(resolve, t))
