export const VAULT_NOTE_TAG_PREFIX = 'note';

const uniqueStrings = (values: Array<string | null | undefined>) =>
  Array.from(new Set(values.map((value) => String(value || '').trim()).filter(Boolean)));

const normalizeNoteId = (noteId: string) => String(noteId || '').trim();

export function buildVaultNoteTags(noteIds: Array<string | null | undefined>) {
  return uniqueStrings(noteIds).map((noteId) => `${VAULT_NOTE_TAG_PREFIX}:${normalizeNoteId(noteId)}`);
}
