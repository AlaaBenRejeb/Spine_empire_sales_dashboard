-- ================================================================
-- Spine Empire: Auto-Sync Performance Metrics Trigger
-- Version: 1.0 | 2026-04-05
--
-- PROBLEM SOLVED:
--   performance_metrics was a static table that nobody was writing
--   to when lead statuses changed. All three dashboards were reading
--   stale or empty data.
--
-- HOW TO RUN:
--   Paste this entire file into Supabase SQL Editor and run it.
--   It creates the trigger + backfills all existing data.
--
-- WHAT IT DOES:
--   1. Creates a Postgres trigger on the `leads` table.
--   2. Fires on INSERT, UPDATE (status/setter_id/closer_id), DELETE.
--   3. Recalculates metrics for the affected setter AND closer.
--   4. Upserts into performance_metrics instantly.
--   5. All dashboards update via existing real-time subscriptions.
--
-- POWER SCORE FORMULAS (from FULL_CONTEXT.md):
--   Setter: (win_rate * 0.7) + (volume_factor * 0.3)
--           volume_factor = bookings / 10, capped at 1
--   Closer: (win_rate * 0.8) + (volume_factor * 0.2)
--           volume_factor = wins / 5, capped at 1
-- ================================================================

-- ----------------------------------------------------------------
-- STEP 1: Create the trigger function
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_performance_metrics()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  GLOBAL_DEAL_VALUE  CONSTANT NUMERIC := 6500;
  MAX_SETTER_VOL     CONSTANT NUMERIC := 10;
  MAX_CLOSER_VOL     CONSTANT NUMERIC := 5;

  v_id           UUID;
  v_total        INT;
  v_bookings     INT;
  v_wins         INT;
  v_total_demos  INT;
  v_win_rate     NUMERIC;
  v_power_score  INT;
  v_revenue      NUMERIC;
BEGIN

  -- ============================================================
  -- SETTER METRICS
  -- ============================================================

  -- Recalculate for NEW.setter_id (INSERT or UPDATE)
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.setter_id IS NOT NULL THEN
    v_id := NEW.setter_id;

    SELECT
      COUNT(*),
      COUNT(*) FILTER (WHERE status IN ('booked','won','lost','noshow','followup','closed_won','closed_lost'))
    INTO v_total, v_bookings
    FROM public.leads WHERE setter_id = v_id;

    SELECT COALESCE(SUM(COALESCE((metadata->>'deal_value')::NUMERIC, GLOBAL_DEAL_VALUE)), 0)
    INTO v_revenue
    FROM public.leads WHERE setter_id = v_id AND status IN ('won','closed_won');

    v_win_rate    := CASE WHEN v_total > 0 THEN ROUND((v_bookings::NUMERIC / v_total * 100), 1) ELSE 0 END;
    v_power_score := LEAST(ROUND((v_win_rate * 0.7) + (LEAST(v_bookings::NUMERIC / MAX_SETTER_VOL, 1.0) * 100 * 0.3)), 100)::INT;

    INSERT INTO public.performance_metrics
      (profile_id, role, period, bookings, wins, win_rate, revenue, power_score, synced_at)
    VALUES
      (v_id, 'setter', 'current', v_bookings, 0, v_win_rate, v_revenue, v_power_score, NOW())
    ON CONFLICT ON CONSTRAINT profile_period_unique DO UPDATE SET
      role          = 'setter',
      bookings      = EXCLUDED.bookings,
      win_rate      = EXCLUDED.win_rate,
      revenue       = EXCLUDED.revenue,
      power_score   = EXCLUDED.power_score,
      synced_at     = NOW();
  END IF;

  -- Recalculate for OLD.setter_id if setter changed (UPDATE)
  IF TG_OP = 'UPDATE'
    AND OLD.setter_id IS DISTINCT FROM NEW.setter_id
    AND OLD.setter_id IS NOT NULL
  THEN
    v_id := OLD.setter_id;

    SELECT
      COUNT(*),
      COUNT(*) FILTER (WHERE status IN ('booked','won','lost','noshow','followup','closed_won','closed_lost'))
    INTO v_total, v_bookings
    FROM public.leads WHERE setter_id = v_id;

    SELECT COALESCE(SUM(COALESCE((metadata->>'deal_value')::NUMERIC, GLOBAL_DEAL_VALUE)), 0)
    INTO v_revenue
    FROM public.leads WHERE setter_id = v_id AND status IN ('won','closed_won');

    v_win_rate    := CASE WHEN v_total > 0 THEN ROUND((v_bookings::NUMERIC / v_total * 100), 1) ELSE 0 END;
    v_power_score := LEAST(ROUND((v_win_rate * 0.7) + (LEAST(v_bookings::NUMERIC / MAX_SETTER_VOL, 1.0) * 100 * 0.3)), 100)::INT;

    INSERT INTO public.performance_metrics
      (profile_id, role, period, bookings, wins, win_rate, revenue, power_score, synced_at)
    VALUES
      (v_id, 'setter', 'current', v_bookings, 0, v_win_rate, v_revenue, v_power_score, NOW())
    ON CONFLICT ON CONSTRAINT profile_period_unique DO UPDATE SET
      role          = 'setter',
      bookings      = EXCLUDED.bookings,
      win_rate      = EXCLUDED.win_rate,
      revenue       = EXCLUDED.revenue,
      power_score   = EXCLUDED.power_score,
      synced_at     = NOW();
  END IF;

  -- Recalculate for OLD.setter_id on DELETE
  IF TG_OP = 'DELETE' AND OLD.setter_id IS NOT NULL THEN
    v_id := OLD.setter_id;

    SELECT
      COUNT(*),
      COUNT(*) FILTER (WHERE status IN ('booked','won','lost','noshow','followup','closed_won','closed_lost'))
    INTO v_total, v_bookings
    FROM public.leads WHERE setter_id = v_id;

    SELECT COALESCE(SUM(COALESCE((metadata->>'deal_value')::NUMERIC, GLOBAL_DEAL_VALUE)), 0)
    INTO v_revenue
    FROM public.leads WHERE setter_id = v_id AND status IN ('won','closed_won');

    v_win_rate    := CASE WHEN v_total > 0 THEN ROUND((v_bookings::NUMERIC / v_total * 100), 1) ELSE 0 END;
    v_power_score := LEAST(ROUND((v_win_rate * 0.7) + (LEAST(v_bookings::NUMERIC / MAX_SETTER_VOL, 1.0) * 100 * 0.3)), 100)::INT;

    INSERT INTO public.performance_metrics
      (profile_id, role, period, bookings, wins, win_rate, revenue, power_score, synced_at)
    VALUES
      (v_id, 'setter', 'current', v_bookings, 0, v_win_rate, v_revenue, v_power_score, NOW())
    ON CONFLICT ON CONSTRAINT profile_period_unique DO UPDATE SET
      bookings      = EXCLUDED.bookings,
      win_rate      = EXCLUDED.win_rate,
      revenue       = EXCLUDED.revenue,
      power_score   = EXCLUDED.power_score,
      synced_at     = NOW();
  END IF;

  -- ============================================================
  -- CLOSER METRICS
  -- ============================================================

  -- Recalculate for NEW.closer_id (INSERT or UPDATE)
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.closer_id IS NOT NULL THEN
    v_id := NEW.closer_id;

    SELECT
      COUNT(*) FILTER (WHERE status IN ('won','lost','noshow','closed_won','closed_lost','followup')),
      COUNT(*) FILTER (WHERE status IN ('won','closed_won'))
    INTO v_total_demos, v_wins
    FROM public.leads WHERE closer_id = v_id;

    v_revenue     := v_wins * GLOBAL_DEAL_VALUE;
    v_win_rate    := CASE WHEN v_total_demos > 0 THEN ROUND((v_wins::NUMERIC / v_total_demos * 100), 1) ELSE 0 END;
    v_power_score := LEAST(ROUND((v_win_rate * 0.8) + (LEAST(v_wins::NUMERIC / MAX_CLOSER_VOL, 1.0) * 100 * 0.2)), 100)::INT;

    INSERT INTO public.performance_metrics
      (profile_id, role, period, bookings, wins, win_rate, revenue, power_score, synced_at)
    VALUES
      (v_id, 'closer', 'current', v_total_demos, v_wins, v_win_rate, v_revenue, v_power_score, NOW())
    ON CONFLICT ON CONSTRAINT profile_period_unique DO UPDATE SET
      role          = 'closer',
      bookings      = EXCLUDED.bookings,
      wins          = EXCLUDED.wins,
      win_rate      = EXCLUDED.win_rate,
      revenue       = EXCLUDED.revenue,
      power_score   = EXCLUDED.power_score,
      synced_at     = NOW();
  END IF;

  -- Recalculate for OLD.closer_id if closer changed (UPDATE)
  IF TG_OP = 'UPDATE'
    AND OLD.closer_id IS DISTINCT FROM NEW.closer_id
    AND OLD.closer_id IS NOT NULL
  THEN
    v_id := OLD.closer_id;

    SELECT
      COUNT(*) FILTER (WHERE status IN ('won','lost','noshow','closed_won','closed_lost','followup')),
      COUNT(*) FILTER (WHERE status IN ('won','closed_won'))
    INTO v_total_demos, v_wins
    FROM public.leads WHERE closer_id = v_id;

    v_revenue     := v_wins * GLOBAL_DEAL_VALUE;
    v_win_rate    := CASE WHEN v_total_demos > 0 THEN ROUND((v_wins::NUMERIC / v_total_demos * 100), 1) ELSE 0 END;
    v_power_score := LEAST(ROUND((v_win_rate * 0.8) + (LEAST(v_wins::NUMERIC / MAX_CLOSER_VOL, 1.0) * 100 * 0.2)), 100)::INT;

    INSERT INTO public.performance_metrics
      (profile_id, role, period, bookings, wins, win_rate, revenue, power_score, synced_at)
    VALUES
      (v_id, 'closer', 'current', v_total_demos, v_wins, v_win_rate, v_revenue, v_power_score, NOW())
    ON CONFLICT ON CONSTRAINT profile_period_unique DO UPDATE SET
      role          = 'closer',
      bookings      = EXCLUDED.bookings,
      wins          = EXCLUDED.wins,
      win_rate      = EXCLUDED.win_rate,
      revenue       = EXCLUDED.revenue,
      power_score   = EXCLUDED.power_score,
      synced_at     = NOW();
  END IF;

  -- Recalculate for OLD.closer_id on DELETE
  IF TG_OP = 'DELETE' AND OLD.closer_id IS NOT NULL THEN
    v_id := OLD.closer_id;

    SELECT
      COUNT(*) FILTER (WHERE status IN ('won','lost','noshow','closed_won','closed_lost','followup')),
      COUNT(*) FILTER (WHERE status IN ('won','closed_won'))
    INTO v_total_demos, v_wins
    FROM public.leads WHERE closer_id = v_id;

    v_revenue     := v_wins * GLOBAL_DEAL_VALUE;
    v_win_rate    := CASE WHEN v_total_demos > 0 THEN ROUND((v_wins::NUMERIC / v_total_demos * 100), 1) ELSE 0 END;
    v_power_score := LEAST(ROUND((v_win_rate * 0.8) + (LEAST(v_wins::NUMERIC / MAX_CLOSER_VOL, 1.0) * 100 * 0.2)), 100)::INT;

    INSERT INTO public.performance_metrics
      (profile_id, role, period, bookings, wins, win_rate, revenue, power_score, synced_at)
    VALUES
      (v_id, 'closer', 'current', v_total_demos, v_wins, v_win_rate, v_revenue, v_power_score, NOW())
    ON CONFLICT ON CONSTRAINT profile_period_unique DO UPDATE SET
      bookings      = EXCLUDED.bookings,
      wins          = EXCLUDED.wins,
      win_rate      = EXCLUDED.win_rate,
      revenue       = EXCLUDED.revenue,
      power_score   = EXCLUDED.power_score,
      synced_at     = NOW();
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- ----------------------------------------------------------------
-- STEP 2: Drop old trigger (if exists) and create new one
-- ----------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_sync_performance_metrics ON public.leads;

CREATE TRIGGER trg_sync_performance_metrics
  AFTER INSERT OR UPDATE OF status, setter_id, closer_id OR DELETE
  ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_performance_metrics();

-- ----------------------------------------------------------------
-- STEP 3: Backfill — recalculate all existing data from scratch
-- ----------------------------------------------------------------

-- Setter backfill
INSERT INTO public.performance_metrics
  (profile_id, role, period, bookings, wins, win_rate, revenue, power_score, synced_at)
SELECT
  setter_id AS profile_id,
  'setter'  AS role,
  'current' AS period,
  COUNT(*) FILTER (WHERE status IN ('booked','won','lost','noshow','followup','closed_won','closed_lost')) AS bookings,
  0 AS wins,
  CASE
    WHEN COUNT(*) > 0
    THEN ROUND((COUNT(*) FILTER (WHERE status IN ('booked','won','lost','noshow','followup','closed_won','closed_lost'))::NUMERIC / COUNT(*) * 100), 1)
    ELSE 0
  END AS win_rate,
  COALESCE(SUM(CASE WHEN status IN ('won','closed_won') THEN COALESCE((metadata->>'deal_value')::NUMERIC, 6500) ELSE 0 END), 0) AS revenue,
  LEAST(ROUND((
    (CASE WHEN COUNT(*) > 0
      THEN COUNT(*) FILTER (WHERE status IN ('booked','won','lost','noshow','followup','closed_won','closed_lost'))::NUMERIC / COUNT(*) * 100
      ELSE 0 END * 0.7)
    + (LEAST(COUNT(*) FILTER (WHERE status IN ('booked','won','lost','noshow','followup','closed_won','closed_lost'))::NUMERIC / 10, 1.0) * 100 * 0.3)
  ))::INT, 100) AS power_score,
  NOW() AS synced_at
FROM public.leads
WHERE setter_id IS NOT NULL
GROUP BY setter_id
ON CONFLICT ON CONSTRAINT profile_period_unique DO UPDATE SET
  role        = 'setter',
  bookings    = EXCLUDED.bookings,
  win_rate    = EXCLUDED.win_rate,
  revenue     = EXCLUDED.revenue,
  power_score = EXCLUDED.power_score,
  synced_at   = NOW();

-- Closer backfill
INSERT INTO public.performance_metrics
  (profile_id, role, period, bookings, wins, win_rate, revenue, power_score, synced_at)
SELECT
  closer_id AS profile_id,
  'closer'  AS role,
  'current' AS period,
  COUNT(*) FILTER (WHERE status IN ('won','lost','noshow','closed_won','closed_lost','followup')) AS bookings,
  COUNT(*) FILTER (WHERE status IN ('won','closed_won')) AS wins,
  CASE
    WHEN COUNT(*) FILTER (WHERE status IN ('won','lost','noshow','closed_won','closed_lost','followup')) > 0
    THEN ROUND((COUNT(*) FILTER (WHERE status IN ('won','closed_won'))::NUMERIC
      / COUNT(*) FILTER (WHERE status IN ('won','lost','noshow','closed_won','closed_lost','followup')) * 100), 1)
    ELSE 0
  END AS win_rate,
  COUNT(*) FILTER (WHERE status IN ('won','closed_won')) * 6500 AS revenue,
  LEAST(ROUND((
    (CASE WHEN COUNT(*) FILTER (WHERE status IN ('won','lost','noshow','closed_won','closed_lost','followup')) > 0
      THEN COUNT(*) FILTER (WHERE status IN ('won','closed_won'))::NUMERIC
        / COUNT(*) FILTER (WHERE status IN ('won','lost','noshow','closed_won','closed_lost','followup')) * 100
      ELSE 0 END * 0.8)
    + (LEAST(COUNT(*) FILTER (WHERE status IN ('won','closed_won'))::NUMERIC / 5, 1.0) * 100 * 0.2)
  ))::INT, 100) AS power_score,
  NOW() AS synced_at
FROM public.leads
WHERE closer_id IS NOT NULL
GROUP BY closer_id
ON CONFLICT ON CONSTRAINT profile_period_unique DO UPDATE SET
  role        = 'closer',
  bookings    = EXCLUDED.bookings,
  wins        = EXCLUDED.wins,
  win_rate    = EXCLUDED.win_rate,
  revenue     = EXCLUDED.revenue,
  power_score = EXCLUDED.power_score,
  synced_at   = NOW();

-- ----------------------------------------------------------------
-- DONE. Verify with:
-- SELECT profile_id, role, bookings, wins, win_rate, revenue, power_score, synced_at
-- FROM performance_metrics ORDER BY synced_at DESC;
-- ----------------------------------------------------------------
