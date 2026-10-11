module.exports = async (sock, m, args) => {
    const repoText = `╭━━━〔 🤖 *Broken-MD REPOSITORY* 〕━━━⬣
┃ 🤖 *Bot Name:* Broken-MD
┃ 👑 *Owner:* BrokenDev
╰━━━━━━━━━━━━━━━━━━━━⬣`;

    const channelInfo = {
        contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363413821588578@newsletter',
                newsletterName: 'Broken-MD',
                serverMessageId: -1
            }
        }
    };

    await sock.sendMessage(m.key.remoteJid, {
        image: { url: "https://files.catbox.moe/h1cngd.png" },
        caption: repoText,
        ...channelInfo
    }, { quoted: m });
};
