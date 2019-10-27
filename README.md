# smartish-mirror

Coming soon...

## JSX DOM

I created a lightweight DOM renderer which is used with jsx for developer ease.
jsx is transpilled to `createElement` calls.
This takes a tagName, attributes object a rest parameter for children.
If tagName is a function it calls the function with the attrs object and children array.

Fragments are transpilled to a `createElement` call passing `DomFragment` tagName.
Both `createElement` and `DomFragment` are injected onto the window
so they don't have to be imported everywhere

## Fontawesome

There's also a `FaIcon` component which renders the svg wrapped in a `<div class="fa-icon>`.
So you can do `<FaIcon prefix="fas" iconName="hat-wizard" />`.
Any attributes are passed to [#icon](https://fontawesome.com/how-to-use/with-the-api/setup/getting-started)

---

> This project was set up by [puggle](https://npm.im/puggle)
