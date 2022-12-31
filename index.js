const {writeExifImg}= require("./lib/exif.js");
const { 
default: makeWASocket, 
DisconnectReason, 
AnyMessageContent,downloadMediaMessage,
delay, 
useSingleFileAuthState 
} = require('@adiwajshing/baileys')
const P = require("pino")
const logger = P();
const { Boom } = require("@hapi/boom")
const { state, loadState, saveState } = useSingleFileAuthState("./session.json")

async function startBot() {
  console.log(("Wa - Bot Only Sticker\n@natgxcoders"))

  console.log(("Menunggu Koneksi Ke WA"))
  console.log(("Tunggu Sebentar..."))
    const bots = await makeWASocket({
    logger: P({ level: 'silent' }),
    browser: ["Bot","Chrome","1.0.0"],
    printQRInTerminal: true,
    auth: state})
  console.log(("Sukses Terhubung!"))
  
  bots.ev.on("connection.update", (update) => {
    const {connection, lastDisconnect} = update
    if (connection == "close") {
      lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut? startBot():
  console.log(('Sambungan Terputus...'))}
  })
  
  bots.ev.on('creds.update', saveState);
  bots.ev.on("messages.upsert", async ({messages,type})=>{
        const msg = messages[0];
        if (!msg.message || msg.key.remoteJid === "status@broadcast" || msg.key.fromMe||!msg.message.imageMessage)return;
if(msg.key.remoteJid){
        let caption = msg.message.imageMessage.caption;

        let buffer = await downloadMediaMessage(msg, "buffer", {}, {
          logger
        });
        
        buffer = await writeExifImg(buffer, {packname:"", author:"@natgxcoders"});
        
        if (caption === '#sticker') {
          bots.sendMessage(msg.key.remoteJid, {sticker:{url: buffer}});
        }
}
      });
}
startBot()