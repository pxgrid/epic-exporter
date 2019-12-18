#!/usr/bin/env node

const path = require('path');

const argv = require('yargs')
  .commandDir('commands')
  .coerce(['destDir'], targetPath => {path.resolve(process.cwd(), targetPath)}).argv;
