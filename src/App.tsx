import { Dashboard } from './components/Dashboard'
import { DeckScreen } from './components/DeckScreen'
import { SessionScreen } from './components/SessionScreen'
import { ResultsScreen } from './components/ResultsScreen'
import { DeckModal } from './components/modals/DeckModal'
import { CardModal } from './components/modals/CardModal'
import { BulkAddModal } from './components/modals/BulkAddModal'
import { SettingsModal } from './components/modals/SettingsModal'
import { ConfirmModal } from './components/modals/ConfirmModal'
import { Onboarding } from './components/Onboarding'
import { Toast } from './components/Toast'
import { useStore } from './store/useStore'

export default function App() {
  const snap = useStore()
  const { db, modal } = snap

  return (
    <div style={{ minHeight: '100dvh', background: '#F1EDE3' }}>
      <div
        style={{
          maxWidth: 460,
          margin: '0 auto',
          minHeight: '100dvh',
          background: '#F7F4EC',
          borderLeft: '1px solid rgba(38,34,27,.08)',
          borderRight: '1px solid rgba(38,34,27,.08)',
          position: 'relative',
        }}
      >
        {snap.screen === 'home' && <Dashboard db={db} search={snap.search} />}
        {snap.screen === 'deck' && snap.deckId && <DeckScreen db={db} deckId={snap.deckId} />}
        {snap.screen === 'session' && snap.sess && (
          <SessionScreen db={db} sess={snap.sess} viewIdx={snap.viewIdx} revealed={snap.revealed} />
        )}
        {snap.screen === 'results' && snap.sess && <ResultsScreen sess={snap.sess} />}

        {modal?.type === 'deck' && <DeckModal mode={modal.mode} f={snap.f} folderNames={db.folders.map((f) => f.name)} />}
        {modal?.type === 'card' && <CardModal mode={modal.mode} f={snap.f} />}
        {modal?.type === 'bulk' && <BulkAddModal f={snap.f} />}
        {modal?.type === 'settings' && <SettingsModal settings={db.settings} />}
        {modal?.type === 'confirm' && <ConfirmModal title={modal.title} message={modal.msg} />}

        {snap.onboard && <Onboarding />}
        {snap.toast && <Toast message={snap.toast} />}
      </div>
    </div>
  )
}
