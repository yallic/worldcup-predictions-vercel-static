const { verifyParticipant } = require("./_security");
const { mapPrediction, supabaseRequest } = require("./_supabase");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ message: "Method not allowed." });
    return;
  }

  try {
    const participant = await verifyParticipant(req);
    const { matchId, homeScore, awayScore } = req.body || {};

    if (!matchId || homeScore === undefined || awayScore === undefined) {
      res.status(400).json({ message: "Mac ve skor tahmini zorunlu." });
      return;
    }

    const matches = await supabaseRequest("/matches", {
      query: `?id=eq.${encodeURIComponent(matchId)}&select=*`
    });
    const match = matches[0];

    if (!match) {
      res.status(404).json({ message: "Mac bulunamadi." });
      return;
    }

    if (match.status === "finished" || Date.parse(match.locked_at) <= Date.now()) {
      res.status(409).json({ message: "Bu mac tahmine kapandi." });
      return;
    }

    const rows = await supabaseRequest("/predictions", {
      method: "POST",
      body: {
        participant_id: participant.id,
        match_id: matchId,
        home_score: Number(homeScore),
        away_score: Number(awayScore)
      },
      query: "?on_conflict=participant_id,match_id&select=*",
      prefer: "resolution=merge-duplicates,return=representation"
    });

    res.status(200).json({ prediction: mapPrediction(rows[0]) });
  } catch (error) {
    res.status(400).json({ message: error.message || "Tahmin kaydedilemedi." });
  }
};
