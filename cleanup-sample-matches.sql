delete from public.matches
where external_fixture_id is null
  and (home_team, away_team, kickoff_at) in (
    ('Turkiye', 'Brezilya', '2026-06-20 19:00:00+03'::timestamptz),
    ('Arjantin', 'Fransa', '2026-06-21 22:00:00+03'::timestamptz),
    ('Almanya', 'Ispanya', '2026-06-22 19:00:00+03'::timestamptz)
  );
