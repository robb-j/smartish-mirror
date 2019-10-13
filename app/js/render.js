export function createElement(tagName, attrs = {}, ...children) {
  const elem = Object.assign(document.createElement(tagName), attrs)
  for (const child of children) {
    if (Array.isArray(child)) elem.append(...child)
    else elem.append(child)
  }
  return elem
}
