// eslint-disable-next-line no-unused-vars
import { createElement, DomFragment, setupFontawesome } from './utils'
import * as widgetRenderers from './widgets'

const { fetch, WebSocket } = window
const API_URL = 'http://localhost:3000'

const fetchJSON = url => fetch(url).then(r => r.json())

async function getZones() {
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
    while (elem.firstChild) elem.firstChild.remove()
    elem.append(...renderWidget(widget, endpointData).children)
  }
}

//
// App entry point
//
;(async () => {
  window.createElement = createElement
  window.DomFragment = DomFragment

  setupFontawesome()

  const zones = await getZones()
  const { widgetTypes } = await fetchJSON(`${API_URL}/widget-types`)

  const socket = new WebSocket(API_URL.replace(/^http/, 'ws'))

  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve)
    socket.addEventListener('error', reject)
  })

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
    <main id="app" className="zones">
      <div className="zones-left">
        <div className="widgetList">{leftWidgets}</div>
      </div>
      <div className="zones-right">
        <div className="widgetList">{rightWidgets}</div>
      </div>
      <div className="zones-bottom">
        <div className="widgetList">{bottomWidgets}</div>
      </div>
    </main>
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

  // fetch data for the widgets we have
  // periodically fetch the zones again

  document.querySelector('main').replaceWith(app)
})()
