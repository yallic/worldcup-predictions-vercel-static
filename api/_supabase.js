const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function assertConfig() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY zorunlu.");
  }
}

async function supabaseRequest(path, options = {}) {
  assertConfig();

  const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1${path}${options.query || ""}`, {
    method: options.method || "GET",
    headers: {
      apikey: serviceRoleKey,
      authorization: `Bearer ${serviceRoleKey}`,
      "content-type": "application/json",
      ...(options.prefer ? { prefer: options.prefer } : {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Supabase istegi basarisiz: ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function mapParticipant(row) {
  return {
    id: row.id,
    displayName: row.display_name,
    createdAt: row.created_at
  };
}

function mapMatch(row) {
  return {
    id: row.id,
    externalFixtureId: row.external_fixture_id,
    apiProvider: row.api_provider,
    stage: row.stage,
    homeTeam: row.home_team,
    awayTeam: row.away_team,
    venue: row.venue,
    kickoffAt: row.kickoff_at,
    lockedAt: row.locked_at,
    homeScore: row.home_score,
    awayScore: row.away_score,
    status: row.status,
    lastSyncedAt: row.last_synced_at
  };
}

function mapPrediction(row) {
  return {
    id: row.id,
    participantId: row.participant_id,
    matchId: row.match_id,
    homeScore: row.home_score,
    awayScore: row.away_score,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

module.exports = { mapMatch, mapParticipant, mapPrediction, supabaseRequest };
