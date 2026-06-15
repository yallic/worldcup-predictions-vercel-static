const { supabaseRequest } = require("./_supabase");

async function verifyParticipant(req) {
  const id = req.headers["x-participant-id"];

  if (!id) {
    throw new Error("Kullanici bilgisi eksik.");
  }

  const rows = await supabaseRequest("/participants", {
    query: `?id=eq.${encodeURIComponent(id)}&select=*`
  });

  const participant = rows[0];

  if (!participant) {
    throw new Error("Kullanici bulunamadi.");
  }

  return participant;
}

function requireAdmin(req, res) {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return true;
  }

  if (req.headers["x-admin-password"] === adminPassword) {
    return true;
  }

  res.status(401).json({ message: "Admin sifresi hatali." });
  return false;
}

function requireInviteCode(code) {
  const inviteCode = process.env.INVITE_CODE;

  if (!inviteCode) {
    return true;
  }

  return code === inviteCode;
}

module.exports = { requireAdmin, requireInviteCode, verifyParticipant };
