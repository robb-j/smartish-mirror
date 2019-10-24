#!/usr/bin/env node

const dashund = require('./dashund')
dashund.runCLI()

process.on('SIGINT', () => process.exit())
