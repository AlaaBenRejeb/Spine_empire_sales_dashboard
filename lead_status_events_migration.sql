BEGIN;

CREATE TABLE IF NOT EXISTS public.lead_status_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  actor_role TEXT,
  from_status TEXT,
  to_status TEXT NOT NULL,
  value_snapshot NUMERIC,
  note TEXT,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lead_status_events_actor_occurred_idx
  ON public.lead_status_events (actor_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS lead_status_events_lead_occurred_idx
  ON public.lead_status_events (lead_id, occurred_at DESC);

ALTER TABLE public.lead_status_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS lead_status_events_select_by_role ON public.lead_status_events;
CREATE POLICY lead_status_events_select_by_role
ON public.lead_status_events
FOR SELECT
TO authenticated
USING (
  public.is_admin_or_superadmin()
  OR EXISTS (
    SELECT 1
    FROM public.leads AS l
    WHERE l.id = lead_status_events.lead_id
      AND (
        (public.current_user_role() = 'setter' AND (l.setter_id = auth.uid() OR l.setter_id IS NULL))
        OR (public.current_user_role() = 'closer' AND l.closer_id = auth.uid())
      )
  )
);

DROP POLICY IF EXISTS lead_status_events_insert_by_role ON public.lead_status_events;
CREATE POLICY lead_status_events_insert_by_role
ON public.lead_status_events
FOR INSERT
TO authenticated
WITH CHECK (
  actor_id = auth.uid()
  AND (
    public.is_admin_or_superadmin()
    OR EXISTS (
      SELECT 1
      FROM public.leads AS l
      WHERE l.id = lead_status_events.lead_id
        AND (
          (public.current_user_role() = 'setter' AND (l.setter_id = auth.uid() OR l.setter_id IS NULL))
          OR (public.current_user_role() = 'closer' AND l.closer_id = auth.uid())
        )
    )
  )
);

DROP POLICY IF EXISTS lead_status_events_update_admin_only ON public.lead_status_events;
CREATE POLICY lead_status_events_update_admin_only
ON public.lead_status_events
FOR UPDATE
TO authenticated
USING (public.is_admin_or_superadmin())
WITH CHECK (public.is_admin_or_superadmin());

DROP POLICY IF EXISTS lead_status_events_delete_admin_only ON public.lead_status_events;
CREATE POLICY lead_status_events_delete_admin_only
ON public.lead_status_events
FOR DELETE
TO authenticated
USING (public.is_admin_or_superadmin());

COMMIT;
