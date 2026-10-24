const { spawn } = require('child_process')
console.log('Starting DEVIL Hosting...')
const main = spawn('node', ['.'], { stdio: 'inherit' })
const pair = spawn('node', ['server.js'], { stdio: 'inherit' })