import { useState, useMemo } from 'react'
import { CTES_INICIAIS } from '../data/mockData'
import { exportToExcel } from '../lib/exportExcel'
import { useAuth } from '../contexts/AuthContext'
import { Plus, Download, Search, X, ChevronDown } from 'lucide-react'
import { T } from '../lib/theme'

const STATUS_OPTS = ['OK', 'FINALIZADA', 'PENDENTE']
const VEICULO_OPTS = ['Carreta', 'Truck', 'Toco', 'Médio', 'Vuc']
const SC = {
  OK:        { bg: T.okBg,   border: T.okBorder,   color: T.okText },
  FINALIZADA:{ bg: T.finBg,  border: T.finBorder,  color: T.finText },
  PENDENTE:  { bg: T.pendBg, border: T.pendBorder, color: T.pendText },
}

let nextId = 100

export default function Operacional() {
  const { user } = useAuth()
  const [ctes, setCtes] = useState(CTES_INICIAIS)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(df())

  // Filtros individuais
  const [busca, setBusca] = useState('')
  const [fStatus, setFStatus] = useState('')
  const [fLote, setFLote] = useState('')
  const [fVeiculo, setFVeiculo] = useState('')
  const [fResponsavel, setFResponsavel] = useState('')

  function df() {
    return { lote:'', numero_cte:'', data_emissao: new Date().toISOString().split('T')[0], cod_origem:'', nome_origem:'', cnpj_origem:'', cod_destino:'', nome_destino:'', cnpj_destino:'', tipo_veiculo:'Carreta', motorista1:'', cpf1:'', motorista2:'', cpf2:'', placa:'', carreta:'', status_cte:'OK', numero_mdfe:'', responsavel: user?.nome || '' }
  }

  function openNew() { setEditItem(null); setForm({...df(), responsavel: user?.nome||''}); setModalOpen(true) }
  function openEdit(item) { setEditItem(item); setForm({...item}); setModalOpen(true) }
  function handleSave() {
    setSaving(true)
    setTimeout(() => {
      if (editItem) setCtes(prev => prev.map(c => c.id === editItem.id ? {...form, id: editItem.id} : c))
      else setCtes(prev => [{...form, id: String(nextId++)}, ...prev])
      setModalOpen(false); setSaving(false)
    }, 400)
  }

  function limparFiltros() {
    setBusca(''); setFStatus(''); setFLote(''); setFVeiculo(''); setFResponsavel('')
  }

  // Opções dinâmicas dos selects
  const lotes = useMemo(() => [...new Set(ctes.map(c => c.lote).filter(Boolean))].sort((a,b) => b-a), [ctes])
  const veiculos = useMemo(() => [...new Set(ctes.map(c => c.tipo_veiculo).filter(Boolean))].sort(), [ctes])
  const responsaveis = useMemo(() => [...new Set(ctes.map(c => c.responsavel).filter(Boolean))].sort(), [ctes])

  const temFiltro = busca || fStatus || fLote || fVeiculo || fResponsavel

  const filtered = useMemo(() => ctes.filter(c => {
    const b = busca.toLowerCase()
    const matchBusca = !b ||
      String(c.numero_cte).includes(b) ||
      c.motorista1?.toLowerCase().includes(b) ||
      c.motorista2?.toLowerCase().includes(b) ||
      c.nome_origem?.toLowerCase().includes(b) ||
      c.nome_destino?.toLowerCase().includes(b) ||
      String(c.lote).includes(b) ||
      c.placa?.toLowerCase().includes(b) ||
      c.responsavel?.toLowerCase().includes(b)
    return matchBusca
      && (!fStatus || c.status_cte === fStatus)
      && (!fLote || c.lote === fLote)
      && (!fVeiculo || c.tipo_veiculo === fVeiculo)
      && (!fResponsavel || c.responsavel === fResponsavel)
  }), [ctes, busca, fStatus, fLote, fVeiculo, fResponsavel])

  const counts = {
    OK: ctes.filter(c => c.status_cte === 'OK').length,
    FINALIZADA: ctes.filter(c => c.status_cte === 'FINALIZADA').length,
    PENDENTE: ctes.filter(c => c.status_cte === 'PENDENTE').length,
  }

  function handleExport() {
    exportToExcel(filtered.map(c => ({'Lote':c.lote,'Nº CT-e':c.numero_cte,'Data':c.data_emissao,'Cód. Origem':c.cod_origem,'Origem':c.nome_origem,'CNPJ Origem':c.cnpj_origem,'Cód. Destino':c.cod_destino,'Destino':c.nome_destino,'CNPJ Destino':c.cnpj_destino,'Veículo':c.tipo_veiculo,'Motorista 1':c.motorista1,'CPF 1':c.cpf1,'Motorista 2':c.motorista2,'CPF 2':c.cpf2,'Placa':c.placa,'Carreta':c.carreta,'Status':c.status_cte,'MDF-e':c.numero_mdfe,'Responsável':c.responsavel})), 'CTes_MELI', 'CT-es')
  }

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Controle Operacional</h1>
          <p style={s.sub}>
            {temFiltro ? <><strong style={{color: T.red}}>{filtered.length}</strong> resultado{filtered.length !== 1 ? 's' : ''} filtrado{filtered.length !== 1 ? 's' : ''} de {ctes.length}</> : <>{ctes.length} CT-es no total</>}
          </p>
        </div>
        <div style={s.actions}>
          <button style={s.btnEx} onClick={handleExport}><Download size={14}/> Exportar Excel</button>
          <button style={s.btnNw} onClick={openNew}><Plus size={14}/> Novo CT-e</button>
        </div>
      </div>

      {/* Cards status — clicáveis como filtro */}
      <div style={s.cards}>
        {[
          ['OK', SC.OK],
          ['FINALIZADA', SC.FINALIZADA],
          ['PENDENTE', SC.PENDENTE],
        ].map(([st, c]) => (
          <div key={st}
            style={{...s.card, borderLeft: `4px solid ${c.border}`, background: fStatus === st ? c.bg : T.cardBg, cursor: 'pointer'}}
            onClick={() => setFStatus(f => f === st ? '' : st)}
            title={`Filtrar por ${st}`}>
            <div style={{color: T.textMuted, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, letterSpacing: '.5px'}}>{st}</div>
            <div style={{color: c.color, fontSize: '28px', fontWeight: 700}}>{counts[st]}</div>
            {fStatus === st && <div style={{fontSize: 10, color: c.color, marginTop: 4, fontWeight: 600}}>✓ Filtro ativo — clique para remover</div>}
          </div>
        ))}
        <div style={{...s.card, borderLeft: `4px solid ${T.border}`}}>
          <div style={{color: T.textMuted, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, letterSpacing: '.5px'}}>TOTAL</div>
          <div style={{color: T.textPrimary, fontSize: '28px', fontWeight: 700}}>{ctes.length}</div>
        </div>
      </div>

      {/* Barra de filtros */}
      <div style={s.filterBox}>
        {/* Busca livre */}
        <div style={s.searchWrap}>
          <Search size={15} color={T.textMuted}/>
          <input
            style={s.searchInput}
            placeholder="Buscar por CT-e, motorista, placa, origem, destino..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
          {busca && <button style={s.clearBtn} onClick={() => setBusca('')}><X size={13} color={T.textMuted}/></button>}
        </div>

        {/* Selects de filtro */}
        <div style={s.selectsRow}>
          <Filtro label="Status" value={fStatus} onChange={setFStatus}
            options={STATUS_OPTS.map(o => ({value: o, label: o}))} />
          <Filtro label="Lote" value={fLote} onChange={setFLote}
            options={lotes.map(l => ({value: l, label: `Lote ${l}`}))} />
          <Filtro label="Veículo" value={fVeiculo} onChange={setFVeiculo}
            options={veiculos.map(v => ({value: v, label: v}))} />
          <Filtro label="Responsável" value={fResponsavel} onChange={setFResponsavel}
            options={responsaveis.map(r => ({value: r, label: r}))} />

          {temFiltro && (
            <button style={s.btnLimpar} onClick={limparFiltros}>
              <X size={13}/> Limpar filtros
            </button>
          )}
        </div>

        {/* Chips dos filtros ativos */}
        {temFiltro && (
          <div style={s.chips}>
            <span style={s.chipsLabel}>Filtros ativos:</span>
            {busca && <Chip label={`"${busca}"`} onRemove={() => setBusca('')}/>}
            {fStatus && <Chip label={`Status: ${fStatus}`} onRemove={() => setFStatus('')}/>}
            {fLote && <Chip label={`Lote: ${fLote}`} onRemove={() => setFLote('')}/>}
            {fVeiculo && <Chip label={`Veículo: ${fVeiculo}`} onRemove={() => setFVeiculo('')}/>}
            {fResponsavel && <Chip label={`Resp.: ${fResponsavel}`} onRemove={() => setFResponsavel('')}/>}
          </div>
        )}
      </div>

      {/* Tabela */}
      <div style={s.tableWrap}>
        {filtered.length === 0
          ? (
            <div style={s.empty}>
              <div style={{fontSize: 32, marginBottom: 8}}>🔍</div>
              <div style={{fontWeight: 600, color: T.textSecondary, marginBottom: 4}}>Nenhum CT-e encontrado</div>
              <div style={{fontSize: 13, color: T.textMuted}}>Tente ajustar os filtros</div>
              <button style={{...s.btnLimpar, marginTop: 12}} onClick={limparFiltros}><X size={13}/> Limpar filtros</button>
            </div>
          )
          : (
            <table style={s.table}>
              <thead>
                <tr>{['Lote','Nº CT-e','Origem','Destino','Veículo','Motorista','Placa','Status','MDF-e','Resp.'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.map(c => {
                  const sc = SC[c.status_cte] || SC.PENDENTE
                  return (
                    <tr key={c.id} style={s.tr} onClick={() => openEdit(c)}
                      onMouseEnter={e => e.currentTarget.style.background = T.rowHover}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={s.td}><span style={s.loteBadge}>{c.lote}</span></td>
                      <td style={{...s.td, fontWeight: 700, color: T.textPrimary, fontFamily: 'monospace', fontSize: 13}}>{c.numero_cte}</td>
                      <td style={s.td}>
                        <span style={s.codBadge}>{c.cod_origem}</span>
                        <span style={s.sub2}>{c.nome_origem}</span>
                      </td>
                      <td style={s.td}>
                        <span style={s.codBadge}>{c.cod_destino}</span>
                        <span style={s.sub2}>{c.nome_destino}</span>
                      </td>
                      <td style={s.td}>{c.tipo_veiculo}</td>
                      <td style={s.td}>
                        <span style={{color: T.textPrimary}}>{c.motorista1}</span>
                        {c.motorista2 && <span style={s.sub2}>{c.motorista2}</span>}
                      </td>
                      <td style={{...s.td, fontFamily: 'monospace', fontWeight: 600, fontSize: 13, color: T.textPrimary}}>{c.placa}</td>
                      <td style={s.td}><span style={{...s.stBadge, background: sc.bg, border: `1px solid ${sc.border}`, color: sc.color}}>{c.status_cte}</span></td>
                      <td style={{...s.td, fontFamily: 'monospace', fontSize: 12}}>{c.numero_mdfe || '—'}</td>
                      <td style={s.td}>{c.responsavel}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )
        }
      </div>

      {/* Modal */}
      {modalOpen && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.mHead}>
              <h2 style={s.mTitle}>{editItem ? 'Editar CT-e' : 'Novo CT-e'}</h2>
              <button style={s.iconBtn} onClick={() => setModalOpen(false)}><X size={17} color={T.textMuted}/></button>
            </div>
            <div style={s.mBody}>
              <Row2><F label="Lote" value={form.lote} set={v => setForm(f => ({...f, lote: v}))}/><F label="Nº CT-e" value={form.numero_cte} set={v => setForm(f => ({...f, numero_cte: v}))}/></Row2>
              <F label="Data Emissão" type="date" value={form.data_emissao} set={v => setForm(f => ({...f, data_emissao: v}))}/>
              <Sec>Origem</Sec>
              <Row3><F label="Código" value={form.cod_origem} set={v => setForm(f => ({...f, cod_origem: v}))}/><F label="Nome" value={form.nome_origem} set={v => setForm(f => ({...f, nome_origem: v}))}/><F label="CNPJ" value={form.cnpj_origem} set={v => setForm(f => ({...f, cnpj_origem: v}))}/></Row3>
              <Sec>Destino</Sec>
              <Row3><F label="Código" value={form.cod_destino} set={v => setForm(f => ({...f, cod_destino: v}))}/><F label="Nome" value={form.nome_destino} set={v => setForm(f => ({...f, nome_destino: v}))}/><F label="CNPJ" value={form.cnpj_destino} set={v => setForm(f => ({...f, cnpj_destino: v}))}/></Row3>
              <Sec>Veículo & Motoristas</Sec>
              <Sel label="Tipo de Veículo" value={form.tipo_veiculo} opts={VEICULO_OPTS} set={v => setForm(f => ({...f, tipo_veiculo: v}))}/>
              <Row2><F label="Motorista 1" value={form.motorista1} set={v => setForm(f => ({...f, motorista1: v}))}/><F label="CPF 1" value={form.cpf1} set={v => setForm(f => ({...f, cpf1: v}))}/></Row2>
              <Row2><F label="Motorista 2" value={form.motorista2} set={v => setForm(f => ({...f, motorista2: v}))}/><F label="CPF 2" value={form.cpf2} set={v => setForm(f => ({...f, cpf2: v}))}/></Row2>
              <Row2><F label="Placa" value={form.placa} set={v => setForm(f => ({...f, placa: v}))}/><F label="Carreta" value={form.carreta} set={v => setForm(f => ({...f, carreta: v}))}/></Row2>
              <Sec>Status & Documentos</Sec>
              <Row2><Sel label="Status CT-e" value={form.status_cte} opts={STATUS_OPTS} set={v => setForm(f => ({...f, status_cte: v}))}/><F label="Nº MDF-e" value={form.numero_mdfe} set={v => setForm(f => ({...f, numero_mdfe: v}))}/></Row2>
              <F label="Responsável" value={form.responsavel} set={v => setForm(f => ({...f, responsavel: v}))}/>
            </div>
            <div style={s.mFoot}>
              <button style={s.btnCancel} onClick={() => setModalOpen(false)}>Cancelar</button>
              <button style={s.btnSave} onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Componente de filtro com label flutuante
function Filtro({ label, value, options, onChange }) {
  const active = !!value
  return (
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          background: active ? T.redLight : T.cardBg,
          border: `1px solid ${active ? T.red : T.border}`,
          borderRadius: 8,
          padding: '8px 32px 8px 10px',
          color: active ? T.red : T.textSecondary,
          fontSize: 13,
          fontWeight: active ? 600 : 400,
          outline: 'none',
          cursor: 'pointer',
          appearance: 'none',
          minWidth: 120,
          boxShadow: T.shadow,
        }}>
        <option value="">{label}</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={13} color={active ? T.red : T.textMuted} style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}/>
    </div>
  )
}

// Chip de filtro ativo
function Chip({ label, onRemove }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: T.redLight, border: `1px solid ${T.red}22`, borderRadius: 20, padding: '3px 10px 3px 10px', fontSize: 12, color: T.red, fontWeight: 600 }}>
      {label}
      <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: T.red }}><X size={11}/></button>
    </span>
  )
}

const Row2 = ({children}) => <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>{children}</div>
const Row3 = ({children}) => <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>{children}</div>
const Sec = ({children}) => <div style={{color:T.red,fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'.7px',borderTop:`1px solid ${T.border}`,paddingTop:8,marginTop:4}}>{children}</div>
const F = ({label,value,set,type='text'}) => (
  <div style={{display:'flex',flexDirection:'column',gap:4}}>
    <label style={{color:T.textLabel,fontSize:'12px',fontWeight:600}}>{label}</label>
    <input type={type} value={value||''} onChange={e=>set(e.target.value)} style={{background:T.inputBg,border:`1px solid ${T.borderInput}`,borderRadius:7,padding:'8px 10px',color:T.textPrimary,fontSize:13,outline:'none'}}/>
  </div>
)
const Sel = ({label,value,opts,set}) => (
  <div style={{display:'flex',flexDirection:'column',gap:4}}>
    <label style={{color:T.textLabel,fontSize:'12px',fontWeight:600}}>{label}</label>
    <select value={value||''} onChange={e=>set(e.target.value)} style={{background:T.inputBg,border:`1px solid ${T.borderInput}`,borderRadius:7,padding:'8px 10px',color:T.textPrimary,fontSize:13,outline:'none'}}>
      {opts.map(o=><option key={o}>{o}</option>)}
    </select>
  </div>
)

const s = {
  page: {fontFamily:"'Inter',sans-serif"},
  header: {display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,flexWrap:'wrap',gap:10},
  title: {color:T.textPrimary,fontSize:22,fontWeight:700,margin:0},
  sub: {color:T.textMuted,fontSize:13,margin:'3px 0 0'},
  actions: {display:'flex',gap:8},
  btnEx: {display:'flex',alignItems:'center',gap:6,background:T.cardBg,border:`1px solid ${T.border}`,borderRadius:8,padding:'9px 14px',color:T.textSecondary,fontSize:13,fontWeight:600,cursor:'pointer',boxShadow:T.shadow},
  btnNw: {display:'flex',alignItems:'center',gap:6,background:T.red,border:'none',borderRadius:8,padding:'9px 14px',color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer',boxShadow:'0 2px 4px rgba(204,17,17,0.25)'},
  cards: {display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:12,marginBottom:16},
  card: {background:T.cardBg,border:`1px solid ${T.border}`,borderRadius:10,padding:'16px 18px',boxShadow:T.shadow,transition:'background .15s'},
  filterBox: {background:T.cardBg,border:`1px solid ${T.border}`,borderRadius:10,padding:'14px 16px',marginBottom:16,boxShadow:T.shadow,display:'flex',flexDirection:'column',gap:10},
  searchWrap: {display:'flex',alignItems:'center',gap:8,background:T.inputBg,border:`1px solid ${T.borderInput}`,borderRadius:8,padding:'9px 12px'},
  searchInput: {background:'none',border:'none',color:T.textPrimary,fontSize:13,outline:'none',width:'100%'},
  clearBtn: {background:'none',border:'none',cursor:'pointer',padding:2,flexShrink:0},
  selectsRow: {display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'},
  btnLimpar: {display:'flex',alignItems:'center',gap:5,background:'#FEF2F2',border:`1px solid #FECACA`,borderRadius:8,padding:'8px 12px',color:T.red,fontSize:12,fontWeight:600,cursor:'pointer'},
  chips: {display:'flex',gap:6,flexWrap:'wrap',alignItems:'center'},
  chipsLabel: {color:T.textMuted,fontSize:12,fontWeight:600},
  tableWrap: {overflowX:'auto',borderRadius:10,border:`1px solid ${T.border}`,boxShadow:T.shadow},
  table: {width:'100%',borderCollapse:'collapse',fontSize:13,background:T.tableBg},
  th: {padding:'11px 12px',textAlign:'left',color:T.textMuted,fontWeight:700,fontSize:11,textTransform:'uppercase',letterSpacing:'.5px',background:T.tableHead,borderBottom:`1px solid ${T.border}`,whiteSpace:'nowrap'},
  tr: {borderBottom:`1px solid ${T.border}`,cursor:'pointer',transition:'background .1s'},
  td: {padding:'10px 12px',color:T.textSecondary,verticalAlign:'middle'},
  sub2: {display:'block',fontSize:11,color:T.textMuted,marginTop:1},
  loteBadge: {background:'#F3F4F6',borderRadius:4,padding:'2px 7px',fontSize:12,color:T.textSecondary,fontFamily:'monospace'},
  codBadge: {display:'inline-block',background:'#F3F4F6',border:`1px solid ${T.border}`,borderRadius:4,padding:'1px 6px',fontSize:11,color:T.textSecondary,marginBottom:2},
  stBadge: {display:'inline-block',borderRadius:5,padding:'3px 9px',fontSize:11,fontWeight:700},
  empty: {padding:48,textAlign:'center',color:T.textMuted},
  overlay: {position:'fixed',inset:0,background:T.overlayBg,display:'flex',alignItems:'center',justifyContent:'center',zIndex:100,padding:16},
  modal: {background:T.modalBg,borderRadius:14,border:`1px solid ${T.border}`,width:'100%',maxWidth:560,maxHeight:'92vh',display:'flex',flexDirection:'column',boxShadow:T.shadowLg},
  mHead: {display:'flex',justifyContent:'space-between',alignItems:'center',padding:'18px 20px 14px',borderBottom:`1px solid ${T.border}`},
  mTitle: {color:T.textPrimary,fontSize:16,fontWeight:700,margin:0},
  iconBtn: {background:'none',border:'none',cursor:'pointer',padding:4},
  mBody: {padding:'16px 20px',overflowY:'auto',display:'flex',flexDirection:'column',gap:11,flex:1},
  mFoot: {padding:'14px 20px',borderTop:`1px solid ${T.border}`,display:'flex',gap:8,justifyContent:'flex-end'},
  btnCancel: {background:'#F3F4F6',border:`1px solid ${T.border}`,borderRadius:8,padding:'9px 18px',color:T.textSecondary,fontSize:13,fontWeight:600,cursor:'pointer'},
  btnSave: {background:T.red,border:'none',borderRadius:8,padding:'9px 18px',color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer'},
}
