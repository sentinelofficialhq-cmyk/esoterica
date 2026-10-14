import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Usage } from '@/ai/types';
import { persistStorage } from '@/store/storage';
import type { ThemeId } from '@/ui/themes';

export type ChatDepth = 'quick' | 'balanced' | 'deep';
/** 'mock' is an offline stand-in offered only in development builds. */
export type ProviderChoice = 'anthropic' | 'openai' | 'mock';

type SettingsFields = {
  provider: ProviderChoice;
  anthropicModel: string;
  openaiModel: string;
  chatDepth: ChatDepth;
  memoryEnabled: boolean;
  lastBackupAt: string | null;
  /** The app's look: Ember Glass (default), Gilded Night or Nebula. */
  theme: ThemeId;
  /** Token totals for the current calendar month, per model. */
  usage: { month: string; byModel: Record<string, Usage> };
};

type SettingsState = SettingsFields & {
  update: (patch: Partial<SettingsFields>) => void;
  addUsage: (model: string, u: Usage, month: string) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      provider: 'anthropic',
      anthropicModel: 'claude-opus-5-5',
      openaiModel: '',
      chatDepth: 'quick',
      memoryEnabled: true,
      lastBackupAt: null,
      theme: 'ember',
      usage: { month: '', byModel: {} },
      update: (patch) => set(patch),
      addUsage: (model, u, month) =>
        set((s) => {
          const byModel = s.usage.month === month ? { ...s.usage.byModel } : {};
          const prev = byModel[model] ?? { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 };
          byModel[model] = {
            inputTokens: prev.inputTokens + u.inputTokens,
            outputTokens: prev.outputTokens + u.outputTokens,
            cacheReadTokens: prev.cacheReadTokens + u.cacheReadTokens,
            cacheWriteTokens: prev.cacheWriteTokens + u.cacheWriteTokens,
          };
          return { usage: { month, byModel } };
        }),
    }),
    { name: 'rocket-settings', storage: createJSONStorage(() => persistStorage) },
  ),
);
