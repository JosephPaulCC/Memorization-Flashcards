import type { FormFields } from '../../lib/types'
import { store } from '../../store/flashcardsStore'
import { ModalSheet, ModalSubmitButton } from './ModalSheet'

export function BulkAddModal({ f }: { f: FormFields }) {
  return (
    <ModalSheet title="Bulk add cards" onClose={() => store.closeModal()}>
      <div style={{ fontSize: 13, color: '#857E6F', lineHeight: 1.5, margin: '6px 0 12px' }}>
        One card per line, as <b>question=answer</b>. Lines without = or with an empty side are skipped.
      </div>
      <textarea
        dir="auto"
        className="dc-input"
        value={f.bulk || ''}
        onChange={(e) => store.setField('bulk', e.target.value)}
        rows={9}
        placeholder="water=agua"
        style={{
          width: '100%',
          borderRadius: 12,
          background: '#FFFFFF',
          padding: '12px 14px',
          fontSize: 15,
          color: '#26221B',
          resize: 'vertical',
          lineHeight: 1.6,
        }}
      />
      <ModalSubmitButton onClick={() => store.runBulk()} marginTop={16}>
        Import cards
      </ModalSubmitButton>
    </ModalSheet>
  )
}
