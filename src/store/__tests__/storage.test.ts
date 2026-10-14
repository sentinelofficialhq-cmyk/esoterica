jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const mockSecure = new Map<string, string>();
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async (k: string) => mockSecure.get(k) ?? null),
  setItemAsync: jest.fn(async (k: string, v: string) => void mockSecure.set(k, v)),
  deleteItemAsync: jest.fn(async (k: string) => void mockSecure.delete(k)),
}));

import { getKey, setKey } from '@/store/secrets';
import { persistStorage } from '@/store/storage';

test('native persist storage round-trips through AsyncStorage', async () => {
  await persistStorage.setItem('rocket-test', '{"a":1}');
  expect(await persistStorage.getItem('rocket-test')).toBe('{"a":1}');
  await persistStorage.removeItem('rocket-test');
  expect(await persistStorage.getItem('rocket-test')).toBeNull();
});

test('api keys live in secure storage on native', async () => {
  expect(await getKey('anthropic')).toBeNull();
  await setKey('anthropic', 'test-key-value');
  expect(await getKey('anthropic')).toBe('test-key-value');
  await setKey('anthropic', null);
  expect(await getKey('anthropic')).toBeNull();
});
