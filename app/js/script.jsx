import {
  createElement,
  DomFragment,
  setupFontawesome,
  removeAllChildren,
  timeout
} from './utils'
import * as widgetRenderers from './widgets'

const { fetch, WebSocket } = window
const API_URL =
  (window.CONFIG && window.CONFIG.API_URL) || 'http://localhost:3000'

const fetchJSON = url => fetch(url).then(r => r.json())

async function getZones() {
  try {
    const { zones } = await fetchJSON(`${API_URL}/zones`)

    let getZone = name => {
      const zone = zones.find(z => z.name === name)
      return zone ? zone.widgets : []
    }

    return {
      left: getZone('left'),
      right: getZone('right'),
      bottom: getZone('bottom')
    }
  } catch (error) {
    console.error(error)
    return null
  }
}

function getWidgetRenderer(type) {
  return widgetRenderers[type] || widgetRenderers.Unknown
}

function renderWidget(widget, data) {
  const r = getWidgetRenderer(widget.type)
  const className = `widgetList-widget ${widget.type}`
  return <div className={className}>{r(widget, data)}</div>
}

function findEndpoints(zones, widgetTypes) {
  const widgetNames = new Set()
  const endpointNames = new Set()

  for (let widget of zones.left) widgetNames.add(widget.type)
  for (let widget of zones.right) widgetNames.add(widget.type)
  for (let widget of zones.bottom) widgetNames.add(widget.type)

  for (let widgetName of widgetNames) {
    if (!widgetTypes[widgetName]) continue

    const { endpoints } = widgetTypes[widgetName]

    for (let endpoint of endpoints) endpointNames.add(endpoint)
  }

  return endpointNames
}

function pushOrSet(map, key, value) {
  const oldValue = map.has(key) ? map.get(key) : []
  map.set(key, [...oldValue, value])
}

function redrawWidgets(widgets, endpointData) {
  for (let { widget, elem } of widgets) {
    removeAllChildren(elem)
    elem.append(...renderWidget(widget, endpointData).children)
  }
}

async function renderApp(socket, zones, widgetTypes) {
  const endpointNames = findEndpoints(zones, widgetTypes)
  const endpointData = new Map()
  const widgetMap = new Map()

  const leftWidgets = []
  for (let widget of zones.left) {
    const elem = renderWidget(widget, endpointData)
    pushOrSet(widgetMap, widget.type, { widget, elem })
    leftWidgets.push(elem)
  }

  const rightWidgets = []
  for (let widget of zones.right) {
    const elem = renderWidget(widget, endpointData)
    pushOrSet(widgetMap, widget.type, { widget, elem })
    rightWidgets.push(elem)
  }

  const bottomWidgets = []
  for (let widget of zones.bottom.slice(0, 1)) {
    const elem = renderWidget(widget, endpointData)
    pushOrSet(widgetMap, widget.type, { widget, elem })
    bottomWidgets.push(elem)
  }

  const app = (
    <div className="zones">
      <div className="zones-left">
        <div className="widgetList">{leftWidgets}</div>
      </div>
      <div className="zones-right">
        <div className="widgetList">{rightWidgets}</div>
      </div>
      <div className="zones-bottom">
        <div className="widgetList">{bottomWidgets}</div>
      </div>
    </div>
  )

  await Promise.all(
    Array.from(endpointNames).map(async endpoint => {
      let data = await fetchJSON(`${API_URL}/${endpoint}`)
      endpointData.set(endpoint, data)
    })
  )

  // render each widget with data
  widgetMap.forEach(widgets => redrawWidgets(widgets, endpointData))

  socket.addEventListener('message', payload => {
    try {
      const data = JSON.parse(payload.data)
      endpointData.set(data.type, data)

      const needsUpdating = new Set()
      for (let type of Object.values(widgetTypes)) {
        if (type.endpoints.includes(data.type)) needsUpdating.add(type.name)
      }

      for (let type of needsUpdating) {
        redrawWidgets(widgetMap.get(type) || [], endpointData)
      }
    } catch (error) {
      console.error(error)
    }
  })

  for (let endpoint of endpointNames) {
    const payload = JSON.stringify({
      type: 'sub',
      target: endpoint
    })
    socket.send(payload)
  }

  window.endpointData = endpointData

  return app
}

function renderError(message, subtitle = '') {
  return (
    <div className="mirror-error">
      <p>{message}</p>
      {subtitle && <p>{subtitle}</p>}
    </div>
  )
}

function resetRoot(node) {
  const main = document.querySelector('main')

  while (main.firstChild) main.firstChild.remove()

  main.append(node)
}

async function main() {
  const zones = await getZones()
  const { widgetTypes } = await fetchJSON(`${API_URL}/widget-types`)

  if (!zones || !widgetTypes) {
    throw new Error(`Cannot connect to ${API_URL}`)
  }

  const socketUrl = API_URL.replace(/^http/, 'ws')

  const socket = new WebSocket(socketUrl)

  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve)
    socket.addEventListener('error', reject)
  })

  resetRoot(await renderApp(socket, zones, widgetTypes))

  return new Promise((resolve, reject) => {
    socket.addEventListener('error', error => reject(error))
    socket.addEventListener('close', event =>
      reject(
        new Error(
          `WebSocket closed reason="${event.reason}" code="${event.code}"`
        )
      )
    )
  })
}

//
// App entry point
//
;(async () => {
  window.createElement = createElement
  window.DomFragment = DomFragment

  setupFontawesome()

  while (true) {
    let error = new Error('Something went wrong')
    try {
      await main()
    } catch (newError) {
      error = newError
    }

    for (let i = 30; i > 0; i--) {
      await timeout(1000)
      resetRoot(renderError(`${error.message}`, `Restarting in ${i}`))
    }
  }
})()
