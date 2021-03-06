const { app, fetch, WebSocket } = window
const API_URL = 'http://localhost:3000'

function html(tagName = 'div', attrs = {}, children = []) {
  if (!Array.isArray(children)) children = [children]

  let elem = document.createElement(tagName)
  for (let key in attrs) elem[key] = attrs[key]
  for (let child of children) elem.append(child)

  return elem
}

function log(...messages) {
  let output = [html('span', { className: 'date' }, formatTime()), ' ']
  for (let message of messages) {
    output.push(
      typeof message === 'object' ? JSON.stringify(message) : message.toString()
    )
  }
  output.push('\n')

  window.log.append(...output)
}

const fetchJSON = url => fetch(url).then(r => r.json())

const endpointID = endpoint => endpoint.name.replace(/\//g, '-')

const formatTime = (date = new Date()) => date.toLocaleTimeString('en-GB')

const jsonify = data => JSON.stringify(data, null, 2)

function renderEndpoint(endpoint, data = null, status = 404) {
  return html('details', { id: endpointID(endpoint), className: 'endpoint' }, [
    html('summary', { className: 'endpoint-info' }, [
      html('span', { className: `status-code is-${status}` }, status),
      ' ',
      html('strong', {}, endpoint.name),
      ` – every ${endpoint.interval} – updated at ${formatTime()}`
    ]),
    html('pre', { className: 'result' }, data)
  ])
}

function updateEndpoint(endpoint, data, status) {
  let [summary, pre] = renderEndpoint(endpoint, jsonify(data), status).children

  let elem = document.getElementById(endpointID(endpoint))

  elem.querySelector('summary').replaceWith(summary)
  elem.querySelector('pre').replaceWith(pre)
}

const findEndpoint = (endpoints, name) => endpoints.find(e => e.name === name)

;(async () => {
  let { endpoints } = await fetchJSON(`${API_URL}/endpoints`)

  log('GET: /endpoints')

  app.innerHTML = ''

  let socket = new WebSocket(API_URL.replace(/^http/, 'ws'))

  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve)
    socket.addEventListener('error', reject)
  })

  socket.addEventListener('message', payload => {
    try {
      let { type, data, status } = JSON.parse(payload.data)

      log(`SOCK_MSG: type=${type}`)

      let endpoint = findEndpoint(endpoints, type)

      updateEndpoint(endpoint, data, status)
    } catch (error) {
      log(`SOCKET_ERROR: ${error.message}`)
    }
  })

  for (let endpoint of endpoints) {
    log(`GET: /${endpoint.name}`)

    let { data, status } = await fetchJSON(`${API_URL}/${endpoint.name}`)

    app.append(renderEndpoint(endpoint, jsonify(data), status))

    log(`SOCK_SEND: type=sub target=${endpoint.name}`)
    socket.send(JSON.stringify({ type: 'sub', target: endpoint.name }))
  }

  socket.addEventListener('error', error => {
    log(`SOCKET_ERR: ${error.message}`)
  })
})()
