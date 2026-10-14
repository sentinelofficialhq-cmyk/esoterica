\set ON_ERROR_STOP on
create or replace function pg_temp.as_user(n int) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', md5('u' || n)::uuid::text, false);
  execute 'set role authenticated';
end $$;
create or replace function pg_temp.eq(label text, got jsonb, want jsonb) returns void language plpgsql as $$
begin
  if got is distinct from want then raise exception '% mismatch: got % want %', label, got, want; end if;
  raise notice 'ok: %', label;
end $$;

-- Admin results
select pg_temp.as_user(1);
select pg_temp.eq('theme results', public.experiment_results('theme', '2026-12-01 09:00Z'), '[
 {"variant":"brass","enrolled":50,"d1":{"eligible":50,"hit":50},"d7":{"eligible":0,"hit":0},"d30":{"eligible":0,"hit":0},"medianSpanDays":2.04,"meanActiveDays30":null},
 {"variant":"daylight","enrolled":200,"d1":{"eligible":200,"hit":160},"d7":{"eligible":200,"hit":140},"d30":{"eligible":200,"hit":140},"medianSpanDays":35.04,"meanActiveDays30":1.80},
 {"variant":"ember","enrolled":200,"d1":{"eligible":200,"hit":160},"d7":{"eligible":200,"hit":160},"d30":{"eligible":200,"hit":100},"medianSpanDays":21.54,"meanActiveDays30":2.30}
]'::jsonb);
select pg_temp.eq('paywall results', (select jsonb_agg(jsonb_build_object('v', r->>'variant', 'n', r->'enrolled', 'd1', r->'d1', 'd7', r->'d7', 'd30', r->'d30', 'trial', r->'trial', 'paid', r->'paid') order by r->>'variant')
  from jsonb_array_elements(public.experiment_results('paywall', '2026-12-01 09:00Z')) r), '[
 {"v":"jung","n":200,"d1":{"eligible":200,"hit":160},"d7":{"eligible":200,"hit":150},"d30":{"eligible":200,"hit":120},"trial":{"eligible":200,"hit":40},"paid":{"eligible":40,"hit":10}},
 {"v":"locked","n":50,"d1":{"eligible":50,"hit":50},"d7":{"eligible":0,"hit":0},"d30":{"eligible":0,"hit":0},"trial":{"eligible":50,"hit":5},"paid":{"eligible":0,"hit":0}},
 {"v":"timeline","n":200,"d1":{"eligible":200,"hit":160},"d7":{"eligible":200,"hit":150},"d30":{"eligible":200,"hit":120},"trial":{"eligible":200,"hit":60},"paid":{"eligible":60,"hit":30}}
]'::jsonb);
reset role;

-- A regular user
select pg_temp.as_user(2);
do $$ begin
  begin
    perform public.experiment_results('theme');
    raise exception 'non-admin read results';
  exception when insufficient_privilege then raise notice 'ok: results are admin-only';
  end;
  begin
    perform public.stop_experiment('theme', 'daylight');
    raise exception 'non-admin stopped a test';
  exception when insufficient_privilege then raise notice 'ok: stopping is admin-only';
  end;
  if (select count(*) from public.events) <> 0 then raise exception 'user can read events'; end if;
  raise notice 'ok: events are write-only for users';
  if (select count(*) from public.installs) <> 1 then raise exception 'user sees other installs'; end if;
  raise notice 'ok: users see only their own install';
  if (select count(*) from public.experiments) <> 2 then raise exception 'cannot read experiment settings'; end if;
  insert into public.events (id, install_id, name, client_ts, app_version, platform) values (gen_random_uuid(), 'i2', 'app_open', now(), '1', 'ios');
  raise notice 'ok: user adds own event (user_id defaults to auth.uid())';
  begin
    insert into public.events (id, install_id, user_id, name, client_ts, app_version, platform) values (gen_random_uuid(), 'i3', md5('u3')::uuid, 'app_open', now(), '1', 'ios');
    raise exception 'user wrote an event as someone else';
  exception when insufficient_privilege then raise notice 'ok: cannot write as someone else';
  end;
  -- Opens posted under someone else's install id must not count for that install.
  insert into public.events (id, install_id, name, client_ts, app_version, platform) values (gen_random_uuid(), 'i161', 'app_open', '2026-11-30 09:00Z', '1', 'ios');
  begin
    update public.installs set enrolled = false where install_id = 'i2';
    raise exception 'user changed own enrollment';
  exception when insufficient_privilege then raise notice 'ok: enrollment is fixed';
  end;
  update public.installs set app_version = '1.0.1' where install_id = 'i2';
  begin
    update public.assignments set variant = 'daylight' where install_id = 'i2';
    raise exception 'user changed an assignment';
  exception when insufficient_privilege then raise notice 'ok: assignments are fixed';
  end;
  begin
    insert into public.assignments (install_id, experiment, variant, assigned_at) values ('i3', 'theme', 'ember', now());
    raise exception 'user assigned someone else''s install';
  exception when insufficient_privilege then raise notice 'ok: cannot assign another install';
  end;
  begin
    insert into public.events (id, install_id, name, props, client_ts, app_version, platform) values (gen_random_uuid(), 'i2', 'app_open', jsonb_build_object('x', repeat('a', 3000)), now(), '1', 'ios');
    raise exception 'oversized props accepted';
  exception when check_violation then raise notice 'ok: props are size-capped';
  end;
end $$;
reset role;

-- Anonymous visitors can read experiment settings only
set role anon;
do $$ begin
  if (select count(*) from public.experiments) <> 2 then raise exception 'anon cannot read settings'; end if;
  raise notice 'ok: anon reads experiment settings';
end $$;
reset role;

-- The spoofed open for i161 (an ember install that never returned) must not change ember's numbers.
select pg_temp.as_user(1);
select pg_temp.eq('spoofed opens ignored', (select r->'d30' from jsonb_array_elements(public.experiment_results('theme', '2026-12-01 09:00Z')) r where r->>'variant' = 'ember'), '{"eligible":200,"hit":100}');
reset role;

-- Rolling out a winner
select pg_temp.as_user(1);
select public.stop_experiment('theme', 'daylight');
do $$ begin
  begin
    perform public.stop_experiment('theme', 'nope');
    raise exception 'unknown winner accepted';
  exception when invalid_parameter_value then raise notice 'ok: winner must be a variant';
  end;
end $$;
reset role;
select pg_temp.eq('stopped', (select jsonb_build_object('status', status, 'winner', winner) from public.experiments where key = 'theme'), '{"status":"stopped","winner":"daylight"}');

-- Daily allowance: three free messages, the fourth refused, a refund gives one back.
set role service_role;
do $$
declare u uuid := md5('u5')::uuid; got integer;
begin
  for i in 1..3 loop
    got := public.claim_quota(u, '2026-10-14', 'chat', 3);
    if got <> i then raise exception 'claim % returned %', i, got; end if;
  end loop;
  if public.claim_quota(u, '2026-10-14', 'chat', 3) is not null then raise exception 'fourth free message allowed'; end if;
  if (select used from public.quota where user_id = u and kind = 'chat') <> 3 then raise exception 'refused claim was counted'; end if;
  perform public.release_quota(u, '2026-10-14', 'chat');
  if public.claim_quota(u, '2026-10-14', 'chat', 3) <> 3 then raise exception 'refund not returned'; end if;
  if public.claim_quota(u, '2026-10-15', 'chat', 3) <> 1 then raise exception 'new day did not reset'; end if;
  perform public.record_usage(u, '2026-10-14', 'claude-haiku-5-5', 1200, 300);
  perform public.record_usage(u, '2026-10-14', 'claude-haiku-5-5', 800, 200);
  perform public.record_usage(u, '2026-10-14', 'claude-sonnet-5-5', 100, 50, 900, 20);
  if (select row(requests, input_tokens, output_tokens)::text from public.usage where user_id = u and model = 'claude-haiku-5-5') <> '(2,2000,500)' then raise exception 'usage not summed'; end if;
  if (select row(cache_read_tokens, cache_write_tokens)::text from public.usage where user_id = u and model = 'claude-sonnet-5-5') <> '(900,20)' then raise exception 'cache tokens not kept'; end if;
  if not public.apply_entitlement(u, true, 'esoterica_yearly_11111', 'TRIAL', now() + interval '7 days', 'APP_STORE', '2026-10-14 10:00Z') then raise exception 'first event not applied'; end if;
  if not public.has_premium(u) then raise exception 'active entitlement not premium'; end if;
  if public.apply_entitlement(u, false, 'esoterica_yearly_11111', 'TRIAL', now() - interval '1 day', 'APP_STORE', '2026-10-14 09:00Z') then raise exception 'older event applied'; end if;
  if not public.has_premium(u) then raise exception 'late redelivery undid premium'; end if;
  update public.entitlements set expires_at = now() - interval '1 minute' where user_id = u;
  if public.has_premium(u) then raise exception 'expired entitlement still premium'; end if;
  raise notice 'ok: daily allowance, refunds, usage and premium checks';
end $$;
reset role;
select pg_temp.as_user(5);
do $$ begin
  begin
    perform public.claim_quota(md5('u5')::uuid, '2026-10-16', 'chat', 1000);
    raise exception 'user claimed own quota directly';
  exception when insufficient_privilege then raise notice 'ok: only the server can spend allowances';
  end;
end $$;
reset role;
