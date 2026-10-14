-- Daily allowances for the claude function, and token counts per model.
-- Only the server (service role) calls these; people can read their own counts.

create table public.quota (
  user_id uuid not null references auth.users (id) on delete cascade,
  -- The person's local date, as sent by the app (within a day of UTC).
  day date not null,
  kind text not null check (kind in ('chat', 'extract')),
  used integer not null default 0 check (used >= 0),
  primary key (user_id, day, kind)
);
alter table public.quota enable row level security;
create policy "see own quota" on public.quota for select to authenticated using (user_id = auth.uid());

/*
  Takes one unit of a person's allowance. Returns how many they have used including this one, or
  null when they were already at the limit (nothing is taken then). Safe under concurrent requests:
  the row is locked by the upsert.
*/
create function public.claim_quota(p_user uuid, p_day date, p_kind text, p_limit integer) returns integer
language plpgsql security definer set search_path = public as $$
declare
  n integer;
begin
  insert into quota (user_id, day, kind, used) values (p_user, p_day, p_kind, 1)
  on conflict (user_id, day, kind) do update set used = quota.used + 1
  returning used into n;
  if n > p_limit then
    update quota set used = used - 1 where user_id = p_user and day = p_day and kind = p_kind;
    return null;
  end if;
  return n;
end;
$$;

/** Gives a unit back when the upstream request failed. */
create function public.release_quota(p_user uuid, p_day date, p_kind text) returns void
language sql security definer set search_path = public as $$
  update quota set used = greatest(used - 1, 0) where user_id = p_user and day = p_day and kind = p_kind;
$$;

create function public.record_usage(p_user uuid, p_day date, p_model text, p_input bigint, p_output bigint, p_cache_read bigint default 0, p_cache_write bigint default 0) returns void
language sql security definer set search_path = public as $$
  insert into usage (user_id, day, model, requests, input_tokens, output_tokens, cache_read_tokens, cache_write_tokens)
  values (p_user, p_day, p_model, 1, p_input, p_output, p_cache_read, p_cache_write)
  on conflict (user_id, day, model) do update set
    requests = usage.requests + 1,
    input_tokens = usage.input_tokens + excluded.input_tokens,
    output_tokens = usage.output_tokens + excluded.output_tokens,
    cache_read_tokens = usage.cache_read_tokens + excluded.cache_read_tokens,
    cache_write_tokens = usage.cache_write_tokens + excluded.cache_write_tokens;
$$;

revoke execute on function public.claim_quota(uuid, date, text, integer) from public, anon, authenticated;
revoke execute on function public.release_quota(uuid, date, text) from public, anon, authenticated;
revoke execute on function public.record_usage(uuid, date, text, bigint, bigint, bigint, bigint) from public, anon, authenticated;
grant execute on function public.claim_quota(uuid, date, text, integer) to service_role;
grant execute on function public.release_quota(uuid, date, text) to service_role;
grant execute on function public.record_usage(uuid, date, text, bigint, bigint, bigint, bigint) to service_role;

-- Whether a person has Premium now, for the claude function.
create function public.has_premium(p_user uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from entitlements
    where user_id = p_user and active and (expires_at is null or expires_at > now())
  );
$$;
revoke execute on function public.has_premium(uuid) from public, anon, authenticated;
grant execute on function public.has_premium(uuid) to service_role;

-- Applies a subscription state from the RevenueCat webhook unless a newer event was already applied
-- (webhooks can arrive out of order or be redelivered).
create function public.apply_entitlement(
  p_user uuid, p_active boolean, p_product text, p_period text, p_expires timestamptz, p_store text, p_event_ts timestamptz
) returns boolean
language plpgsql security definer set search_path = public as $$
declare
  applied boolean;
begin
  insert into entitlements as e (user_id, active, product_id, period_type, expires_at, store, last_event_ts, updated_at)
  values (p_user, p_active, p_product, p_period, p_expires, p_store, p_event_ts, now())
  on conflict (user_id) do update set
    active = excluded.active,
    product_id = excluded.product_id,
    period_type = excluded.period_type,
    expires_at = excluded.expires_at,
    store = excluded.store,
    last_event_ts = excluded.last_event_ts,
    updated_at = now()
  where e.last_event_ts is null or excluded.last_event_ts >= e.last_event_ts
  returning true into applied;
  return coalesce(applied, false);
end;
$$;
revoke execute on function public.apply_entitlement(uuid, boolean, text, text, timestamptz, text, timestamptz) from public, anon, authenticated;
grant execute on function public.apply_entitlement(uuid, boolean, text, text, timestamptz, text, timestamptz) to service_role;
