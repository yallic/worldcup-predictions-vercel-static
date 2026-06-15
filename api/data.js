const { mapMatch, mapParticipant, mapPrediction, supabaseRequest } = require("./_supabase");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ message: "Method not allowed." });
    return;
  }

  try {
    const [participants, matches, predictions] = await Promise.all([
      supabaseRequest("/participants", { query: "?select=id,display_name,created_at&order=created_at.asc" }),
      supabaseRequest("/matches", { query: "?select=*&order=kickoff_at.asc" }),
      supabaseRequest("/predictions", { query: "?select=*&order=created_at.asc" })
    ]);

    res.status(200).json({
      participants: participants.map(mapParticipant),
      matches: matches.map(mapMatch),
      predictions: predictions.map(mapPrediction)
    });
  } catch (error) {
    res.status(400).json({ message: error.message || "Veri okunamadi." });
  }
};
