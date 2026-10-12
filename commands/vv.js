const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function vvCommand(sock, from, msg) {
  try {
    // Loading reactions
    const loadEmojis = ['⏳', '🔓', '👁️'];
    for (const emoji of loadEmojis) {
      await sock.sendMessage(from, { react: { text: emoji, key: msg.key } });
    }

    // Get quoted message from various types
    const ctx =
      msg.message?.extendedTextMessage?.contextInfo ||
      msg.message?.imageMessage?.contextInfo ||
      msg.message?.videoMessage?.contextInfo ||
      msg.message?.audioMessage?.contextInfo ||
      msg.message?.buttonsResponseMessage?.contextInfo ||
      msg.message?.listResponseMessage?.contextInfo;

    const quoted = ctx?.quotedMessage;

    if (!quoted) {
      return await sock.sendMessage(
        from,
        { text: "❌ Please reply to a View-Once message." },
        { quoted: msg }
      );
    }

    // Detect view-once wrapper (multiple Baileys versions)
    const viewOnce =
      quoted.viewOnceMessageV2 ||
      quoted.viewOnceMessageV2Extension ||
      quoted.viewOnceMessage;

    const message = viewOnce?.message || quoted;
    let vType = Object.keys(message)[0];

    // If direct media with viewOnce flag
    if (!['imageMessage', 'videoMessage', 'audioMessage'].includes(vType)) {
      if (message.imageMessage?.viewOnce) vType = 'imageMessage';
      else if (message.videoMessage?.viewOnce) vType = 'videoMessage';
      else if (message.audioMessage?.viewOnce) vType = 'audioMessage';
    }

    if (!['imageMessage', 'videoMessage', 'audioMessage'].includes(vType)) {
      return await sock.sendMessage(
        from,
        { text: "❌ Not a View-Once media message." },
        { quoted: msg }
      );
    }

    // Download media
    const stream = await downloadContentFromMessage(
      message[vType],
      vType.replace('Message', '')
    );

    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    // Success reaction
    await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });

    // Send based on type
    if (vType === 'imageMessage') {
      await sock.sendMessage(
        from,
        {
          image: buffer,
          caption: "✅ *View-Once Image Downloaded*"
        },
        { quoted: msg }
      );
    } else if (vType === 'videoMessage') {
      await sock.sendMessage(
        from,
        {
          video: buffer,
          caption: "✅ *View-Once Video Downloaded*"
        },
        { quoted: msg }
      );
    } else if (vType === 'audioMessage') {
      await sock.sendMessage(
        from,
        {
          audio: buffer,
          mimetype: 'audio/mp4',
          ptt: true
        },
        { quoted: msg }
      );
    }
  } catch (error) {
    console.error('vvCommand Error:', error);
    await sock.sendMessage(
      from,
      { text: "❌ Failed to download View-Once media." },
      { quoted: msg }
    );
  }
}

module.exports = vvCommand;
