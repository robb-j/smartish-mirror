# server | smartish-mirror

> WIP

## Environment variables

- `HOSTNAME` – The host the server is available at
- `CORS_HOSTS` – Hosts that are allowed to access with CORS (a csv)

## Volumes

You should bind-mount out `/app/.dashund` which is the dashund folder
that has widget configuration and access tokens in it.

## Ports

Will run on port `3000`

## Command

`dashund` is available as a command to run in the container,
the default command is `dashund serve` which runs the server itself.
