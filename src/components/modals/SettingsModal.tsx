import { LANGS, type Settings } from '../../lib/types'
import { store } from '../../store/flashcardsStore'
import { ToggleRow } from '../Toggle'
import { ModalSheet, FieldLabel } from './ModalSheet'

const selectStyle = {
  width: '100%',
  height: 48,
  borderRadius: 12,
  border: '1.5px solid rgba(38,34,27,.18)',
  background: '#FFFFFF',
  padding: '0 12px',
  fontSize: 16,
  color: '#26221B',
  outline: 'none',
} as const

export function SettingsModal({ settings }: { settings: Settings }) {
  return (
    <ModalSheet title="Settings" onClose={() => store.closeModal()}>
      <FieldLabel>Question language (speech)</FieldLabel>
      <select value={settings.qLang} onChange={(e) => store.setSettingLang('qLang', e.target.value)} style={selectStyle}>
        {LANGS.map(([code, name]) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>
      <FieldLabel>Answer language (speech)</FieldLabel>
      <select value={settings.aLang} onChange={(e) => store.setSettingLang('aLang', e.target.value)} style={selectStyle}>
        {LANGS.map(([code, name]) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>
      <div style={{ height: 1, background: 'rgba(38,34,27,.1)', margin: '18px 0 4px' }} />
      <ToggleRow
        title="Hidden options"
        description="Options stay invisible until you tap below the question"
        checked={settings.hidden}
        onClick={() => store.toggleSetting('hidden')}
      />
      <ToggleRow
        title="Auto-read"
        description="Speak each question, and the answer when you get it right"
        checked={settings.autoRead}
        onClick={() => store.toggleSetting('autoRead')}
      />
    </ModalSheet>
  )
}
