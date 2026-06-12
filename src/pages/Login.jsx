import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { T } from '../lib/theme'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    const { error } = signIn(email, senha)
    if (error) { setErro(error); setLoading(false) }
    else navigate('/operacional')
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logos}>
          <div style={s.dv3}>DV3</div>
          <span style={s.x}>×</span>
          <div style={s.meli}>
            <span style={{ color: '#D6A800' }}>Mercado</span>
            <span style={{ color: '#3483FA' }}> Livre</span>
          </div>
        </div>

        <h1 style={s.title}>Portal OP MELI</h1>
        <p style={s.sub}>Entre com suas credenciais</p>

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>E-mail</label>
            <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required />
          </div>
          <div style={s.field}>
            <label style={s.label}>Senha</label>
            <input style={s.input} type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••••" required />
          </div>
          {erro && <div style={s.erro}>{erro}</div>}
          <button type="submit" style={s.btn} disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
        </form>

        <div style={s.hint}>
          <div style={s.hintTitle}>Usuários para teste:</div>
          {[
            { e: 'welington@dv3solucoes.com', s: 'admin123', p: 'Admin' },
            { e: 'carlos@dv3solucoes.com', s: '123456', p: 'Operacional' },
            { e: 'beatriz@dv3solucoes.com', s: '123456', p: 'Financeiro' },
          ].map(u => (
            <div key={u.e} style={s.hintRow} onClick={() => { setEmail(u.e); setSenha(u.s) }}>
              <span style={s.hintEmail}>{u.e}</span>
              <span style={s.hintSenha}>{u.s}</span>
              <span style={s.hintPerfil}>{u.p}</span>
            </div>
          ))}
          <div style={s.hintTip}>↑ clique numa linha para preencher</div>
        </div>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: T.pageBg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', fontFamily: "'Inter', sans-serif" },
  card: { background: T.cardBg, borderRadius: '16px', padding: '40px 36px', width: '100%', maxWidth: '420px', boxShadow: T.shadowLg, border: `1px solid ${T.border}` },
  logos: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '24px' },
  dv3: { background: T.red, color: '#fff', fontWeight: '700', fontSize: '18px', padding: '5px 11px', borderRadius: '7px', letterSpacing: '0.5px' },
  x: { color: '#D1D5DB', fontSize: '16px' },
  meli: { fontSize: '18px', fontWeight: '700' },
  title: { color: T.textPrimary, fontSize: '22px', fontWeight: '700', textAlign: 'center', margin: '0 0 4px' },
  sub: { color: T.textMuted, fontSize: '13px', textAlign: 'center', margin: '0 0 28px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { color: T.textLabel, fontSize: '13px', fontWeight: '600' },
  input: { background: T.inputBg, border: `1px solid ${T.borderInput}`, borderRadius: '8px', padding: '10px 13px', color: T.textPrimary, fontSize: '14px', outline: 'none' },
  erro: { background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 13px', color: '#991B1B', fontSize: '13px' },
  btn: { background: T.red, color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', marginTop: '4px', boxShadow: '0 2px 4px rgba(204,17,17,0.3)' },
  hint: { marginTop: '24px', background: '#F8F9FA', borderRadius: '10px', padding: '14px', border: `1px solid ${T.border}` },
  hintTitle: { color: T.textMuted, fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' },
  hintRow: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', cursor: 'pointer', padding: '4px', borderRadius: '6px' },
  hintEmail: { color: T.textSecondary, fontSize: '11px', flex: 1, minWidth: '180px' },
  hintSenha: { background: '#E5E7EB', borderRadius: '4px', padding: '2px 7px', fontSize: '11px', color: '#374151', fontFamily: 'monospace' },
  hintPerfil: { background: T.redLight, borderRadius: '4px', padding: '2px 7px', fontSize: '11px', color: T.red, fontWeight: '600' },
  hintTip: { color: T.textMuted, fontSize: '10px', marginTop: '8px', textAlign: 'center' },
}
