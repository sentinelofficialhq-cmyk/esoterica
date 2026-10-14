-- Esoterica: A/B tests, usage events, subscriptions and admin results.
--
-- Every install signs in anonymously at first launch (Supabase Auth), so each row below belongs
-- to an auth user. People can later link Apple, Google or email to the same user.
-- Nothing here holds chat text, dreams, journals, names or birth data.

-- ── Admins ───────────────────────────────────────────────────────────────────

create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  added_at timestamptz not null default now()
);

create function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ── Installs, experiments and assignments ────────────────────────────────────

create table public.installs (
  install_id text primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- False for installs set up before the tests began: they are left out of results.
  enrolled boolean not null,
  first_open_at timestamptz not null,
  platform text not null,
  app_version text not null,
  created_at timestamptz not null default now()
);
create index installs_user_idx on public.installs (user_id);

create table public.experiments (
  key text primary key,
  -- [{ "id": "daylight", "weight": 1 }, …]
  variants jsonb not null,
  status text not null default 'running' check (status in ('running', 'stopped')),
  -- Once stopped, new installs get the winner. Existing installs keep what they had.
  winner text,
  updated_at timestamptz not null default now()
);

insert into public.experiments (key, variants) values
  ('theme', '[{"id":"ember","weight":1},{"id":"gilded","weight":1},{"id":"nebula","weight":1},{"id":"emberQuiet","weight":1},{"id":"brass","weight":1},{"id":"daylight","weight":1}]'),
  ('paywall', '[{"id":"timeline","weight":1},{"id":"locked","weight":1},{"id":"jung","weight":1}]');

create table public.assignments (
  install_id text not null references public.installs (install_id) on delete cascade,
  experiment text not null references public.experiments (key),
  variant text not null,
  assigned_at timestamptz not null,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  primary key (install_id, experiment)
);
create index assignments_experiment_idx on public.assignments (experiment, variant);

-- ── Events ───────────────────────────────────────────────────────────────────

create table public.events (
  -- Made on the device, so a retried upload is a no-op.
  id text not null check (length(id) between 6 and 64),
  install_id text not null,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (name ~ '^[a-z_]{1,40}$'),
  props jsonb not null default '{}' check (jsonb_typeof(props) = 'object' and octet_length(props::text) <= 2048),
  -- The install's test groups when the event happened.
  variants jsonb not null default '{}',
  client_ts timestamptz not null,
  received_at timestamptz not null default now(),
  app_version text not null,
  platform text not null,
  primary key (install_id, id)
);
create index events_install_name_idx on public.events (install_id, name, client_ts);

-- ── Subscriptions (written by the RevenueCat webhook) ────────────────────────

create table public.entitlements (
  user_id uuid primary key references auth.users (id) on delete cascade,
  active boolean not null,
  product_id text,
  -- TRIAL, INTRO or NORMAL
  period_type text,
  expires_at timestamptz,
  store text,
  -- The newest webhook event applied, so a late redelivery can't undo a newer state.
  last_event_ts timestamptz,
  updated_at timestamptz not null default now()
);

create table public.purchase_events (
  -- RevenueCat's event id, so redelivered webhooks are ignored.
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  -- INITIAL_PURCHASE, RENEWAL, CANCELLATION, EXPIRATION, PRODUCT_CHANGE, …
  type text not null,
  product_id text,
  period_type text,
  event_ts timestamptz not null,
  received_at timestamptz not null default now()
);
create index purchase_events_user_idx on public.purchase_events (user_id, event_ts);

-- ── AI usage (token counts only; written by the chat function) ───────────────

create table public.usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  model text not null,
  requests integer not null default 0,
  input_tokens bigint not null default 0,
  output_tokens bigint not null default 0,
  cache_read_tokens bigint not null default 0,
  cache_write_tokens bigint not null default 0,
  primary key (user_id, day, model)
);

-- ── Row-level security ───────────────────────────────────────────────────────
-- People can add their own rows. Only admins read results; only the service role writes
-- subscriptions and usage.

alter table public.admins enable row level security;
alter table public.installs enable row level security;
alter table public.experiments enable row level security;
alter table public.assignments enable row level security;
alter table public.events enable row level security;
alter table public.entitlements enable row level security;
alter table public.purchase_events enable row level security;
alter table public.usage enable row level security;

create policy "see own admin row" on public.admins for select to authenticated using (user_id = auth.uid());

create policy "add own install" on public.installs for insert to authenticated with check (user_id = auth.uid());
create policy "see own install" on public.installs for select to authenticated using (user_id = auth.uid());
create policy "update own install" on public.installs for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "read experiment settings" on public.experiments for select to anon, authenticated using (true);

create policy "add own assignment" on public.assignments for insert to authenticated
  with check (user_id = auth.uid() and exists (select 1 from public.installs i where i.install_id = assignments.install_id and i.user_id = auth.uid()));
create policy "see own assignments" on public.assignments for select to authenticated using (user_id = auth.uid());

create policy "add own events" on public.events for insert to authenticated with check (user_id = auth.uid());

create policy "see own entitlement" on public.entitlements for select to authenticated using (user_id = auth.uid());
create policy "see own usage" on public.usage for select to authenticated using (user_id = auth.uid());

-- Assignments and events never change once made, and an install's enrollment is fixed: only its
-- platform and version can be updated.
revoke update, delete on public.assignments from anon, authenticated;
revoke update, delete on public.events from anon, authenticated;
revoke update on public.installs from anon, authenticated;
grant update (platform, app_version) on public.installs to authenticated;

-- ── Results ──────────────────────────────────────────────────────────────────

/*
  Per variant of one experiment, among enrolled installs:
  - enrolled: installs in the group.
  - d1, d7, d30: of installs at least N days old, how many opened the app N or more days after
    their first open ("still opening N days later").
  - median_span_days: median days between first and last open.
  - mean_active_days_30: of installs at least 30 days old, mean distinct days with an open in their
    first 30.
  - Paywall only: trial = of installs that saw a paywall, how many started a trial. paid = of
    trials started at least 8 days ago (7-day trial plus a day for billing), how many became paid.
  Results are grouped by the variant first assigned, even if the person switched later. Only events
  sent by the install's own user count, so no one can inflate another install's numbers.
  The app turns the counts into 95% ranges and the leader call (src/experiments/stats.ts).
*/
create function public.experiment_results(p_key text, p_now timestamptz default now())
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'admins only' using errcode = '42501';
  end if;

  with members as (
    select a.install_id, a.variant, i.user_id, i.first_open_at
    from assignments a
    join installs i using (install_id)
    where a.experiment = p_key and i.enrolled
  ),
  opens as (
    select m.install_id, greatest(e.client_ts, m.first_open_at) as ts
    from members m
    join events e on e.install_id = m.install_id and e.user_id = m.user_id and e.name = 'app_open'
    union all
    select install_id, first_open_at from members
  ),
  per_install as (
    select
      m.install_id,
      m.variant,
      m.user_id,
      m.first_open_at,
      max(o.ts) as last_open,
      count(distinct floor(extract(epoch from (o.ts - m.first_open_at)) / 86400))
        filter (where o.ts < m.first_open_at + interval '30 days') as active_days_30
    from members m
    join opens o using (install_id)
    group by m.install_id, m.variant, m.user_id, m.first_open_at
  ),
  paywall as (
    select
      p.install_id,
      exists (select 1 from events e where e.install_id = p.install_id and e.user_id = p.user_id and e.name = 'paywall_view') as viewed,
      (
        select min(t) from (
          select e.client_ts as t from events e where e.install_id = p.install_id and e.user_id = p.user_id and e.name = 'trial_start'
          union all
          select pe.event_ts from purchase_events pe
          where pe.user_id = p.user_id and pe.type = 'INITIAL_PURCHASE' and pe.period_type = 'TRIAL'
        ) s
      ) as trial_at
    from per_install p
  ),
  converted as (
    select
      pw.install_id,
      pw.trial_at,
      exists (
        select 1 from purchase_events pe
        join per_install p on p.user_id = pe.user_id
        where p.install_id = pw.install_id
          and pe.event_ts > pw.trial_at
          and (pe.type = 'RENEWAL' or (pe.type in ('INITIAL_PURCHASE', 'PRODUCT_CHANGE') and pe.period_type = 'NORMAL'))
      ) or exists (
        select 1 from events e join per_install p on p.install_id = e.install_id and p.user_id = e.user_id
        where e.install_id = pw.install_id and e.name = 'purchase' and e.client_ts > pw.trial_at
      ) as paid
    from paywall pw
    where pw.trial_at is not null
  ),
  by_variant as (
    select
      p.variant,
      count(*) as enrolled,
      count(*) filter (where p.first_open_at <= p_now - interval '1 day') as d1_eligible,
      count(*) filter (where p.first_open_at <= p_now - interval '1 day' and p.last_open >= p.first_open_at + interval '1 day') as d1_hit,
      count(*) filter (where p.first_open_at <= p_now - interval '7 days') as d7_eligible,
      count(*) filter (where p.first_open_at <= p_now - interval '7 days' and p.last_open >= p.first_open_at + interval '7 days') as d7_hit,
      count(*) filter (where p.first_open_at <= p_now - interval '30 days') as d30_eligible,
      count(*) filter (where p.first_open_at <= p_now - interval '30 days' and p.last_open >= p.first_open_at + interval '30 days') as d30_hit,
      percentile_cont(0.5) within group (order by extract(epoch from (p.last_open - p.first_open_at)) / 86400) as median_span_days,
      avg(p.active_days_30) filter (where p.first_open_at <= p_now - interval '30 days') as mean_active_days_30,
      count(*) filter (where pw.viewed) as viewers,
      count(*) filter (where pw.viewed and pw.trial_at is not null) as trials,
      count(*) filter (where c.trial_at <= p_now - interval '8 days') as trials_settled,
      count(*) filter (where c.trial_at <= p_now - interval '8 days' and c.paid) as paid
    from per_install p
    join paywall pw using (install_id)
    left join converted c using (install_id)
    group by p.variant
  )
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'variant', v.variant,
      'enrolled', v.enrolled,
      'd1', jsonb_build_object('eligible', v.d1_eligible, 'hit', v.d1_hit),
      'd7', jsonb_build_object('eligible', v.d7_eligible, 'hit', v.d7_hit),
      'd30', jsonb_build_object('eligible', v.d30_eligible, 'hit', v.d30_hit),
      'medianSpanDays', round(v.median_span_days::numeric, 2),
      'meanActiveDays30', round(v.mean_active_days_30::numeric, 2)
    ) || case when p_key = 'paywall' then jsonb_build_object(
      'trial', jsonb_build_object('eligible', v.viewers, 'hit', v.trials),
      'paid', jsonb_build_object('eligible', v.trials_settled, 'hit', v.paid)
    ) else '{}'::jsonb end
    order by v.variant
  ), '[]'::jsonb)
  into result
  from by_variant v;

  return result;
end;
$$;

-- Ends a test: new installs get the winner from now on; existing installs keep their group.
create function public.stop_experiment(p_key text, p_winner text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'admins only' using errcode = '42501';
  end if;
  if not exists (select 1 from experiments e, jsonb_array_elements(e.variants) v where e.key = p_key and v ->> 'id' = p_winner) then
    raise exception 'unknown variant % for %', p_winner, p_key using errcode = '22023';
  end if;
  update experiments set status = 'stopped', winner = p_winner, updated_at = now() where key = p_key;
end;
$$;

revoke execute on function public.experiment_results(text, timestamptz) from public, anon;
revoke execute on function public.stop_experiment(text, text) from public, anon;
grant execute on function public.experiment_results(text, timestamptz) to authenticated;
grant execute on function public.stop_experiment(text, text) to authenticated;
grant execute on function public.is_admin() to authenticated;
