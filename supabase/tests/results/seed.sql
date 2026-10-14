-- Known cohorts, "now" = 2026-12-01. Expected values are in checks.sql.
create function pg_temp.u(n int) returns uuid language sql as $$ select md5('u' || n)::uuid $$;
insert into auth.users select pg_temp.u(n) from generate_series(1, 451) n;

-- ember: 200 installs 40 days old. 1-100 open on days 0,1,2,35; 101-160 on days 0,8; 161-200 only day 0.
-- daylight: 200 installs 40 days old. 201-340 open on days 0,5,35; 341-360 on 0,3; 361-400 only day 0.
-- brass: 50 installs 3 days old, 401-450, open on days 0 and 2.
-- 451: an install from before the tests (not enrolled), opening daily; must not count.
insert into public.installs (install_id, user_id, enrolled, first_open_at, platform, app_version)
select 'i' || n, pg_temp.u(n), n <= 450,
  case when n <= 400 or n = 451 then timestamptz '2026-10-22 09:00Z' else timestamptz '2026-11-28 09:00Z' end,
  'ios', '1.0.0'
from generate_series(1, 451) n;

insert into public.assignments (install_id, experiment, variant, assigned_at, user_id)
select 'i' || n, 'theme', case when n <= 200 then 'ember' when n <= 400 then 'daylight' else 'brass' end, now(), pg_temp.u(n)
from generate_series(1, 450) n;
-- paywall: odd installs 1-400 'timeline', even 'jung'; 401-450 'locked'.
insert into public.assignments (install_id, experiment, variant, assigned_at, user_id)
select 'i' || n, 'paywall', case when n > 400 then 'locked' when n % 2 = 1 then 'timeline' else 'jung' end, now(), pg_temp.u(n)
from generate_series(1, 450) n;
-- The non-enrolled install still gets a stray assignment row; enrolled = false must exclude it.
insert into public.assignments (install_id, experiment, variant, assigned_at, user_id) values ('i451', 'theme', 'ember', now(), pg_temp.u(451));

create function pg_temp.open(n int, day int) returns void language sql as $$
  insert into public.events (id, install_id, user_id, name, client_ts, app_version, platform)
  select gen_random_uuid(), 'i' || n, pg_temp.u(n), 'app_open', i.first_open_at + make_interval(days => day, hours => 1), '1.0.0', 'ios'
  from public.installs i where i.install_id = 'i' || n
$$;
select pg_temp.open(n, d) from generate_series(1, 100) n, unnest(array[0, 1, 2, 35]) d;
select pg_temp.open(n, d) from generate_series(101, 160) n, unnest(array[0, 8]) d;
select pg_temp.open(n, 0) from generate_series(161, 200) n;
select pg_temp.open(n, d) from generate_series(201, 340) n, unnest(array[0, 5, 35]) d;
select pg_temp.open(n, d) from generate_series(341, 360) n, unnest(array[0, 3]) d;
select pg_temp.open(n, 0) from generate_series(361, 400) n;
select pg_temp.open(n, d) from generate_series(401, 450) n, unnest(array[0, 2]) d;
select pg_temp.open(451, d) from generate_series(0, 39) d;
-- A clock-skewed open before the first open counts as day 0, not as a negative day.
insert into public.events (id, install_id, user_id, name, client_ts, app_version, platform)
values (gen_random_uuid(), 'i161', pg_temp.u(161), 'app_open', '2026-10-21 09:00Z', '1.0.0', 'ios');

-- Paywall: every install 1-400 saw it on day 0; 401-450 too.
insert into public.events (id, install_id, user_id, name, props, client_ts, app_version, platform)
select gen_random_uuid(), 'i' || n, pg_temp.u(n), 'paywall_view', '{"placement":"onboarding","variant":"x"}', i.first_open_at + interval '10 minutes', '1.0.0', 'ios'
from generate_series(1, 450) n join public.installs i on i.install_id = 'i' || n;
-- timeline (odd 1-400): installs 1..119 odd (60 installs) start a trial, from RevenueCat; the first 30 of those (1..59 odd) renew.
insert into public.purchase_events (id, user_id, type, product_id, period_type, event_ts)
select 'rc-t' || n, pg_temp.u(n), 'INITIAL_PURCHASE', 'esoterica_yearly_11111', 'TRIAL', timestamptz '2026-10-22 09:20Z'
from generate_series(1, 119, 2) n;
insert into public.purchase_events (id, user_id, type, product_id, period_type, event_ts)
select 'rc-r' || n, pg_temp.u(n), 'RENEWAL', 'esoterica_yearly_11111', 'NORMAL', timestamptz '2026-10-29 09:20Z'
from generate_series(1, 59, 2) n;
-- jung (even 1-400): installs 2..80 even (40) start a trial by client event; 2..20 even (10) report a purchase.
insert into public.events (id, install_id, user_id, name, props, client_ts, app_version, platform)
select gen_random_uuid(), 'i' || n, pg_temp.u(n), 'trial_start', '{"product":"esoterica_yearly_11111","variant":"jung"}', '2026-10-22 09:20Z', '1.0.0', 'ios'
from generate_series(2, 80, 2) n;
insert into public.events (id, install_id, user_id, name, props, client_ts, app_version, platform)
select gen_random_uuid(), 'i' || n, pg_temp.u(n), 'purchase', '{"product":"esoterica_yearly_11111","variant":"jung"}', '2026-10-29 09:20Z', '1.0.0', 'ios'
from generate_series(2, 20, 2) n;
-- locked (401-450): 5 trials 2 days ago, not settled yet.
insert into public.purchase_events (id, user_id, type, product_id, period_type, event_ts)
select 'rc-l' || n, pg_temp.u(n), 'INITIAL_PURCHASE', 'esoterica_yearly_11111', 'TRIAL', timestamptz '2026-11-29 09:00Z'
from generate_series(401, 405) n;

insert into public.admins (user_id) values (pg_temp.u(1));
