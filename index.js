const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, downloadMediaMessage } = require('@whiskeysockets/baileys')
const qrcodeTerminal = require('qrcode-terminal')
const QRCode = require('qrcode')
const pino = require('pino')
const axios = require('axios')
const fs = require('fs')
const path = require('path')

const OWNER_NUMBER = '254183123651'
const BOT_NAME = '👑↡⏤͟͟͞🦋⃝⃪DEVIL🦋⃝⃪🫧꯭👑'
const MAIN_CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbDSG2J9WtC54I3eky3k'
const CHANNEL_INVITE = '0029VbDSG2J9WtC54I3eky3k'

let bannedUsers = new Set()
let activeBots = new Map()
let antiLinkGroups = new Set()
let botModes = new Map()
let autoTyping = false
let autoRecording = false

try { if (fs.existsSync('./banned.json')) bannedUsers = new Set(JSON.parse(fs.readFileSync('./banned.json'))) } catch {}
try { if (fs.existsSync('./antilink.json')) antiLinkGroups = new Set(JSON.parse(fs.readFileSync('./antilink.json'))) } catch {}
try { if (fs.existsSync('./botmodes.json')) botModes = new Map(JSON.parse(fs.readFileSync('./botmodes.json'))) } catch {}
try { if (fs.existsSync('./autostatus.json')) { const d=JSON.parse(fs.readFileSync('./autostatus.json')); autoTyping=d.typing||false; autoRecording=d.recording||false } } catch {}
function saveBanned() { try { fs.writeFileSync('./banned.json', JSON.stringify([...bannedUsers])) } catch {} }
function saveAntilink() { try { fs.writeFileSync('./antilink.json', JSON.stringify([...antiLinkGroups])) } catch {} }
function saveModes() { try { fs.writeFileSync('./botmodes.json', JSON.stringify([...botModes])) } catch {} }
function saveAuto() { try { fs.writeFileSync('./autostatus.json', JSON.stringify({typing:autoTyping, recording:autoRecording})) } catch {} }

const FOOTER = `\n\n> 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 ↡⏤͟͟͞⃝⃪ 𝐃𝐄𝐕𝐈𝐋®`
const menuText = `╭━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃ 👑 DEVIL BOT MENU 👑
╰━━━━━━━━━━━━━━━━━━━━━━━━━╯

┏━━━━━━━━━━━━━━━━━━┓
┃ ⚙️ ADMIN
┣━━━━━━━━━━━━━━━━━━┫
┃ ✦ .promote
┃ ✦ .demote
┃ ✦ .kick
┃ ✦ .add
┃ ✦ .kickall
┃ ✦ .tag
┃ ✦ .hidetag
┃ ✦ .lock
┃ ✦ .unlock
┃ ✦ .antilink
┃ ✦ .creategc
┃ ✦ .deletegc
┃ ✦ .exitgc
┗━━━━━━━━━━━━━━━━━━┛

┏━━━━━━━━━━━━━━━━━━┓
┃ 👁️ VIEWONCE
┣━━━━━━━━━━━━━━━━━━┫
┃ ✦ .vv
┃ ✦ .vv2
┗━━━━━━━━━━━━━━━━━━┛

┏━━━━━━━━━━━━━━━━━━┓
┃ 🛠️ TOOLS
┣━━━━━━━━━━━━━━━━━━┫
┃ ✦ .s
┃ ✦ .sticker
┃ ✦ .jid
┃ ✦ .getpp
┃ ✦ .ping
┃ ✦ .alive
┃ ✦ .autotyping
┃ ✦ .autorecording
┃ ✦ .logo
┗━━━━━━━━━━━━━━━━━━┛

┏━━━━━━━━━━━━━━━━━━┓
┃ 🦋 ANIME
┣━━━━━━━━━━━━━━━━━━┫
┃ ✦ .waifu
┃ ✦ .neko
┃ ✦ .awoo
┗━━━━━━━━━━━━━━━━━━┛

┏━━━━━━━━━━━━━━━━━━┓
┃ 🔐 OWNER
┣━━━━━━━━━━━━━━━━━━┫
┃ ✦ .pair
┃ ✦ .bots
┃ ✦ .ban
┃ ✦ .unban
┃ ✦ .banlist
┃ ✦ .self
┃ ✦ .public
┗━━━━━━━━━━━━━━━━━━┛
`

function findMenuImage() {
    const files = fs.readdirSync(__dirname)
    for (const f of ['menu.jpg','menu.jpeg','menu.JPG','menu.png','menu.webp']) {
        const p = path.join(__dirname, f)
        if (fs.existsSync(p)) return p
    }
    const found = files.find(f => f.toLowerCase().includes('menu') && (f.endsWith('.jpg')||f.endsWith('.png')||f.endsWith('.webp')||f.endsWith('.jpeg')))
    if (found) return path.join(__dirname, found)
    return null
}

async function sendWelcomeMessage(sock) {
    try {
        const mp = findMenuImage()
        const welcomeCaption = 
`✅ *CONNECTED SUCCESSFULLY*

👑 ${BOT_NAME} is now online!

📜 Use *.menu* to see all commands

🔗 Channel: ${MAIN_CHANNEL_LINK}

> 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 ↡⏤͟͟͞⃝⃪ 𝐃𝐄𝐕𝐈𝐋®`

        const myJid = sock.user.id
        
        if (mp) {
            await sock.sendMessage(myJid, { 
                image: fs.readFileSync(mp), 
                caption: welcomeCaption
            })
        } else {
            await sock.sendMessage(myJid, { 
                text: welcomeCaption
            })
        }
        
        // Channel button
        await sock.sendMessage(myJid, {
            text: `📢 *Follow Our Official Channel*\n\nTap the link below:`,
            contextInfo: {
                externalAdReply: {
                    title: '👑 DEVIL Official Channel',
                    body: 'Click to follow',
                    mediaType: 1,
                    thumbnailUrl: 'https://i.ibb.co/3YHqVqQ/devil.jpg',
                    sourceUrl: MAIN_CHANNEL_LINK,
                    renderLargerThumbnail: true
                }
            }
        })
        
    } catch (e) {
        console.log('Welcome failed', e.message)
    }
}

async function react(sock, msg, emoji) { try { await sock.sendMessage(msg.key.remoteJid, { react: { text: emoji, key: msg.key } }) } catch {} }
function withFooter(text) { return `${text}${FOOTER}` }
async function revealViewOnce(sock, quoted) { let c = null; if (quoted.viewOnceMessageV2) c = quoted.viewOnceMessageV2.message; else if (quoted.viewOnceMessage) c = quoted.viewOnceMessage.message; else c = quoted; const buffer = await downloadMediaMessage({ message: c }, 'buffer', {}, { logger: pino({ level: 'silent' }) }); return { buffer, content: c } }
function getBotMode(id) { return botModes.get(id) || 'public' }

async function handleMessages(sock, botId) {
    sock.ev.on('messages.upsert', async ({ messages }) => {
        for (const msg of messages) {
            const from = msg.key.remoteJid
            if (from.endsWith('@newsletter')) { try { await sock.newsletterReactMessage(from, msg.key.id, '❤️‍🔥') } catch {} continue }
            if (!msg.message) continue
            let text = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || msg.message.videoMessage?.caption || ''
            const lower = text.toLowerCase().trim()
            const cmd = lower.split(' ')[0]
            const args = text.trim().split(' ').slice(1)
            const sender = msg.key.participant || from
            const senderNum = sender.split('@')[0].split(':')[0]
            const isMe = msg.key.fromMe || sender.includes(sock.user.id.split(':')[0])
            const myNum = sock.user.id.split(':')[0].split('@')[0]
            const isOwner = isMe || senderNum === myNum || (botId === 'main' && senderNum.includes(OWNER_NUMBER))

            if (autoTyping) { try { await sock.sendPresenceUpdate('composing', from) } catch {} }
            if (autoRecording) { try { await sock.sendPresenceUpdate('recording', from) } catch {} }

            if (from.endsWith('@g.us') && antiLinkGroups.has(from)) {
                const hasLink = lower.includes('https://') || lower.includes('http://') || lower.includes('www.') || lower.includes('chat.whatsapp.com') || lower.includes('wa.me/') || lower.includes('t.me/')
                if (hasLink && !isOwner) {
                    try { await sock.sendMessage(from, { delete: msg.key }); await new Promise(r=>setTimeout(r,500)); await sock.sendMessage(from, { text: withFooter(`🚫 @${senderNum} link deleted!`), mentions: [sender] }) } catch {}
                    continue
                }
            }
            if (bannedUsers.has(sender) || bannedUsers.has(senderNum) || bannedUsers.has(from) || [...bannedUsers].some(b=> sender.includes(b) || from.includes(b))) { if (!isOwner) continue }
            if (getBotMode(botId) === 'self' && !isOwner) { if (lower.startsWith('.')) continue }

            let isBotAdmin = false, participants = []
            if (from.endsWith('@g.us')) {
                try {
                    const meta = await sock.groupMetadata(from);
                    participants = meta.participants;
                    const myNumber = sock.user.id.split(':')[0];
                    isBotAdmin = meta.participants.some(p => p.id.includes(myNumber) && p.admin) || isOwner
                } catch (e) { if (isOwner) isBotAdmin = true }
            }
            const getMentioned = () => msg.message.extendedTextMessage?.contextInfo?.mentionedJid || []
            const getQuotedParticipant = () => msg.message.extendedTextMessage?.contextInfo?.participant || null

            if (cmd === '.menu' || cmd === '.help') {
                await react(sock, msg, '👑')
                const mp = findMenuImage()
                const caption = menuText + FOOTER
                if (mp) await sock.sendMessage(from, { image: fs.readFileSync(mp), caption: caption })
                else await sock.sendMessage(from, { text: caption + `\n\n🔗 Channel: ${MAIN_CHANNEL_LINK}` })
                continue
            }

            if (cmd === '.autotyping') {
                await react(sock, msg, '⌨️');
                if (!isOwner) { await sock.sendMessage(from, { text: withFooter('🚫 Owner only') }); continue }
                const opt = args[0]?.toLowerCase();
                if (opt === 'on') { autoTyping = true; autoRecording = false; saveAuto(); await sock.sendMessage(from, { text: withFooter('✅ AutoTyping ON') }) }
                else if (opt === 'off') { autoTyping = false; saveAuto(); await sock.sendMessage(from, { text: withFooter('❌ AutoTyping OFF') }) }
                else await sock.sendMessage(from, { text: withFooter(`AutoTyping: ${autoTyping ? 'ON' : 'OFF'}\nUse: .autotyping on/off`) })
                continue
            }
            if (cmd === '.autorecording' || cmd === '.autorecordingaudio') {
                await react(sock, msg, '🎙️');
                if (!isOwner) { await sock.sendMessage(from, { text: withFooter('🚫 Owner only') }); continue }
                const opt = args[0]?.toLowerCase();
                if (opt === 'on') { autoRecording = true; autoTyping = false; saveAuto(); await sock.sendMessage(from, { text: withFooter('✅ AutoRecording ON') }) }
                else if (opt === 'off') { autoRecording = false; saveAuto(); await sock.sendMessage(from, { text: withFooter('❌ AutoRecording OFF') }) }
                else await sock.sendMessage(from, { text: withFooter(`AutoRecording: ${autoRecording ? 'ON' : 'OFF'}\nUse: .autorecording on/off`) })
                continue
            }
            if (cmd === '.logo') {
                await react(sock, msg, '🎨');
                const logoText = args.join(' ').trim();
                if (!logoText) { await sock.sendMessage(from, { text: withFooter('Use: .logo DEVIL') }); continue }
                try {
                    const apiUrl = `https://api.lolhuman.xyz/api/textprome/neon?apikey=Gata_Dios&text=${encodeURIComponent(logoText)}`;
                    await sock.sendMessage(from, { image: { url: apiUrl }, caption: withFooter(`🎨 Logo: ${logoText}`) });
                } catch (e) {
                    await sock.sendMessage(from, { text: withFooter(`🎨 LOGO: ${logoText.toUpperCase()}`) });
                }
                continue
            }

            if (cmd === '.pair') {
                await react(sock, msg, '🔗');
                if (!isOwner) { await sock.sendMessage(from, { text: withFooter('🚫 Owner only!') }); continue }
                
                const number = args[0]?.replace(/[^0-9]/g, '');
                const method = args[1]?.toLowerCase() || 'code';
                
                if (!number) { 
                    await sock.sendMessage(from, { text: withFooter('Use:\n.pair 2547xxxxxxx code\n.pair 2547xxxxxxx qrcode') }); 
                    continue 
                }
                if (number.length < 10) {
                    await sock.sendMessage(from, { text: withFooter(`❌ Invalid number: ${number}`) });
                    continue
                }

                const authFolder = `auth-${number}`;
                
                if (method === 'qrcode' || method === 'qr') {
                    try {
                        await sock.sendMessage(from, { text: withFooter(`⏳ Generating QR for ${number}... You will get 4 QRs (20 sec each)`) });
                        await generateQRCodePair(authFolder, number, sock, from);
                    } catch (e) {
                        await sock.sendMessage(from, { text: withFooter(`❌ QR Failed: ${e.message}`) });
                    }
                    continue
                }

                try { 
                    await sock.sendMessage(from, { text: withFooter(`⏳ Generating CODE for ${number}...`) }); 
                    const { code } = await generatePairingCode(authFolder, number); 
                    await sock.sendMessage(from, { text: withFooter(`🔗 CODE FOR ${number}\n\n*${code}*\n\nWhatsApp > Linked Devices > Link with code`) }) 
                } catch (e) { 
                    await sock.sendMessage(from, { text: withFooter(`❌ Failed: ${e.message}`) }) 
                }
                continue
            }

            if (cmd === '.promote') { await react(sock, msg, '⬆️'); if (!from.endsWith('@g.us')) { await sock.sendMessage(from, { text: withFooter('Group only') }); continue } if (!isBotAdmin) { await sock.sendMessage(from, { text: withFooter('❌ I am not admin') }); continue } const target = getMentioned()[0] || getQuotedParticipant(); if (!target) { await sock.sendMessage(from, { text: withFooter('Use: .promote @user') }); continue } await sock.groupParticipantsUpdate(from, [target], 'promote'); await sock.sendMessage(from, { text: withFooter(`✅ Promoted @${target.split('@')[0]}`), mentions: [target] }); continue }
            if (cmd === '.demote') { await react(sock, msg, '⬇️'); if (!from.endsWith('@g.us')) continue; if (!isBotAdmin) { await sock.sendMessage(from, { text: withFooter('❌ I am not admin') }); continue } const target = getMentioned()[0] || getQuotedParticipant(); if (!target) { await sock.sendMessage(from, { text: withFooter('Use: .demote @user') }); continue } await sock.groupParticipantsUpdate(from, [target], 'demote'); await sock.sendMessage(from, { text: withFooter(`✅ Demoted @${target.split('@')[0]}`), mentions: [target] }); continue }
            if (cmd === '.kick') { await react(sock, msg, '👢'); if (!from.endsWith('@g.us')) continue; if (!isBotAdmin) { await sock.sendMessage(from, { text: withFooter('❌ I am not admin') }); continue } const target = getMentioned()[0] || getQuotedParticipant(); if (!target) { await sock.sendMessage(from, { text: withFooter('Use: .kick @user') }); continue } await sock.groupParticipantsUpdate(from, [target], 'remove'); await sock.sendMessage(from, { text: withFooter(`✅ Kicked @${target.split('@')[0]}`), mentions: [target] }); continue }
            if (cmd === '.kickall') { await react(sock, msg, '💥'); if (!from.endsWith('@g.us')) continue; if (!isOwner) { await sock.sendMessage(from, { text: withFooter('🚫 Owner only') }); continue } if (!isBotAdmin) { await sock.sendMessage(from, { text: withFooter('❌ I am not admin') }); continue } const nonAdmins = participants.filter(p => !p.admin && !p.id.includes(sock.user.id.split(':')[0])).map(p => p.id); if (nonAdmins.length === 0) { await sock.sendMessage(from, { text: withFooter('No members to kick') }); continue } await sock.sendMessage(from, { text: withFooter(`⚠️ Kicking ${nonAdmins.length} members...`) }); for (const id of nonAdmins) { try { await sock.groupParticipantsUpdate(from, [id], 'remove'); await new Promise(r=>setTimeout(r,1000)) } catch {} } continue }
            if (cmd === '.add') { await react(sock, msg, '➕'); if (!from.endsWith('@g.us')) { await sock.sendMessage(from, { text: withFooter('❌ Group only') }); continue } if (!isBotAdmin) { await sock.sendMessage(from, { text: withFooter('❌ I am not admin') }); continue } if (!args[0]) { await sock.sendMessage(from, { text: withFooter('Use: .add 254xxx') }); continue } let toAdd = args.join(' ').split(',').map(v => v.replace(/[^0-9]/g, '')).filter(v=>v.length>7).map(v => v + '@s.whatsapp.net'); try { await sock.groupParticipantsUpdate(from, toAdd, 'add'); await sock.sendMessage(from, { text: withFooter(`✅ Added ${toAdd.length}`), mentions: toAdd }); } catch (e) { await sock.sendMessage(from, { text: withFooter(`❌ Failed: ${e.message}`) }) } continue }
            if (cmd === '.tag') { await react(sock, msg, '📢'); if (!from.endsWith('@g.us')) continue; const message = args.join(' ') || 'Attention'; const all = participants.map(p => p.id); await sock.sendMessage(from, { text: withFooter(`${message}\n\n${all.map(m=>`@${m.split('@')[0]}`).join(' ')}`), mentions: all }); continue }
            if (cmd === '.hidetag') { await react(sock, msg, '👻'); if (!from.endsWith('@g.us')) continue; const message = args.join(' ') || 'Hidden tag'; const all = participants.map(p => p.id); await sock.sendMessage(from, { text: withFooter(message), mentions: all }); continue }
            if (cmd === '.lock') { await react(sock, msg, '🔒'); if (!from.endsWith('@g.us')) continue; if (!isBotAdmin) { await sock.sendMessage(from, { text: withFooter('❌ Not admin') }); continue } await sock.groupSettingUpdate(from, 'announcement'); await sock.sendMessage(from, { text: withFooter('🔒 Group closed') }); continue }
            if (cmd === '.unlock') { await react(sock, msg, '🔓'); if (!from.endsWith('@g.us')) continue; if (!isBotAdmin) { await sock.sendMessage(from, { text: withFooter('❌ Not admin') }); continue } await sock.groupSettingUpdate(from, 'not_announcement'); await sock.sendMessage(from, { text: withFooter('🔓 Group opened') }); continue }
            if (cmd === '.creategc' || cmd === '.newgc') {
                await react(sock, msg, '🏗️');
                if (!isOwner) { await sock.sendMessage(from, { text: withFooter('🚫 Owner only') }); continue }
                const gName = args.join(' ').trim();
                if (!gName) { await sock.sendMessage(from, { text: withFooter('Use: .creategc My Group Name') }); continue }
                try {
                    let group;
                    try { group = await sock.groupCreate(gName, []); } catch { group = await sock.groupCreate(gName, [sender]); }
                    await new Promise(r=>setTimeout(r,2000));
                    let invite = 'No link'; try { invite = await sock.groupInviteCode(group.id); invite = `https://chat.whatsapp.com/${invite}` } catch {}
                    await sock.sendMessage(from, { text: withFooter(`✅ Created\n${gName}\n${invite}`) });
                } catch (e) { await sock.sendMessage(from, { text: withFooter(`❌ Failed: ${e.message}`) }) }
                continue
            }
            if (cmd === '.deletegc' || cmd === '.delgc') {
                await react(sock, msg, '🗑️');
                if (!from.endsWith('@g.us')) { await sock.sendMessage(from, { text: withFooter('Group only') }); continue }
                if (!isOwner) { await sock.sendMessage(from, { text: withFooter('🚫 Owner only') }); continue }
                if (!isBotAdmin) { await sock.sendMessage(from, { text: withFooter('❌ Make me admin') }); continue }
                try {
                    await sock.sendMessage(from, { text: withFooter('🗑️ Deleting...') });
                    const all = participants.filter(p => !p.id.includes(sock.user.id.split(':')[0])).map(p => p.id);
                    for (const id of all) { try { await sock.groupParticipantsUpdate(from, [id], 'remove'); await new Promise(r=>setTimeout(r,800)) } catch {} }
                    await sock.groupLeave(from);
                } catch (e) { await sock.sendMessage(from, { text: withFooter(`❌ ${e.message}`) }) }
                continue
            }
            if (cmd === '.exitgc' || cmd === '.leavegc') {
                await react(sock, msg, '👋');
                if (!from.endsWith('@g.us')) continue;
                await sock.sendMessage(from, { text: withFooter('👋 Bye') });
                await new Promise(r=>setTimeout(r,800));
                await sock.groupLeave(from);
                continue
            }
            if (cmd === '.antilink') {
                await react(sock, msg, '🔗')
                if (!from.endsWith('@g.us')) { await sock.sendMessage(from, { text: withFooter('Group only') }); continue }
                const opt = args[0]?.toLowerCase()
                if (opt === 'on') { antiLinkGroups.add(from); saveAntilink(); await sock.sendMessage(from, { text: withFooter('✅ AntiLink ON') }) }
                else if (opt === 'off') { antiLinkGroups.delete(from); saveAntilink(); await sock.sendMessage(from, { text: withFooter('❌ AntiLink OFF') }) }
                else await sock.sendMessage(from, { text: withFooter('Use: .antilink on/off') })
                continue
            }
            if (cmd === '.bots') { await react(sock, msg, '🤖'); if (!isOwner) { await sock.sendMessage(from, { text: withFooter('🚫 Owner only') }); continue } const list = [...activeBots.keys()].map(n => `• ${n} ✅`).join('\n') || 'Only main'; await sock.sendMessage(from, { text: withFooter(`🤖 Bots: ${activeBots.size+1}\n\n${list}`) }); continue }
            if (cmd === '.ping' || cmd === '.alive') { await react(sock, msg, '⚡'); await sock.sendMessage(from, { text: withFooter(`⚡ ALIVE | Bot:${botId}`) }); continue }
            if (cmd === '.jid') { await react(sock, msg, '🆔'); await sock.sendMessage(from, { text: withFooter(`JID: ${from}`) }); continue }
            if (cmd === '.getpp') { await react(sock, msg, '🖼️'); const target = getMentioned()[0] || getQuotedParticipant() || sender; try { const url = await sock.profilePictureUrl(target, 'image'); await sock.sendMessage(from, { image: { url }, caption: withFooter(`PP of @${target.split('@')[0]}`), mentions: [target] }) } catch { await sock.sendMessage(from, { text: withFooter('No PP') }) } continue }
            if (cmd === '.s' || cmd === '.sticker') { await react(sock, msg, '🎨'); try { const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage; let buffer = null; if (msg.message.imageMessage) buffer = await downloadMediaMessage(msg, 'buffer', {}, { logger: pino({ level: 'silent' }) }); else if (quoted?.imageMessage) buffer = await downloadMediaMessage({ message: quoted }, 'buffer', {}, { logger: pino({ level: 'silent' }) }); if (!buffer) { await sock.sendMessage(from, { text: withFooter('❌ Reply to image with .s') }); continue } await sock.sendMessage(from, { sticker: buffer }); } catch { await sock.sendMessage(from, { text: withFooter(`❌ Sticker failed`) }) } continue }
            if (['.waifu','.neko','.awoo'].includes(cmd)) {
                await react(sock, msg, '🦋');
                try {
                    let imageUrl = '';
                    const tag = cmd.replace('.','');
                    if (tag === 'awoo') {
                        const r = await axios.get(`https://api.waifu.im/search?included_tags=awoo`, { timeout: 10000 });
                        imageUrl = r.data.images[0].url;
                    } else {
                        try {
                            const r = await axios.get(`https://nekos.best/api/v2/${tag}`, { timeout: 10000 });
                            imageUrl = r.data.results[0].url;
                        } catch {
                            const r = await axios.get(`https://api.waifu.im/search?included_tags=${tag}`, { timeout: 10000 });
                            imageUrl = r.data.images[0].url;
                        }
                    }
                    await sock.sendMessage(from, { image: { url: imageUrl }, caption: withFooter(tag), mentions: [sender] });
                } catch (e) {
                    await sock.sendMessage(from, { text: withFooter(`❌ ${cmd} failed: ${e.message}`) });
                }
                continue
            }
            if (cmd === '.vv') { await react(sock, msg, '👁️'); const q=msg.message.extendedTextMessage?.contextInfo?.quotedMessage; if(!q) { await sock.sendMessage(from, { text: withFooter('Reply to viewonce') }); continue } try{const {buffer,content}=await revealViewOnce(sock,q); if(content.imageMessage) await sock.sendMessage(from,{image:buffer}); else await sock.sendMessage(from,{video:buffer})}catch{} continue }
            if (cmd === '.vv2') { await react(sock, msg, '👁️'); const q=msg.message.extendedTextMessage?.contextInfo?.quotedMessage; if(!q) continue; try{const {buffer,content}=await revealViewOnce(sock,q); const dm=sender; if(content.imageMessage) await sock.sendMessage(dm,{image:buffer,caption:withFooter(`🔒 Ghost`)}); else await sock.sendMessage(dm,{video:buffer}); try{await sock.sendMessage(from,{delete:msg.key})}catch{} }catch{} continue }
            if (cmd === '.ban') {
                await react(sock, msg, '🚫');
                if (!isOwner) { await sock.sendMessage(from, { text: withFooter('🚫 Owner only') }); continue }
                let targetId = null, targetNum = null;
                const mentioned = getMentioned()[0];
                const quoted = getQuotedParticipant();
                if (mentioned) { targetId = mentioned; targetNum = mentioned.split('@')[0]; }
                else if (quoted) { targetId = quoted; targetNum = quoted.split('@')[0].split(':')[0]; }
                else if (args[0]) {
                    targetNum = args[0].replace(/[^0-9]/g, '');
                    if (targetNum.length < 10 || targetNum.length > 15) { await sock.sendMessage(from, { text: withFooter(`❌ Invalid number! Must be full like 2547xxxxxxxx`) }); continue }
                    targetId = targetNum + '@s.whatsapp.net';
                } else { await sock.sendMessage(from, { text: withFooter('Use: .ban @user or .ban 2547xxxxxxx') }); continue }
                const cleanNum = targetNum.replace(/[^0-9]/g, '');
                if (cleanNum.length < 10) { await sock.sendMessage(from, { text: withFooter(`❌ Number too short`) }); continue }
                try { const check = await sock.onWhatsApp(targetId); if (!check || !check[0]?.exists) { await sock.sendMessage(from, { text: withFooter(`❌ Not on WhatsApp: ${cleanNum}`) }); continue } } catch {}
                if (bannedUsers.has(targetId) || bannedUsers.has(cleanNum)) { await sock.sendMessage(from, { text: withFooter(`⚠️ Already banned: ${cleanNum}`) }); continue }
                bannedUsers.add(targetId); bannedUsers.add(cleanNum); saveBanned();
                await sock.sendMessage(from, { text: withFooter(`🚫 Banned ${cleanNum}`) });
                continue
            }
            if (cmd === '.unban') {
                await react(sock, msg, '✅');
                if (!isOwner) { await sock.sendMessage(from, { text: withFooter('🚫 Owner only') }); continue }
                let targetId = null, targetNum = null;
                const mentioned = getMentioned()[0];
                const quoted = getQuotedParticipant();
                if (mentioned) { targetId = mentioned; targetNum = mentioned.split('@')[0]; }
                else if (quoted) { targetId = quoted; targetNum = quoted.split('@')[0].split(':')[0]; }
                else if (args[0]) {
                    targetNum = args[0].replace(/[^0-9]/g, '');
                    if (targetNum.length < 10 || targetNum.length > 15) { await sock.sendMessage(from, { text: withFooter(`❌ Invalid number! Must be full like 2547xxxxxxx`) }); continue }
                    targetId = targetNum + '@s.whatsapp.net';
                } else { await sock.sendMessage(from, { text: withFooter('Use: .unban @user or .unban 2547xxxxxxx') }); continue }
                const cleanNum = targetNum.replace(/[^0-9]/g, '');
                const isBanned = bannedUsers.has(targetId) || bannedUsers.has(cleanNum) || [...bannedUsers].some(b => b.includes(cleanNum));
                if (!isBanned) { await sock.sendMessage(from, { text: withFooter(`❌ Not banned: ${cleanNum}`) }); continue }
                bannedUsers.delete(targetId); bannedUsers.delete(cleanNum);
                for (const b of [...bannedUsers]) { if (b.includes(cleanNum)) bannedUsers.delete(b); }
                saveBanned();
                await sock.sendMessage(from, { text: withFooter(`✅ Unbanned ${cleanNum}`) });
                continue
            }
            if (cmd === '.banlist') {
                if (!isOwner) { await sock.sendMessage(from, { text: withFooter('🚫 Owner only') }); continue }
                if (bannedUsers.size === 0) { await sock.sendMessage(from, { text: withFooter('✅ No banned users') }); continue }
                const list = [...bannedUsers].map((n,i) => `${i+1}. ${n}`).join('\n');
                await sock.sendMessage(from, { text: withFooter(`🚫 Banned (${bannedUsers.size}):\n\n${list}`) });
                continue
            }
            if (cmd === '.self' || cmd === '.private') { await react(sock, msg, '🔒'); if (!isOwner) continue; botModes.set(botId, 'self'); saveModes(); await sock.sendMessage(from, { text: withFooter(`🔒 PRIVATE MODE ON`) }); continue }
            if (cmd === '.public') { await react(sock, msg, '🌍'); if (!isOwner) continue; botModes.set(botId, 'public'); saveModes(); await sock.sendMessage(from, { text: withFooter(`🌍 PUBLIC MODE ON`) }); continue }
        }
    })
}

async function startUserBot(authFolder, phoneNumber) {
    const { state, saveCreds } = await useMultiFileAuthState(authFolder);
    const sock = makeWASocket({ auth: state, logger: pino({ level: 'silent' }), browser: [BOT_NAME, 'Chrome', '1.0'] });
    sock.ev.on('creds.update', saveCreds);
    handleMessages(sock, phoneNumber)
    sock.ev.on('connection.update', async (u) => {
        if (u.connection === 'open') {
            activeBots.set(phoneNumber, sock);
            await sendWelcomeMessage(sock);
        }
        if (u.connection === 'close') { activeBots.delete(phoneNumber); if (u.lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) setTimeout(() => startUserBot(authFolder, phoneNumber), 5000) }
    });
    return sock
}

async function generatePairingCode(authFolder, phoneNumber) {
    try { if (fs.existsSync(authFolder)) fs.rmSync(authFolder, { recursive: true, force: true }) } catch {}
    const { state, saveCreds } = await useMultiFileAuthState(authFolder);
    const sock = makeWASocket({ 
        auth: state, 
        logger: pino({ level: 'silent' }), 
        browser: [BOT_NAME, 'Chrome', '1.0'],
        printQRInTerminal: false
    });
    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', async (u) => {
        if (u.connection === 'open') {
            activeBots.set(phoneNumber, sock);
            handleMessages(sock, phoneNumber);
            await sendWelcomeMessage(sock);
        }
    });
    await new Promise(r => setTimeout(r, 2500));
    const code = await sock.requestPairingCode(phoneNumber);
    return { code, sock }
}

async function generateQRCodePair(authFolder, phoneNumber, mainSock, chatId) {
    try { if (fs.existsSync(authFolder)) fs.rmSync(authFolder, { recursive: true, force: true }) } catch {}
    const { state, saveCreds } = await useMultiFileAuthState(authFolder);
    const sock = makeWASocket({ 
        auth: state, 
        logger: pino({ level: 'silent' }), 
        browser: [BOT_NAME, 'Chrome', '1.0'],
        printQRInTerminal: false
    });
    sock.ev.on('creds.update', saveCreds);
    
    let qrCount = 0;
    let isConnected = false;
    
    sock.ev.on('connection.update', async (u) => {
        if (u.qr && !isConnected) {
            qrCount++;
            try {
                const qrBuffer = await QRCode.toBuffer(u.qr, { type: 'png', width: 800, margin: 2 });
                if (qrCount === 1) {
                    await mainSock.sendMessage(chatId, { image: qrBuffer, caption: withFooter(`📱 QR FOR ${phoneNumber} [${qrCount}/4]\n\n⚡ Scan FAST! 20 sec expiry\nIf expires new QR auto-sends`) });
                } else {
                    await mainSock.sendMessage(chatId, { image: qrBuffer, caption: withFooter(`🔄 NEW QR FOR ${phoneNumber} [${qrCount}/4]\n\nScan this now!`) });
                }
                qrcodeTerminal.generate(u.qr, { small: true });
            } catch {}
        }
        if (u.connection === 'open') {
            isConnected = true;
            activeBots.set(phoneNumber, sock);
            handleMessages(sock, phoneNumber);
            await sendWelcomeMessage(sock);
            await mainSock.sendMessage(chatId, { text: withFooter(`✅ ${phoneNumber} paired via QR on attempt ${qrCount}!`) });
        }
    });
    
    setTimeout(() => {
        if (!isConnected) {
            try { sock.end() } catch {}
            mainSock.sendMessage(chatId, { text: withFooter(`⏰ QR ended for ${phoneNumber}\nTry again: .pair ${phoneNumber} qrcode or use .pair ${phoneNumber} code`) });
        }
    }, 90000);
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth')
    const sock = makeWASocket({ auth: state, logger: pino({ level: 'silent' }), browser: [BOT_NAME, 'Chrome', '1.0'] })
    sock.ev.on('creds.update', saveCreds)
    handleMessages(sock, 'main')
    sock.ev.on('connection.update', async (u) => {
        if (u.qr) { console.log('Scan QR:'); qrcodeTerminal.generate(u.qr, { small: true }) }
        if (u.connection === 'open') {
            console.log(`✅ MAIN ${BOT_NAME} Connected!`)
            await sendWelcomeMessage(sock)
            try { const meta = await sock.newsletterMetadata('invite', CHANNEL_INVITE); await sock.newsletterFollow(meta.id) } catch {}
            try { const folders = fs.readdirSync(__dirname).filter(f => f.startsWith('auth-') && fs.lstatSync(f).isDirectory()); for (const folder of folders) { const num = folder.replace('auth-', ''); if (num) startUserBot(folder, num) } } catch {}
        }
        if (u.connection === 'close' && u.lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) startBot()
    })
}
startBot()