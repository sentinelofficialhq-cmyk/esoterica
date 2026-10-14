# Experiments

Esoterica runs two A/B tests on new installs and records anonymous usage to see which version keeps people longest.

| Test | Variants | Main question |
|---|---|---|
| `theme` | `ember`, `gilded`, `nebula` (the original looks), `emberQuiet`, `brass`, `daylight` (the new looks) | Which look keeps people opening the app? |
| `paywall` | `timeline`, `locked`, `jung` | Which paywall turns the most viewers into trials, and trials into subscribers? |

## How people are assigned

Code: `src/experiments/`.

- **At first launch**, the app creates a random install id. It assigns one variant per test with a weighted hash of `installId:testKey` (`pickVariant` in `assign.ts`):
  - The same install always gets the same variant.
  - The two tests are independent of each other. A test checks a 6 × 3 grid over 72,000 simulated installs.
- **The look is assigned before the welcome screen**, so onboarding already shows it. The root layout waits for enrollment (`useLaunchTracking` in `src/analytics/launch.ts`) before rendering.
- **Assignments never change.** People can still pick another look in Settings. That logs a `theme_change` event, but results stay grouped by the look first assigned (intention-to-treat). This keeps the comparison fair: switching is part of how a look performs.
- **Installs set up before the tests existed are left out.** They keep their look, get `enrolled: false`, and never appear in results.
- **Server settings change assignment for new installs only.** The `experiments` table holds the weights, and whether a test is running or stopped with a winner. The app caches this table and falls back to the built-in settings in `src/experiments/config.ts` when offline. A stopped test gives every new install its winner. Existing installs keep what they had.

## What is recorded

Code: `src/analytics/`.

- **Events.** Each event's allowed fields are listed in `src/analytics/events.ts`:
  - `app_open`: at launch, and when someone comes back after 30 minutes or more away.
  - `experiment_assigned`, `onboarding_step`, `onboarding_complete`.
  - `paywall_view`, `paywall_dismiss`, `trial_start`, `purchase`, `restore`.
  - `theme_change`, `chat_message_sent` (a count only), `free_limit_reached`, `feature_open`, `quiz_complete`, `reading_view`, `notification_optin`.
- **Attached to every event:** the install id, the install's test groups, the app version and the platform. The server adds the anonymous user id.
- **Never recorded:** names, birth dates, chat messages, dreams, journal entries, or any reading text.
- **Offline:** events wait in a local queue (newest 500 kept) and are sent in batches of 50. A failed send keeps them for next time.
- **Opt-out:** Settings → "Help improve Esoterica" turns recording off and deletes anything not yet sent.
  - It is on by default. That is generally acceptable for anonymous, first-party product analytics in the US.
  - The EU and UK may require asking first (ePrivacy rules on device storage). Before launching there, consider showing the switch during onboarding, defaulting to off for those regions.

## How results are measured

Code: the `experiment_results` function in `supabase/migrations/`, and `src/experiments/stats.ts`.

For each variant, counting only enrolled installs:

- **Still opening after 1, 7 and 30 days:** the share of installs that opened the app at least N days after their first open.
  - Only installs at least N days old count, so new installs don't drag the numbers down.
  - This is "rolling" retention: someone who came back on day 9 counts for day 7.
- **Median span:** median days between an install's first and last open.
- **Active days in the first 30:** the mean number of distinct days with an open. Only installs at least 30 days old count.
- **Paywall test only:**
  - **Trial rate:** the share of installs that saw a paywall and then started a trial.
  - **Paid rate:** the share of trials started at least 8 days ago that became paid (the 7-day trial plus a day for billing).
  - Trials and renewals come from RevenueCat's webhook on the server, plus the app's own `trial_start` and `purchase` events as a fallback.
- **Only an install's own user counts.** Events sent by another account under someone else's install id are ignored.

Every percentage comes with a **95% range** (Wilson score interval). The results screen calls a **leader** on a measure only when:

1. every variant has at least 100 eligible installs for that measure, and
2. the best variant's range sits entirely above every other variant's range.

Until both hold it says **Too early to call**, or **No clear leader** if the ranges still overlap. Non-overlapping ranges are a strict bar: a real difference takes more data to confirm, but a "leader" is rarely a fluke.

### How many installs you need

These are approximate. They aim for an 80% chance of detecting a real difference under the rule above.

| Measure | Difference to detect | Installs per variant | Total |
|---|---|---|---|
| 7-day retention, theme (6 looks) | 30% vs 35% | ~2,300 | ~14,000 |
| 7-day retention, theme (6 looks) | 30% vs 40% | ~600 | ~3,600 |
| Trial rate, paywall (3 designs) | 10% vs 13% | ~2,900 viewers | ~8,800 |

Big differences show up early. Small ones take a long time with six looks. If the theme test is still "no clear leader" after a few thousand installs, consider stopping the two or three weakest looks and continuing with the rest. Set their weight to 0 in the `experiments` row; installs already assigned keep their look.

## Reading the results and rolling out a winner

- **Where:** the results screen is in the app at Settings → Experiment results. It shows only for admin accounts.
- **Make yourself an admin:** in the Supabase SQL editor run

  ```sql
  insert into public.admins (user_id) values ('<your user id>');
  ```

  Your user id is in Settings → About (tap it to copy). See `docs/BACKEND-SETUP.md`.
- **Roll out a winner:** use **Stop test and roll out** on the results screen, or call it from SQL:

  ```sql
  select public.stop_experiment('theme', 'daylight');
  ```

  New installs then get the winner. Everyone else keeps their look.

## Checking the results logic

`supabase/tests/results/run.sh` builds a scratch database from the migrations, seeds groups of installs with known retention and conversion, and checks:

- `experiment_results` returns exactly the expected numbers;
- admin-only access;
- that users can't read others' data, change assignments or enrollment, or inflate another install's numbers.

It needs a local Postgres 15 or later. The app-side math (Wilson ranges, the leader rule) is covered by `src/experiments/__tests__/stats.test.ts`.
