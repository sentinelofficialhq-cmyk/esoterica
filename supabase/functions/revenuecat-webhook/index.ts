// RevenueCat → Supabase: keeps `entitlements` current and logs purchase events for the paywall test.
//
// In RevenueCat → Integrations → Webhooks, set the URL to …/functions/v1/revenuecat-webhook and the
// Authorization header to the same value as the REVENUECAT_WEBHOOK_AUTH secret. Deployed without
// Supabase JWT checks (see supabase/config.toml); the shared secret is the check.

import { createClient } from 'npm:@supabase/supabase-js@2';

import { entitlementFromSubscriber, type EntitlementRow, type RevenueCatEvent, rowsFor, sameSecret, type SubscriberResponse, userIdOf } from '../_shared/revenuecat.ts';

const WEBHOOK_AUTH = Deno.env.get('REVENUECAT_WEBHOOK_AUTH') ?? '';
/** Optional: a RevenueCat secret API key, used to look up the new owner after a TRANSFER. */
const REVENUECAT_KEY = Deno.env.get('REVENUECAT_SECRET_KEY') ?? '';
const admin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', {
  auth: { persistSession: false, autoRefreshToken: false },
});

const json = (status: number, body: unknown) => Response.json(body, { status });

async function apply(row: EntitlementRow, eventTs: string) {
  const { error } = await admin.rpc('apply_entitlement', {
    p_user: row.user_id,
    p_active: row.active,
    p_product: row.product_id,
    p_period: row.period_type,
    p_expires: row.expires_at,
    p_store: row.store,
    p_event_ts: eventTs,
  });
  if (error) throw error;
}

async function syncFromRevenueCat(userId: string, eventTs: string) {
  if (!REVENUECAT_KEY) return;
  const res = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
    headers: { authorization: `Bearer ${REVENUECAT_KEY}` },
  });
  if (!res.ok) throw new Error(`RevenueCat lookup failed: ${res.status}`);
  await apply(entitlementFromSubscriber((await res.json()) as SubscriberResponse, userId, new Date()), eventTs);
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'POST only' });
  if (!sameSecret(req.headers.get('authorization'), WEBHOOK_AUTH)) return json(401, { error: 'unauthorized' });

  let event: RevenueCatEvent;
  try {
    event = ((await req.json()) as { event: RevenueCatEvent }).event;
  } catch {
    return json(400, { error: 'expected JSON' });
  }
  if (!event?.id || !event.type || typeof event.event_timestamp_ms !== 'number') return json(400, { error: 'not a RevenueCat event' });
  const eventTs = new Date(event.event_timestamp_ms).toISOString();

  try {
    if (event.type === 'TRANSFER') {
      // The purchase moved between accounts: the old owners lose it, the new owner's state is re-read.
      for (const from of event.transferred_from ?? []) {
        const id = userIdOf({ app_user_id: from });
        if (id) await apply({ user_id: id, active: false, product_id: null, period_type: null, expires_at: null, store: null, updated_at: '' }, eventTs);
      }
      for (const to of event.transferred_to ?? []) {
        const id = userIdOf({ app_user_id: to });
        if (id) await syncFromRevenueCat(id, eventTs);
      }
      return json(200, { ok: true });
    }

    const { entitlement, purchase } = rowsFor(event, new Date());
    if (purchase) {
      const { error } = await admin.from('purchase_events').upsert(purchase, { onConflict: 'id', ignoreDuplicates: true });
      if (error) throw error;
    }
    if (entitlement) await apply(entitlement, eventTs);
    return json(200, { ok: true });
  } catch (err) {
    // A non-2xx makes RevenueCat retry later.
    console.error('revenuecat-webhook', event.type, event.id, err instanceof Error ? err.message : err);
    return json(500, { error: 'could not apply event' });
  }
});
