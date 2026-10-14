import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, StyleSheet, Switch, View } from 'react-native';

import { useTheme } from '@/ui/ThemeProvider';
import { describeAIError, getProvider } from '@/ai/client';
import { costUSD, DEFAULT_MODEL, GEMINI_MODELS, modelInfo, MODELS } from '@/ai/models';
import { CRISIS_RESOURCES } from '@/ai/safety';
import { formatDate, todayLocal } from '@/lib/date';
import { exportBackup, importBackup } from '@/store/backupActions';
import { useProfileStore } from '@/store/profileStore';
import { resetAllData } from '@/store/reset';
import { getKey, setKey, type KeyProvider } from '@/store/secrets';
import { useSettingsStore, type ChatDepth, type ProviderChoice } from '@/store/settingsStore';
import { AppearancePicker } from '@/ui/AppearancePicker';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Chip } from '@/ui/Chip';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { SectionLabel } from '@/ui/SectionLabel';
import { TextField } from '@/ui/TextField';
import { Txt } from '@/ui/Txt';
import { space } from '@/ui/theme';
import { WheelDatePicker } from '@/ui/WheelDatePicker';

const DEPTHS: { id: ChatDepth; label: string; hint: string }[] = [
  { id: 'quick', label: 'Quick', hint: 'Fast replies, lowest cost' },
  { id: 'balanced', label: 'Balanced', hint: 'More reflection' },
  { id: 'deep', label: 'Deep', hint: 'Most thought, slower and pricier' },
];

const mask = (k: string) => (k.length > 8 ? `${k.slice(0, 7)}…${k.slice(-4)}` : '••••');

const PROVIDER_LABELS: Record<ProviderChoice, string> = { anthropic: 'Claude', gemini: 'Gemini', openai: 'OpenAI', mock: 'Offline demo' };
const KEY_PLACEHOLDERS: Record<KeyProvider, string> = { anthropic: 'sk-ant-…', gemini: 'AIza…', openai: 'sk-…' };

export default function Settings() {
  const { colors } = useTheme();
  const profile = useProfileStore();
  const settings = useSettingsStore();
  const [editBirthday, setEditBirthday] = useState(false);
  const [storedKey, setStoredKey] = useState<string | null>(null);
  const [draftKey, setDraftKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [resetText, setResetText] = useState('');
  const [backupMsg, setBackupMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const keyProvider: KeyProvider | null = settings.provider === 'mock' ? null : settings.provider;

  useEffect(() => {
    if (!keyProvider) return;
    let alive = true;
    getKey(keyProvider).then((k) => alive && setStoredKey(k));
    return () => {
      alive = false;
    };
  }, [keyProvider]);

  const saveKey = async () => {
    if (!keyProvider || !draftKey.trim()) return;
    await setKey(keyProvider, draftKey);
    setStoredKey(draftKey.trim());
    setDraftKey('');
    setTestResult(null);
  };

  const testKey = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const provider = await getProvider(settings);
      const res = await provider.streamReply({
        system: 'You are checking that a connection works.',
        messages: [{ role: 'user', content: 'Reply with one word: ready', text: 'Reply with one word: ready' }],
        effort: 'low',
        onText: () => {},
      });
      settings.addUsage(provider.model, res.usage, todayLocal().slice(0, 7));
      setTestResult({ ok: true, text: `Connected to ${provider.model}. Reply: “${res.assistant.text.trim().slice(0, 40)}”` });
    } catch (err) {
      setTestResult({ ok: false, text: describeAIError(err) });
    } finally {
      setTesting(false);
    }
  };

  const usageRows = Object.entries(settings.usage.byModel);
  const totalCost = usageRows.reduce((sum, [model, u]) => sum + (costUSD(model, u) ?? 0), 0);
  const providers: ProviderChoice[] = __DEV__ ? ['anthropic', 'gemini', 'openai', 'mock'] : ['anthropic', 'gemini', 'openai'];

  return (
    <Screen header={<ScreenHeader title="Settings" />}>
      <SectionLabel>Appearance</SectionLabel>
      <AppearancePicker />

      <SectionLabel>Profile</SectionLabel>
      <Card>
        <TextField label="Name" value={profile.name} onChangeText={(t) => profile.setProfile({ name: t })} />
        <TextField label="Full birth name" value={profile.birthName} onChangeText={(t) => profile.setProfile({ birthName: t })} />
        <Txt variant="label">Birthday</Txt>
        {editBirthday && profile.birthDate ? (
          <>
            <WheelDatePicker value={profile.birthDate} onChange={(d) => profile.setProfile({ birthDate: d })} />
            <Button label="Done" variant="subtle" small onPress={() => setEditBirthday(false)} />
          </>
        ) : (
          <Txt variant="body" onPress={() => setEditBirthday(true)}>
            {profile.birthDate} <Txt variant="small" color={colors.accent}>Change</Txt>
          </Txt>
        )}
        <Txt variant="label">Letterology system</Txt>
        <View style={styles.chips}>
          <Chip label="Pythagorean" selected={profile.letterSystem === 'pythagorean'} onPress={() => profile.setProfile({ letterSystem: 'pythagorean' })} />
          <Chip label="Chaldean" selected={profile.letterSystem === 'chaldean'} onPress={() => profile.setProfile({ letterSystem: 'chaldean' })} />
        </View>
      </Card>

      <SectionLabel>Jung AI</SectionLabel>
      <Card>
        <Txt variant="label">Provider</Txt>
        <View style={styles.chips}>
          {providers.map((p) => (
            <Chip
              key={p}
              label={PROVIDER_LABELS[p]}
              selected={settings.provider === p}
              onPress={() => {
                settings.update({ provider: p });
                setStoredKey(null);
                setTestResult(null);
              }}
            />
          ))}
        </View>

        {keyProvider ? (
          <>
            <Txt variant="label">{`${PROVIDER_LABELS[keyProvider]} API key`}</Txt>
            {storedKey ? (
              <View style={styles.keyRow}>
                <Txt variant="body" style={styles.flex}>
                  {mask(storedKey)}
                </Txt>
                <Txt
                  variant="small"
                  color={colors.danger}
                  onPress={async () => {
                    await setKey(keyProvider, null);
                    setStoredKey(null);
                  }}>
                  Remove
                </Txt>
              </View>
            ) : (
              <>
                <TextField
                  value={draftKey}
                  onChangeText={setDraftKey}
                  placeholder={KEY_PLACEHOLDERS[keyProvider]}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  hint={`${keyProvider === 'gemini' ? 'Create one at aistudio.google.com under Get API key. ' : ''}Stored only on this device. It is never included in backups.`}
                />
                <Button label="Save key" small disabled={!draftKey.trim()} onPress={saveKey} />
              </>
            )}
          </>
        ) : (
          <Txt variant="small">The offline demo replies with canned text so you can try the chat without a key.</Txt>
        )}

        {settings.provider === 'anthropic' ? (
          <>
            <Txt variant="label">Model</Txt>
            {Object.entries(MODELS).map(([id, m]) => (
              <Card key={id} tone={settings.anthropicModel === id ? 'ember' : 'default'} onPress={() => settings.update({ anthropicModel: id })}>
                <Txt variant="body">{m.label}</Txt>
                <Txt variant="small">{`$${m.inPerM} in · $${m.outPerM} out per million tokens`}</Txt>
              </Card>
            ))}
          </>
        ) : null}
        {settings.provider === 'gemini' ? (
          <>
            <Txt variant="label">Model</Txt>
            {Object.entries(GEMINI_MODELS).map(([id, m]) => (
              <Card key={id} tone={settings.geminiModel === id ? 'ember' : 'default'} onPress={() => settings.update({ geminiModel: id })}>
                <Txt variant="body">{m.label}</Txt>
                <Txt variant="small">{`$${m.inPerM} in · $${m.outPerM} out per million tokens (free tier available)`}</Txt>
              </Card>
            ))}
          </>
        ) : null}
        {settings.provider === 'openai' ? (
          <TextField
            label="OpenAI model"
            value={settings.openaiModel}
            onChangeText={(t) => settings.update({ openaiModel: t })}
            placeholder="Model name from your OpenAI account"
            autoCapitalize="none"
          />
        ) : null}

        <Txt variant="label">Depth</Txt>
        <View style={styles.chips}>
          {DEPTHS.map((d) => (
            <Chip key={d.id} label={d.label} selected={settings.chatDepth === d.id} onPress={() => settings.update({ chatDepth: d.id })} />
          ))}
        </View>
        <Txt variant="small">{DEPTHS.find((d) => d.id === settings.chatDepth)?.hint}</Txt>

        <Button label="Test connection" variant="ghost" loading={testing} onPress={testKey} />
        {testResult ? (
          <Txt variant="small" color={testResult.ok ? colors.teal : colors.danger}>
            {testResult.text}
          </Txt>
        ) : null}
      </Card>

      <SectionLabel>Memory</SectionLabel>
      <Card>
        <View style={styles.keyRow}>
          <View style={styles.flex}>
            <Txt variant="body">Jung remembers you</Txt>
            <Txt variant="small">After each conversation, Jung keeps short notes to carry forward.</Txt>
          </View>
          <Switch
            value={settings.memoryEnabled}
            onValueChange={(v) => settings.update({ memoryEnabled: v })}
            trackColor={{ true: colors.accent, false: colors.cardHi }}
            thumbColor={colors.text}
          />
        </View>
        <Button label="What Jung remembers" variant="subtle" small onPress={() => router.push('/memory')} />
      </Card>

      <SectionLabel>{`Usage this month${settings.usage.month ? ` (${settings.usage.month})` : ''}`}</SectionLabel>
      <Card>
        {usageRows.length === 0 ? <Txt variant="small">No AI usage yet this month.</Txt> : null}
        {usageRows.map(([model, u]) => {
          const cost = costUSD(model, u);
          return (
            <View key={model} style={styles.usageRow}>
              <Txt variant="small" color={colors.text} style={styles.flex}>
                {modelInfo(model)?.label.replace(/ \(.*\)$/, '') ?? model}
              </Txt>
              <Txt variant="small">{`${(u.inputTokens + u.cacheReadTokens + u.cacheWriteTokens).toLocaleString()} in · ${u.outputTokens.toLocaleString()} out${cost !== null ? ` · ~$${cost.toFixed(2)}` : ''}`}</Txt>
            </View>
          );
        })}
        {usageRows.length ? <Txt variant="small">{`Estimated total: ~$${totalCost.toFixed(2)}. Your provider’s billing page is the source of truth.`}</Txt> : null}
        <Txt variant="small">{`Default model: ${MODELS[DEFAULT_MODEL].label}.`}</Txt>
      </Card>

      <SectionLabel>Backup & restore</SectionLabel>
      <Card>
        <Txt variant="small">
          Everything in Esoterica lives only on this device. Save a backup file every week or so (on iPhone: Share → Save to Files). Backups
          never include your API keys.
        </Txt>
        <Txt variant="small" color={colors.text}>
          {settings.lastBackupAt ? `Last backup: ${formatDate(settings.lastBackupAt)}` : 'No backup saved yet.'}
        </Txt>
        <Button
          label="Back up now"
          onPress={async () => {
            try {
              if (await exportBackup()) setBackupMsg({ ok: true, text: 'Backup saved.' });
            } catch (e) {
              setBackupMsg({ ok: false, text: (e as Error).message });
            }
          }}
        />
        <Button
          label="Restore from a backup"
          variant="subtle"
          onPress={async () => {
            try {
              if (await importBackup()) setBackupMsg({ ok: true, text: 'Backup restored.' });
            } catch (e) {
              setBackupMsg({ ok: false, text: (e as Error).message });
            }
          }}
        />
        {backupMsg ? (
          <Txt variant="small" color={backupMsg.ok ? colors.teal : colors.danger}>
            {backupMsg.text}
          </Txt>
        ) : null}
      </Card>

      <SectionLabel>About</SectionLabel>
      <Card tone="violet">
        <Txt variant="small" color={colors.text}>
          Esoterica offers reflection, not prediction. Its Jung is an AI inspired by Carl Jung’s writings: not Jung himself, and not a therapist. It
          does not give medical, legal or financial advice. Numerology and astrology are traditions for reflection; see Learn → What research says.
        </Txt>
        <Txt variant="label" color={colors.violet}>
          If you are struggling
        </Txt>
        {CRISIS_RESOURCES.map((r) => (
          <Txt key={r.url} variant="small" color={colors.accent} onPress={() => Linking.openURL(r.url)}>
            {r.label}
          </Txt>
        ))}
      </Card>

      <SectionLabel>On your iPhone</SectionLabel>
      <Card>
        <Txt variant="small">1. In Safari, tap Share → Add to Home Screen.</Txt>
        <Txt variant="small">2. Always open Esoterica from that icon. It keeps its own storage, separate from Safari’s.</Txt>
        <Txt variant="small">
          3. Back up weekly (Back up now → Save to Files). Deleting the icon deletes its data; restore your file from the welcome screen.
        </Txt>
      </Card>

      <SectionLabel>Reset</SectionLabel>
      <Card>
        <Txt variant="small">Erase everything Esoterica stores on this device, including your API keys. Type RESET to confirm.</Txt>
        <TextField value={resetText} onChangeText={setResetText} placeholder="RESET" autoCapitalize="characters" />
        <Button
          label="Erase all data"
          variant="ghost"
          disabled={resetText !== 'RESET'}
          onPress={async () => {
            await resetAllData();
            router.replace('/onboarding');
          }}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2) },
  keyRow: { flexDirection: 'row', alignItems: 'center', gap: space(3) },
  usageRow: { flexDirection: 'row', gap: space(3), paddingVertical: space(1) },
  flex: { flex: 1 },
});
