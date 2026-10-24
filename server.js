const express = require('express')
const cors = require('cors')
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const pino = require('pino')
const fs = require('fs')
const QRCode = require('qrcode')

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 3000
const activePairings = new Map()

function cleanAuth(number) {
    const folder = `auth-${number}`
    try { if (fs.existsSync(folder)) fs.rmSync(folder, { recursive: true, force: true }) } catch {}
}

app.post('/pair/code', async (req, res) => {
    const number = (req.body.number || '').replace(/[^0-9]/g, '')
    if (!number) return res.json({ success: false, error: 'Send number' })
    cleanAuth(number)
    try {
        const { state, saveCreds } = await useMultiFileAuthState(`auth-${number}`)
        const sock = makeWASocket({ auth: state, logger: pino({ level: 'silent' }), browser: ['DEVIL', 'Chrome', '1.0'] })
        sock.ev.on('creds.update', saveCreds)
        activePairings.set(number, sock)
        await new Promise(r => setTimeout(r, 3000))
        const code = await sock.requestPairingCode(number)
        return res.json({ success: true, number, code })
    } catch (e) {
        return res.json({ success: false, error: e.message })
    }
})

app.get('/pair/qr', async (req, res) => {
    const number = (req.query.number || '').replace(/[^0-9]/g, '')
    if (!number) return res.json({ success: false, error: 'Send ?number=2547...' })
    cleanAuth(number)
    try {
        const { state, saveCreds } = await useMultiFileAuthState(`auth-${number}`)
        const sock = makeWASocket({ auth: state, logger: pino({ level: 'silent' }), browser: ['DEVIL', 'Chrome', '1.0'] })
        sock.ev.on('creds.update', saveCreds)
        const qr = await new Promise((resolve, reject) => {
            sock.ev.on('connection.update', (u) => { if (u.qr) resolve(u.qr) })
            setTimeout(() => reject(new Error('Timeout')), 15000)
        })
        const qrBuffer = await QRCode.toBuffer(qr, { width: 500 })
        res.set('Content-Type', 'image/png')
        return res.send(qrBuffer)
    } catch (e) {
        return res.json({ success: false, error: e.message })
    }
})

app.get('/', (req, res) => {
    res.send('Pair server running - use POST /pair/code or GET /pair/qr?number=2547xxx')
})

const FINAL_PORT = process.env.PORT || PORT
app.listen(FINAL_PORT, '0.0.0.0', () => {
    console.log(`Pair server running on ${FINAL_PORT}`)
})