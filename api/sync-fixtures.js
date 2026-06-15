const { requireAdmin } = require("./_security");
const { mapMatch, supabaseRequest } = require("./_supabase");

const finishedStatuses = new Set(["FT", "AET", "PEN"]);

function toMatchPayload(item) {
  const kickoff = new Date(item.fixture.date);
  const locked = new Date(kickoff.getTime() - 5 * 60 * 1000);
  const status = finishedStatuses.has(item.fixture.status.short) ? "finished" : "scheduled";

  return {
    external_fixture_id: item.fixture.id,
    api_provider: "api-football",
    stage: item.league.round || "World Cup",
    home_team: item.teams.home.name,
    away_team: item.teams.away.name,
    venue: [item.fixture.venue?.name, item.fixture.venue?.city].filter(Boolean).join(", ") || null,
    kickoff_at: kickoff.toISOString(),
    locked_at: locked.toISOString(),
    home_score: status === "finished" ? item.goals.home : null,
    away_score: status === "finished" ? item.goals.away : null,
    status,
    last_synced_at: new Date().toISOString()
  };
}

module.exports = async function handler(req, res) {
  if (!requireAdmin(req, res)) {
    return;
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ message: "Method not allowed." });
    return;
  }

  const apiKey = process.env.API_FOOTBALL_KEY;
  const league = process.env.API_FOOTBALL_LEAGUE || "1";
  const season = process.env.API_FOOTBALL_SEASON || "2026";

  if (!apiKey) {
    res.status(400).json({ message: "API_FOOTBALL_KEY tanimli degil." });
    return;
  }

  try {
    const response = await fetch(`https://v3.football.api-sports.io/fixtures?league=${league}&season=${season}`, {
      headers: {
        "x-apisports-key": apiKey
      }
    });

    const body = await response.json();

    if (!response.ok || body.errors?.length) {
      res.status(400).json({ message: JSON.stringify(body.errors || body) });
      return;
    }

    const payload = body.response.map(toMatchPayload);

    if (!payload.length) {
      res.status(200).json({ synced: 0, matches: [] });
      return;
    }

    const rows = await supabaseRequest("/matches", {
      method: "POST",
      body: payload,
      query: "?on_conflict=external_fixture_id&select=*",
      prefer: "resolution=merge-duplicates,return=representation"
    });

    res.status(200).json({
      synced: rows.length,
      matches: rows.map(mapMatch)
    });
  } catch (error) {
    res.status(400).json({ message: error.message || "Fikstur senkronize edilemedi." });
  }
};
