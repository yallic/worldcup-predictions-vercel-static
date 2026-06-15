const { requireInviteCode } = require("./_security");
const { mapParticipant, supabaseRequest } = require("./_supabase");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ message: "Method not allowed." });
    return;
  }

  const { action, displayName, inviteCode } = req.body || {};

  if (!displayName) {
    res.status(400).json({ message: "Isim zorunlu." });
    return;
  }

  try {
    const name = String(displayName).trim();
    const existingRows = await supabaseRequest("/participants", {
      query: `?display_name=eq.${encodeURIComponent(name)}&select=*`
    });

    if (existingRows[0]) {
      res.status(200).json({ participant: mapParticipant(existingRows[0]) });
      return;
    }

    if (action !== "register") {
      res.status(404).json({ message: "Bu isim kayitli degil. Kayit ol sekmesini kullan." });
      return;
    }

    if (!requireInviteCode(inviteCode)) {
      res.status(401).json({ message: "Davet kodu hatali." });
      return;
    }

    const rows = await supabaseRequest("/participants", {
      method: "POST",
      body: {
        display_name: name
      },
      query: "?select=*",
      prefer: "return=representation"
    });

    res.status(201).json({ participant: mapParticipant(rows[0]) });
  } catch (error) {
    res.status(400).json({ message: error.message || "Giris yapilamadi." });
  }
};
