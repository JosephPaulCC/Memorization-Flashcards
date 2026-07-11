import type { CSSProperties } from 'react'
import type { FormFields } from '../../lib/types'
import { store } from '../../store/flashcardsStore'
import { FieldLabel, ModalSheet, ModalSubmitButton } from './ModalSheet'

const inputStyle: CSSProperties = {
  width: '100%',
  height: 48,
  borderRadius: 12,
  background: '#FFFFFF',
  padding: '0 14px',
  fontSize: 16,
  color: '#26221B',
}

export function DeckModal({ mode, f, folderNames }: { mode: 'new' | 'edit'; f: FormFields; folderNames: string[] }) {
  return (
    <ModalSheet title={mode === 'edit' ? 'Edit deck' : 'New deck'} onClose={() => store.closeModal()}>
      <FieldLabel>Deck name</FieldLabel>
      <input
        dir="auto"
        className="dc-input"
        value={f.name || ''}
        onChange={(e) => store.setField('name', e.target.value)}
        placeholder="e.g. Hindi verbs"
        style={inputStyle}
      />
      <FieldLabel>Folder (optional)</FieldLabel>
      <input
        dir="auto"
        list="dc-folder-options"
        className="dc-input"
        value={f.folder || ''}
        onChange={(e) => store.setField('folder', e.target.value)}
        placeholder="Leave empty for Ungrouped"
        style={inputStyle}
      />
      <datalist id="dc-folder-options">
        {folderNames.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      <ModalSubmitButton onClick={() => store.saveDeckModal()}>{mode === 'edit' ? 'Save changes' : 'Create deck'}</ModalSubmitButton>
    </ModalSheet>
  )
}
