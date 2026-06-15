const { requireAdmin } = require("./_security");
const { mapMatch, supabaseRequest } = require("./_supabase");

module.exports = async function handler(req, res) {
  if (!requireAdmin(req, res)) {
    return;
  }

  try {
    if (req.method === "POST") {
      const body = req.body || {};
      const kickoffAt = new Date(body.kickoffAt);
      const lockedAt = body.lockedAt ? new Date(body.lockedAt) : new Date(kickoffAt.getTime() - 5 * 60 * 1000);

      const rows = await supabaseRequest("/matches", {
        method: "POST",
        body: {
          external_fixture_id: body.externalFixtureId || null,
          api_provider: body.externalFixtureId ? "manual-import" : null,
          stage: body.stage || "Grup",
          home_team: body.homeTeam,
          away_team: body.awayTeam,
          venue: body.venue || null,
          kickoff_at: kickoffAt.toISOString(),
          locked_at: lockedAt.toISOString()
        },
        query: "?select=*",
        prefer: "return=representation"
      });

      res.status(201).json({ match: mapMatch(rows[0]) });
      return;
    }

    if (req.method === "PATCH") {
      const body = req.body || {};
      const id = body.id;

      if (!id) {
        res.status(400).json({ message: "Mac id zorunlu." });
        return;
      }

      const update = {};

      if (body.stage !== undefined) update.stage = body.stage;
      if (body.homeTeam !== undefined) update.home_team = body.homeTeam;
      if (body.awayTeam !== undefined) update.away_team = body.awayTeam;
      if (body.venue !== undefined) update.venue = body.venue;
      if (body.kickoffAt !== undefined) update.kickoff_at = new Date(body.kickoffAt).toISOString();
      if (body.lockedAt !== undefined) update.locked_at = new Date(body.lockedAt).toISOString();
      if (body.status !== undefined) update.status = body.status;

      if (body.homeScore === "" || body.awayScore === "") {
        update.home_score = null;
        update.away_score = null;
        update.status = "scheduled";
      } else if (body.homeScore !== undefined && body.awayScore !== undefined) {
        update.home_score = Number(body.homeScore);
        update.away_score = Number(body.awayScore);
        update.status = "finished";
      }

      const rows = await supabaseRequest("/matches", {
        method: "PATCH",
        body: update,
        query: `?id=eq.${encodeURIComponent(id)}&select=*`,
        prefer: "return=representation"
      });

      res.status(200).json({ match: mapMatch(rows[0]) });
      return;
    }

    if (req.method === "DELETE") {
      const id = req.query.id;

      if (!id) {
        res.status(400).json({ message: "Mac id zorunlu." });
        return;
      }

      await supabaseRequest("/matches", {
        method: "DELETE",
        query: `?id=eq.${encodeURIComponent(id)}`
      });

      res.status(200).json({ ok: true });
      return;
    }

    res.setHeader("Allow", "POST, PATCH, DELETE");
    res.status(405).json({ message: "Method not allowed." });
  } catch (error) {
    res.status(400).json({ message: error.message || "Admin islemi yapilamadi." });
  }
};
