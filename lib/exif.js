  const fs = require("fs");
  const ff = require('fluent-ffmpeg');
  const webp = require("node-webpmux");
  const path = require("path");

async function imageToWebp (media) {
    const tmpFileOut = path.join("../lib/stick",
      `${'stiker'}.webp`)
    const tmpFileIn = path.join("../lib/stick",
      `${'stiker'}.jpg`)

    fs.writeFileSync(tmpFileIn,
      media)

    await new Promise((resolve, reject) => {
      ff(tmpFileIn)
      .on("error", reject)
      .on("end", () => resolve(true))
      .addOutputOptions([
        "-vcodec",
        "libwebp",
        "-vf",
        "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse"
      ])
      .toFormat("webp")
      .save(tmpFileOut)
    })

    const buff = fs.readFileSync(tmpFileOut)
    fs.unlinkSync(tmpFileOut)
    fs.unlinkSync(tmpFileIn)
    return buff
  }
  
async function writeExifImg (media, metadata) {
    let wMedia = await imageToWebp(media)
    const tmpFileIn = path.join("../lib/stick",
      `${'stiker'}.webp`)
    const tmpFileOut = path.join("../lib/stick",
      `${'stiker'}.webp`)
    fs.writeFileSync(tmpFileIn,
      wMedia)

    if (metadata.packname || metadata.author) {
      const img = new webp.Image()
      const json = {
        "sticker-pack-id": `https://github.com/DikaArdnt/Hisoka-Morou`,
        "sticker-pack-name": metadata.packname,
        "sticker-pack-publisher": metadata.author,
        "emojis": metadata.categories ? metadata.categories: [""]
      }
      const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00])
      const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8")
      const exif = Buffer.concat([exifAttr, jsonBuff])
      exif.writeUIntLE(jsonBuff.length, 14, 4)
      await img.load(tmpFileIn)
      fs.unlinkSync(tmpFileIn)
      img.exif = exif
      await img.save(tmpFileOut)
      return tmpFileOut
    }
  }
  
module.exports = {
  imageToWebp,
  writeExifImg
};