alter table public.leads
add column if not exists google_maps_url text;

create or replace function public.build_google_maps_url(
  p_business_name text,
  p_city text default null,
  p_state text default null
)
returns text
language sql
stable
as $$
  with normalized_query as (
    select nullif(
      trim(
        regexp_replace(
          concat_ws(
            ' ',
            nullif(trim(p_business_name), ''),
            nullif(trim(p_city), ''),
            nullif(trim(p_state), '')
          ),
          '\s+',
          ' ',
          'g'
        )
      ),
      ''
    ) as query
  )
  select case
    when query is null then null
    else 'https://www.google.com/maps/search/?api=1&query=' || replace(query, ' ', '+')
  end
  from normalized_query;
$$;

create or replace function public.sync_lead_google_maps_url()
returns trigger
language plpgsql
as $$
begin
  new.google_maps_url := public.build_google_maps_url(
    new.business_name,
    coalesce(new.metadata, '{}'::jsonb)->>'city',
    coalesce(new.metadata, '{}'::jsonb)->>'state'
  );
  return new;
end;
$$;

update public.leads
set google_maps_url = public.build_google_maps_url(
  business_name,
  coalesce(metadata, '{}'::jsonb)->>'city',
  coalesce(metadata, '{}'::jsonb)->>'state'
)
where google_maps_url is distinct from public.build_google_maps_url(
  business_name,
  coalesce(metadata, '{}'::jsonb)->>'city',
  coalesce(metadata, '{}'::jsonb)->>'state'
);

drop trigger if exists tr_sync_lead_google_maps_url on public.leads;

create trigger tr_sync_lead_google_maps_url
before insert or update of business_name, metadata on public.leads
for each row
execute function public.sync_lead_google_maps_url();
