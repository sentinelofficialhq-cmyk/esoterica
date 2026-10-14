import { useImaginationStore } from '@/store/imaginationStore';

beforeEach(() => useImaginationStore.setState(useImaginationStore.getInitialState(), true));

test('aims are created open, newest first, and can be closed', () => {
  const s = useImaginationStore.getState();
  const first = s.addAim({ title: 'A home by the sea', scene: 'Handing a friend the new keys', date: '2026-10-14' });
  const second = s.addAim({ title: 'A calm first day at work', scene: 'My manager saying "glad you are here"', date: '2026-10-15' });
  let aims = useImaginationStore.getState().aims;
  expect(aims.map((a) => a.id)).toEqual([second, first]);
  expect(aims[1]).toMatchObject({ status: 'open', createdAt: '2026-10-14', notes: [] });

  useImaginationStore.getState().closeAim(first, 'fulfilled', '2026-11-02');
  aims = useImaginationStore.getState().aims;
  expect(aims.find((a) => a.id === first)).toMatchObject({ status: 'fulfilled', closedAt: '2026-11-02' });
});

test('notes and edits attach to the right aim', () => {
  const id = useImaginationStore.getState().addAim({ title: 'Book published', scene: 'Signing a copy', date: '2026-10-14' });
  useImaginationStore.getState().addAimNote(id, 'An editor replied today', '2026-10-20');
  useImaginationStore.getState().updateAim(id, { scene: 'Signing a copy for my mother' });
  const aim = useImaginationStore.getState().aims[0];
  expect(aim.notes).toEqual([{ date: '2026-10-20', text: 'An editor replied today' }]);
  expect(aim.scene).toBe('Signing a copy for my mother');
});

test('sessions are logged and removing an aim keeps its sessions but unlinks them', () => {
  const s = useImaginationStore.getState();
  const aimId = s.addAim({ title: 'Wish', scene: 'Scene', date: '2026-10-14' });
  s.addSession({ date: '2026-10-14', kind: 'scene', aimId, text: 'Felt real by the end', feeling: 4 });
  s.addSession({ date: '2026-10-14', kind: 'revision', text: 'Revised the meeting', feeling: 3 });
  expect(useImaginationStore.getState().sessions).toHaveLength(2);

  useImaginationStore.getState().removeAim(aimId);
  const state = useImaginationStore.getState();
  expect(state.aims).toHaveLength(0);
  expect(state.sessions.every((x) => x.aimId === undefined)).toBe(true);

  useImaginationStore.getState().removeSession(state.sessions[0].id);
  expect(useImaginationStore.getState().sessions).toHaveLength(1);
});
