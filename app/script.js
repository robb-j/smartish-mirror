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
// const div = (attrs = {}, children = []) => html('div', attrs, children)

const endpointID = endpoint => endpoint.name.replace(/\//g, '-')

const formatTime = (date = new Date()) => date.toLocaleTimeString('en-GB')

const jsonify = data => JSON.stringify(data, null, 2)

// const pipe = (...args) => arg0 => args.reduce((result, fn) => fn(result), arg0)

function renderEndpoint(endpoint, data = undefined) {
  return html('details', { id: endpointID(endpoint), className: 'endpoint' }, [
    html('summary', { className: 'endpoint-info' }, [
      html('strong', {}, endpoint.name),
      ` – every ${endpoint.interval} – updated at ${formatTime()}`
    ]),
    html('pre', { className: 'result' }, data)
  ])
}

function updateEndpoint(endpoint, data) {
  let elem = document.getElementById(endpointID(endpoint))
  elem.replaceWith(renderEndpoint(endpoint, jsonify(data)))
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
      let { type, data } = JSON.parse(payload.data)

      log(`SOCK_MSG: type=${type}`)

      console.log(data)

      let endpoint = findEndpoint(endpoints, type)

      updateEndpoint(endpoint, data)
    } catch (error) {
      log(`SOCKET_ERROR: ${error.message}`)
    }
  })

  for (let endpoint of endpoints) {
    log(`GET: /${endpoint.name}`)

    let { data } = await fetchJSON(`${API_URL}/${endpoint.name}`)

    app.append(renderEndpoint(endpoint, jsonify(data)))

    log(`SOCK_SEND: type=sub target=${endpoint.name}`)
    socket.send(JSON.stringify({ type: 'sub', target: endpoint.name }))
  }

  socket.addEventListener('error', error => {
    log(`SOCKET_ERR: ${error.message}`)
  })
})()
