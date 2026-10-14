# Backend setup

Esoterica runs on its own without a server: readings, the calculator and the calendar work offline, and Jung can use a personal API key. The hosted pieces need two accounts.

- **Supabase:**
  - anonymous accounts;
  - the A/B tests and usage events;
  - Jung's hosted chat (the `claude` function), which holds the Anthropic key on the server;
  - subscription state from RevenueCat.
- **RevenueCat:** subscriptions on the App Store, Google Play and the web (Stripe).

Steps that need you are marked **You**.

## 1. Supabase project

1. **You:** create a project at [supabase.com](https://supabase.com).
2. **You:** turn on anonymous sign-ins in Authentication → Sign In / Providers → **Allow anonymous sign-ins**.
   - Every install signs in anonymously at first launch, so no account is asked for before purchase, as Apple requires.
   - Optional: turn on CAPTCHA protection for anonymous sign-ins.
3. Link the repo and apply the database:

   ```bash
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push            # applies supabase/migrations/*
   ```

4. Set the server secrets:

   ```bash
   npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
   npx supabase secrets set REVENUECAT_WEBHOOK_AUTH="Bearer $(openssl rand -hex 24)"
   npx supabase secrets set REVENUECAT_SECRET_KEY=sk_...   # optional; see step 2.6
   ```

5. Deploy the functions. `supabase/config.toml` turns off the session check for the webhook, which uses its own secret.

   ```bash
   npx supabase functions deploy claude
   npx supabase functions deploy revenuecat-webhook
   ```

6. Give the app the project's public values. In `.env.local` for development:

   ```bash
   EXPO_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```

   For builds, add the same values in EAS:

   ```bash
   bunx eas-cli env:create --name EXPO_PUBLIC_SUPABASE_URL --value ...
   ```

   These two values are public. Row-level security protects the data.

### What the server enforces

- **Models:** free people chat with Claude Haiku 5.5; Premium gets Claude Sonnet 5.5 with Anthropic's server-side refusal fallback. To change models, edit `supabase/functions/_shared/claudeProxy.ts`.
- **Daily limits:** free people get 3 Jung messages a day, reset at their local midnight. Memory and dream analysis are Premium only. Premium has a 300-a-day safety cap.
- **Privacy:** message text passes through and is never stored. The `usage` table keeps only token counts per person, day and model, for cost tracking.

## 2. RevenueCat

1. **You:** create a RevenueCat project and add three apps:
   - App Store (bundle id from `app.json`);
   - Google Play;
   - Web Billing, connected to Stripe.
2. **You:** create the products in each store:

   | Plan | Product id | Price | Trial |
   |---|---|---|---|
   | Yearly | `esoterica_yearly_11111` | $111.11 | 7-day free trial (introductory offer) |
   | Monthly | `esoterica_monthly_3333` | $33.33 | — |
   | Weekly | `esoterica_weekly_1111` | $11.11 | — |

   **Apple price points:** the App Store uses a fixed price ladder in USD. Prices end in .99, .00, .90 or .95, with $0.50 steps up to $50 and $1 steps up to $200. That means $11.11, $33.33 and $111.11 can't be entered there.
   - Choose the nearest App Store prices, for example $10.99 / $32.99 / $110.99, or $11.00 / $33.00 / $111.00 if round endings are offered for your subscription.
   - Google Play and Stripe accept any price.
   - The paywall always shows the store's own localized price, so nothing in the app needs to change.
3. **You:** create an entitlement `premium` that includes all three products, and an offering `default` with the packages `$rc_annual`, `$rc_monthly` and `$rc_weekly`.
4. **You:** add a webhook in Integrations → Webhooks:
   - URL: `https://<ref>.supabase.co/functions/v1/revenuecat-webhook`
   - Authorization header: the same value you set as `REVENUECAT_WEBHOOK_AUTH`.
5. Add the public SDK keys to `.env.local` and EAS:

   ```bash
   EXPO_PUBLIC_REVENUECAT_APPLE_KEY=appl_...
   EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY=goog_...
   EXPO_PUBLIC_REVENUECAT_WEB_KEY=rcb_...
   ```

6. Optional: `REVENUECAT_SECRET_KEY` (a secret API key) lets the webhook re-read a subscriber after a purchase moves between accounts (a `TRANSFER` event).

The app logs in to RevenueCat with the Supabase user id, so webhook events land on the right person. Purchases on iOS and Android need an EAS development build, since Expo Go can't make real purchases: `bunx eas-cli build --profile development`.

## 3. Make yourself an admin

The experiment results screen (Settings → Experiment results) shows only for admins.

1. Open the app once, so your install signs in.
2. Copy your user id from Settings → About.
3. In the Supabase SQL editor run:

   ```sql
   insert into public.admins (user_id) values ('<your user id>');
   ```

How to read the results and roll out a winner is in `docs/EXPERIMENTS.md`.

## 4. Privacy answers

These are for App Store Connect → App Privacy and the Google Play Data safety form:

- **Collected:** Usage Data (product interaction) and Identifiers (a user ID, which is a random anonymous account id).
  - Both are **linked to the user**, **not used for tracking** and **not shared with third parties** for advertising. No App Tracking Transparency prompt is needed.
- **Purchases:** handled by Apple, Google or Stripe through RevenueCat.
- **Chat messages:** sent to Anthropic to generate replies and not stored by Esoterica. Answer according to Anthropic's data handling for API traffic.
- **Not collected:** name, email (unless the person later links an account), birth data (stays on the device), contacts or location.

## 5. Checking the database logic locally

```bash
PGHOST=/var/run/postgresql PGUSER=postgres supabase/tests/results/run.sh
```

This builds a scratch database from the migrations and checks:

- the results numbers against seeded installs;
- the access rules;
- the daily allowance and the subscription updates.

The function rules are covered by the Jest suite (`supabase/functions/_shared/__tests__`). Typecheck the functions with `deno check supabase/functions/*/index.ts`.
