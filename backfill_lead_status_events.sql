WITH lead_snapshots AS (
  SELECT
    l.id AS lead_id,
    l.status AS raw_status,
    CASE
      WHEN l.status IN ('closed_won', 'active_client') THEN 'won'
      WHEN l.status = 'closed_lost' THEN 'lost'
      ELSE l.status
    END AS normalized_status,
    l.setter_id,
    l.closer_id,
    l.created_at,
    l.updated_at,
    l.metadata,
    CASE
      WHEN NULLIF(l.metadata->>'synced_at', '') IS NOT NULL
      THEN (l.metadata->>'synced_at')::timestamptz
      ELSE NULL
    END AS synced_at,
    CASE
      WHEN regexp_replace(coalesce(l.metadata->>'deal_value', ''), '[^0-9.-]', '', 'g') ~ '^-?[0-9]+(\.[0-9]+)?$'
      THEN regexp_replace(l.metadata->>'deal_value', '[^0-9.-]', '', 'g')::numeric
      ELSE NULL
    END AS deal_value_snapshot,
    CASE
      WHEN l.updated_at IS NULL THEN TRUE
      WHEN abs(extract(epoch FROM (l.updated_at - l.created_at))) <= 300 THEN TRUE
      ELSE FALSE
    END AS created_directly
  FROM public.leads AS l
  WHERE l.status IN (
    'called',
    'booked',
    'ignored',
    'followup',
    'won',
    'closed_won',
    'active_client',
    'lost',
    'closed_lost',
    'noshow'
  )
),
candidate_rows AS (
  SELECT
    lead_id,
    raw_status,
    normalized_status,
    'setter'::text AS actor_role,
    setter_id AS actor_id,
    'called'::text AS to_status,
    NULL::numeric AS value_snapshot,
    CASE
      WHEN synced_at IS NOT NULL THEN synced_at
      WHEN created_directly THEN created_at
      ELSE NULL
    END AS occurred_at,
    CASE
      WHEN synced_at IS NOT NULL THEN 'synced_at'
      WHEN created_directly THEN 'created_at'
      ELSE NULL
    END AS timestamp_basis,
    'setter_called'::text AS target_kind,
    CASE
      WHEN setter_id IS NULL THEN 'missing_actor'
      WHEN synced_at IS NULL AND NOT created_directly THEN 'missing_trustworthy_timestamp'
      ELSE 'candidate'
    END AS base_state
  FROM lead_snapshots
  WHERE normalized_status = 'called'

  UNION ALL

  SELECT
    lead_id,
    raw_status,
    normalized_status,
    'setter'::text AS actor_role,
    setter_id AS actor_id,
    'ignored'::text AS to_status,
    NULL::numeric AS value_snapshot,
    CASE
      WHEN synced_at IS NOT NULL THEN synced_at
      WHEN created_directly THEN created_at
      ELSE NULL
    END AS occurred_at,
    CASE
      WHEN synced_at IS NOT NULL THEN 'synced_at'
      WHEN created_directly THEN 'created_at'
      ELSE NULL
    END AS timestamp_basis,
    'setter_ignored'::text AS target_kind,
    CASE
      WHEN setter_id IS NULL THEN 'missing_actor'
      WHEN synced_at IS NULL AND NOT created_directly THEN 'missing_trustworthy_timestamp'
      ELSE 'candidate'
    END AS base_state
  FROM lead_snapshots
  WHERE normalized_status = 'ignored'

  UNION ALL

  SELECT
    lead_id,
    raw_status,
    normalized_status,
    'setter'::text AS actor_role,
    setter_id AS actor_id,
    'booked'::text AS to_status,
    deal_value_snapshot AS value_snapshot,
    CASE
      WHEN synced_at IS NOT NULL THEN synced_at
      WHEN created_directly THEN created_at
      ELSE NULL
    END AS occurred_at,
    CASE
      WHEN synced_at IS NOT NULL THEN 'synced_at'
      WHEN created_directly THEN 'created_at'
      ELSE NULL
    END AS timestamp_basis,
    'setter_booked'::text AS target_kind,
    CASE
      WHEN setter_id IS NULL THEN 'missing_actor'
      WHEN synced_at IS NULL AND NOT created_directly THEN 'missing_trustworthy_timestamp'
      ELSE 'candidate'
    END AS base_state
  FROM lead_snapshots
  WHERE normalized_status = 'booked'
    AND setter_id IS NOT NULL

  UNION ALL

  SELECT
    lead_id,
    raw_status,
    normalized_status,
    'closer'::text AS actor_role,
    closer_id AS actor_id,
    'booked'::text AS to_status,
    deal_value_snapshot AS value_snapshot,
    CASE
      WHEN created_directly THEN created_at
      ELSE NULL
    END AS occurred_at,
    CASE
      WHEN created_directly THEN 'created_at'
      ELSE NULL
    END AS timestamp_basis,
    'closer_booked'::text AS target_kind,
    CASE
      WHEN closer_id IS NULL THEN 'missing_actor'
      WHEN NOT created_directly THEN 'not_created_directly'
      ELSE 'candidate'
    END AS base_state
  FROM lead_snapshots
  WHERE normalized_status = 'booked'
    AND setter_id IS NULL

  UNION ALL

  SELECT
    lead_id,
    raw_status,
    normalized_status,
    'closer'::text AS actor_role,
    closer_id AS actor_id,
    'followup'::text AS to_status,
    NULL::numeric AS value_snapshot,
    CASE
      WHEN synced_at IS NOT NULL THEN synced_at
      WHEN created_directly THEN created_at
      ELSE NULL
    END AS occurred_at,
    CASE
      WHEN synced_at IS NOT NULL THEN 'synced_at'
      WHEN created_directly THEN 'created_at'
      ELSE NULL
    END AS timestamp_basis,
    'closer_followup'::text AS target_kind,
    CASE
      WHEN closer_id IS NULL THEN 'missing_actor'
      WHEN synced_at IS NULL AND NOT created_directly THEN 'missing_trustworthy_timestamp'
      ELSE 'candidate'
    END AS base_state
  FROM lead_snapshots
  WHERE normalized_status = 'followup'

  UNION ALL

  SELECT
    lead_id,
    raw_status,
    normalized_status,
    'closer'::text AS actor_role,
    closer_id AS actor_id,
    'won'::text AS to_status,
    deal_value_snapshot AS value_snapshot,
    CASE
      WHEN synced_at IS NOT NULL THEN synced_at
      WHEN created_directly THEN created_at
      ELSE NULL
    END AS occurred_at,
    CASE
      WHEN synced_at IS NOT NULL THEN 'synced_at'
      WHEN created_directly THEN 'created_at'
      ELSE NULL
    END AS timestamp_basis,
    'closer_won'::text AS target_kind,
    CASE
      WHEN closer_id IS NULL THEN 'missing_actor'
      WHEN synced_at IS NULL AND NOT created_directly THEN 'missing_trustworthy_timestamp'
      ELSE 'candidate'
    END AS base_state
  FROM lead_snapshots
  WHERE normalized_status = 'won'

  UNION ALL

  SELECT
    lead_id,
    raw_status,
    normalized_status,
    'closer'::text AS actor_role,
    closer_id AS actor_id,
    'lost'::text AS to_status,
    NULL::numeric AS value_snapshot,
    CASE
      WHEN synced_at IS NOT NULL THEN synced_at
      WHEN created_directly THEN created_at
      ELSE NULL
    END AS occurred_at,
    CASE
      WHEN synced_at IS NOT NULL THEN 'synced_at'
      WHEN created_directly THEN 'created_at'
      ELSE NULL
    END AS timestamp_basis,
    'closer_lost'::text AS target_kind,
    CASE
      WHEN closer_id IS NULL THEN 'missing_actor'
      WHEN synced_at IS NULL AND NOT created_directly THEN 'missing_trustworthy_timestamp'
      ELSE 'candidate'
    END AS base_state
  FROM lead_snapshots
  WHERE normalized_status = 'lost'

  UNION ALL

  SELECT
    lead_id,
    raw_status,
    normalized_status,
    'closer'::text AS actor_role,
    closer_id AS actor_id,
    'noshow'::text AS to_status,
    NULL::numeric AS value_snapshot,
    CASE
      WHEN synced_at IS NOT NULL THEN synced_at
      WHEN created_directly THEN created_at
      ELSE NULL
    END AS occurred_at,
    CASE
      WHEN synced_at IS NOT NULL THEN 'synced_at'
      WHEN created_directly THEN 'created_at'
      ELSE NULL
    END AS timestamp_basis,
    'closer_noshow'::text AS target_kind,
    CASE
      WHEN closer_id IS NULL THEN 'missing_actor'
      WHEN synced_at IS NULL AND NOT created_directly THEN 'missing_trustworthy_timestamp'
      ELSE 'candidate'
    END AS base_state
  FROM lead_snapshots
  WHERE normalized_status = 'noshow'
),
insert_candidates AS (
  SELECT
    c.*
  FROM candidate_rows AS c
  WHERE c.base_state = 'candidate'
    AND NOT EXISTS (
      SELECT 1
      FROM public.lead_status_events AS existing
      WHERE existing.lead_id = c.lead_id
        AND existing.to_status = c.to_status
        AND existing.occurred_at = c.occurred_at
        AND existing.meta->>'source' = 'historical_backfill'
    )
),
inserted_rows AS (
  INSERT INTO public.lead_status_events (
    lead_id,
    actor_id,
    actor_role,
    from_status,
    to_status,
    value_snapshot,
    note,
    meta,
    occurred_at
  )
  SELECT
    lead_id,
    actor_id,
    actor_role,
    NULL AS from_status,
    to_status,
    value_snapshot,
    NULL AS note,
    jsonb_build_object(
      'source', 'historical_backfill',
      'confidence', 'exact_internal',
      'timestamp_basis', timestamp_basis,
      'method_version', 'v1',
      'target_kind', target_kind,
      'raw_status', raw_status
    ) AS meta,
    occurred_at
  FROM insert_candidates
  RETURNING lead_id, actor_role, to_status, occurred_at, meta
)
SELECT
  actor_role,
  to_status,
  COUNT(*) AS inserted_rows,
  MIN(occurred_at) AS earliest_occurred_at,
  MAX(occurred_at) AS latest_occurred_at
FROM inserted_rows
GROUP BY actor_role, to_status
ORDER BY actor_role, to_status;
