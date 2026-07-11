import type { CSSProperties } from 'react'
import type { FormFields } from '../../lib/types'
import { store } from '../../store/flashcardsStore'
import { FieldLabel, ModalSheet, ModalSubmitButton } from './ModalSheet'

const textareaStyle: CSSProperties = {
  width: '100%',
  borderRadius: 12,
  background: '#FFFFFF',
  padding: '12px 14px',
  fontSize: 16,
  color: '#26221B',
  resize: 'vertical',
  lineHeight: 1.4,
}

export function CardModal({ mode, f }: { mode: 'new' | 'edit'; f: FormFields }) {
  return (
    <ModalSheet title={mode === 'edit' ? 'Edit card' : 'Add card'} onClose={() => store.closeModal()}>
      <FieldLabel>Question</FieldLabel>
      <textarea
        dir="auto"
        className="dc-input"
        value={f.q || ''}
        onChange={(e) => store.setField('q', e.target.value)}
        rows={2}
        placeholder="Front of the card"
        style={textareaStyle}
      />
      <FieldLabel>Answer</FieldLabel>
      <textarea
        dir="auto"
        className="dc-input"
        value={f.a || ''}
        onChange={(e) => store.setField('a', e.target.value)}
        rows={2}
        placeholder="Back of the card"
        style={textareaStyle}
      />
      <ModalSubmitButton onClick={() => store.saveCardModal()}>{mode === 'edit' ? 'Save card' : 'Add card'}</ModalSubmitButton>
    </ModalSheet>
  )
}
