import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FileText, Table2, DollarSign, Users, LogOut, Menu, X, ChevronRight } from 'lucide-react'
import { T } from '../lib/theme'

const NAV = [
  { label: 'Operacional', icon: FileText, path: '/operacional', modulo: 'operacional' },
  { label: 'Tabelas de Frete', icon: Table2, path: '/tabelas', modulo: 'comercial' },
  { label: 'Financeiro', icon: DollarSign, path: '/financeiro', modulo: 'financeiro' },
  { label: 'Usuários', icon: Users, path: '/usuarios', modulo: 'admin' },
]

export default function Layout({ children }) {
  const { user, signOut, hasAccess } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const nav = NAV.filter(n => hasAccess(n.modulo))

  return (
    <div style={s.root}>
      {open && <div style={s.overlay} onClick={() => setOpen(false)} />}

      <aside style={{ ...s.sidebar, left: open ? 0 : '-250px' }}>
        <div style={s.sbHead}>
          <div style={s.dv3}>DV3</div>
          <span style={s.sbTitle}>OP MELI</span>
          <button style={s.iconBtn} onClick={() => setOpen(false)}><X size={17} color={T.textMuted} /></button>
        </div>

        <div style={s.meliTag}>
          <span style={{ color: '#D6A800', fontWeight: 700, fontSize: 13 }}>Mercado</span>
          <span style={{ color: '#3483FA', fontWeight: 700, fontSize: 13 }}> Livre</span>
        </div>

        <nav style={s.nav}>
          {nav.map(item => {
            const active = location.pathname === item.path
            return (
              <button key={item.path} onClick={() => { navigate(item.path); setOpen(false) }}
                style={{ ...s.navItem, ...(active ? s.navActive : {}) }}>
                <item.icon size={17} color={active ? T.red : T.textMuted} />
                <span style={{ color: active ? T.red : T.textSecondary, fontSize: '14px', fontWeight: active ? 600 : 400 }}>{item.label}</span>
                {active && <ChevronRight size={13} color={T.red} style={{ marginLeft: 'auto' }} />}
              </button>
            )
          })}
        </nav>

        <div style={s.userArea}>
          <div style={s.avatar}>{user?.nome?.charAt(0)?.toUpperCase()}</div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={s.userName}>{user?.nome}</div>
            <div style={s.userRole}>{user?.perfil}</div>
          </div>
          <button style={s.iconBtn} onClick={signOut} title="Sair"><LogOut size={16} color={T.textMuted} /></button>
        </div>
      </aside>

      <div style={s.main}>
        <header style={s.topbar}>
          <button style={s.iconBtn} onClick={() => setOpen(true)}><Menu size={21} color={T.textSecondary} /></button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            <div style={{ background: T.red, color: '#fff', fontWeight: '700', fontSize: '11px', padding: '3px 7px', borderRadius: '5px' }}>DV3</div>
            <span style={{ color: T.textPrimary, fontWeight: '700', fontSize: '14px' }}>OP MELI</span>
          </div>
          <div style={s.meliBadge}>
            <span style={{ color: '#D6A800', fontWeight: 700, fontSize: 11 }}>Mercado</span>
            <span style={{ color: '#3483FA', fontWeight: 700, fontSize: 11 }}> Livre</span>
          </div>
        </header>
        <main style={s.content}>{children}</main>
      </div>
    </div>
  )
}

const s = {
  root: { display: 'flex', minHeight: '100vh', background: T.pageBg, fontFamily: "'Inter', sans-serif" },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 40 },
  sidebar: { position: 'fixed', top: 0, bottom: 0, width: '235px', background: T.sidebarBg, borderRight: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', zIndex: 50, transition: 'left .22s ease', boxShadow: T.shadowMd },
  sbHead: { display: 'flex', alignItems: 'center', gap: '9px', padding: '18px 14px 14px', borderBottom: `1px solid ${T.border}` },
  dv3: { background: T.red, color: '#fff', fontWeight: '700', fontSize: '13px', padding: '4px 8px', borderRadius: '5px' },
  sbTitle: { color: T.textPrimary, fontWeight: '700', fontSize: '15px', flex: 1 },
  meliTag: { padding: '10px 14px 10px', borderBottom: `1px solid ${T.border}` },
  nav: { flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' },
  navItem: { display: 'flex', alignItems: 'center', gap: '11px', padding: '10px 11px', borderRadius: '8px', border: 'none', background: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'background .15s' },
  navActive: { background: T.redLight },
  userArea: { display: 'flex', alignItems: 'center', gap: '9px', padding: '14px', borderTop: `1px solid ${T.border}` },
  avatar: { width: '34px', height: '34px', borderRadius: '50%', background: T.red, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', flexShrink: 0 },
  userName: { color: T.textPrimary, fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userRole: { color: T.textMuted, fontSize: '11px', textTransform: 'capitalize' },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '5px', flexShrink: 0 },
  main: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
  topbar: { height: '54px', background: T.topbarBg, borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', padding: '0 16px', gap: '12px', position: 'sticky', top: 0, zIndex: 30, boxShadow: T.shadow },
  meliBadge: { background: '#F8F9FA', border: `1px solid ${T.border}`, borderRadius: '7px', padding: '5px 10px' },
  content: { flex: 1, padding: '20px 16px', overflowX: 'hidden' },
}
