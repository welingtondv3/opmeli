import { useState } from 'react'
import { FINANCEIRO_INICIAIS } from '../data/mockData'
import { exportToExcel } from '../lib/exportExcel'
import { useAuth } from '../contexts/AuthContext'
import { Plus, Download, Search, X } from 'lucide-react'
import { T } from '../lib/theme'

const STATUS_PAG = ['Pendente','Pago','Contestado','Parcial','Não Pago']
const SC = {
  Pago:      { bg:T.pagoBg,   border:T.pagoBorder,   color:T.pagoText },
  Pendente:  { bg:T.pendFBg,  border:T.pendFBorder,  color:T.pendFText },
  Contestado:{ bg:T.contBg,   border:T.contBorder,   color:T.contText },
  Parcial:   { bg:T.parcBg,   border:T.parcBorder,   color:T.parcText },
  'Não Pago':{ bg:T.naoPagoBg,border:T.naoPagoBorder,color:T.naoPagoText },
}
const fmt = v => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v||0)
let nextId = 100

export default function Financeiro() {
  const { user } = useAuth()
  const [rows, setRows] = useState(FINANCEIRO_INICIAIS)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [filters, setFilters] = useState({ busca:'', status:'' })
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(df())

  function df() { return { numero_cte:'',lote:'',valor_esperado:'',valor_recebido:'',valor_contestado:'',status_pagamento:'Pendente',data_pagamento:'',observacao:'' } }
  function openNew() { setEditItem(null); setForm(df()); setModalOpen(true) }
  function openEdit(item) { setEditItem(item); setForm({...item}); setModalOpen(true) }
  function handleSave() {
    setSaving(true)
    setTimeout(() => {
      const payload = {...form,valor_esperado:parseFloat(form.valor_esperado)||0,valor_recebido:parseFloat(form.valor_recebido)||0,valor_contestado:parseFloat(form.valor_contestado)||0,usuario_nome:user?.nome}
      if (editItem) setRows(prev=>prev.map(r=>r.id===editItem.id?{...payload,id:editItem.id}:r))
      else setRows(prev=>[{...payload,id:String(nextId++)},...prev])
      setModalOpen(false); setSaving(false)
    }, 400)
  }

  const filtered = rows.filter(r => {
    const b = filters.busca.toLowerCase()
    return (!b||String(r.numero_cte).includes(b)||String(r.lote).includes(b)||r.observacao?.toLowerCase().includes(b))
      &&(!filters.status||r.status_pagamento===filters.status)
  })
  const totais = filtered.reduce((a,r)=>({esp:a.esp+r.valor_esperado,rec:a.rec+r.valor_recebido,con:a.con+r.valor_contestado}),{esp:0,rec:0,con:0})

  function handleExport() {
    exportToExcel(filtered.map(r=>({'Lote':r.lote,'CT-e':r.numero_cte,'Vl. Esperado':r.valor_esperado,'Vl. Recebido':r.valor_recebido,'Vl. Contestado':r.valor_contestado,'Status':r.status_pagamento,'Data Pgto':r.data_pagamento,'Observação':r.observacao,'Usuário':r.usuario_nome})),'Financeiro_MELI','Financeiro')
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div><h1 style={s.title}>Financeiro</h1><p style={s.sub}>{filtered.length} registros</p></div>
        <div style={s.actions}>
          <button style={s.btnEx} onClick={handleExport}><Download size={14}/> Exportar Excel</button>
          <button style={s.btnNw} onClick={openNew}><Plus size={14}/> Novo Registro</button>
        </div>
      </div>

      <div style={s.cards}>
        {[
          {label:'Total Esperado', val:totais.esp, color:T.textPrimary, bg:T.cardBg, border:T.border},
          {label:'Total Recebido', val:totais.rec, color:'#065F46', bg:'#ECFDF5', border:'#A7F3D0'},
          {label:'Contestado', val:totais.con, color:'#9A3412', bg:'#FFF7ED', border:'#FED7AA'},
          {label:'Saldo Pendente', val:totais.esp-totais.rec, color:'#991B1B', bg:'#FEF2F2', border:'#FECACA'},
        ].map(c=>(
          <div key={c.label} style={{...s.card, background:c.bg, borderColor:c.border}}>
            <div style={{color:T.textMuted,fontSize:'11px',fontWeight:700,textTransform:'uppercase',marginBottom:6,letterSpacing:'.5px'}}>{c.label}</div>
            <div style={{color:c.color,fontSize:'18px',fontWeight:700}}>{fmt(c.val)}</div>
          </div>
        ))}
      </div>

      <div style={s.filters}>
        <div style={s.search}>
          <Search size={14} color={T.textMuted}/>
          <input style={s.searchInput} placeholder="CT-e, lote, observação..." value={filters.busca} onChange={e=>setFilters(f=>({...f,busca:e.target.value}))}/>
        </div>
        <select style={s.sel} value={filters.status} onChange={e=>setFilters(f=>({...f,status:e.target.value}))}>
          <option value="">Todos os status</option>
          {STATUS_PAG.map(o=><option key={o}>{o}</option>)}
        </select>
      </div>

      <div style={s.tableWrap}>
        {filtered.length===0?<div style={s.empty}>Nenhum registro encontrado.</div>:
        <table style={s.table}>
          <thead><tr>{['Lote','CT-e','Vl. Esperado','Vl. Recebido','Vl. Contestado','Status','Data Pgto','Observação','Usuário'].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
          <tbody>
            {filtered.map(r=>{
              const sc=SC[r.status_pagamento]||SC.Pendente
              return (
                <tr key={r.id} style={s.tr} onClick={()=>openEdit(r)}
                  onMouseEnter={e=>e.currentTarget.style.background=T.rowHover}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={s.td}>{r.lote}</td>
                  <td style={{...s.td,fontWeight:700,color:T.textPrimary,fontFamily:'monospace',fontSize:13}}>{r.numero_cte}</td>
                  <td style={s.td}>{fmt(r.valor_esperado)}</td>
                  <td style={{...s.td,color:'#065F46',fontWeight:600}}>{fmt(r.valor_recebido)}</td>
                  <td style={{...s.td,color:r.valor_contestado>0?'#9A3412':T.textMuted}}>{r.valor_contestado>0?fmt(r.valor_contestado):'—'}</td>
                  <td style={s.td}><span style={{...s.stBadge,background:sc.bg,border:`1px solid ${sc.border}`,color:sc.color}}>{r.status_pagamento}</span></td>
                  <td style={s.td}>{r.data_pagamento||'—'}</td>
                  <td style={s.td}><span style={s.obs}>{r.observacao||'—'}</span></td>
                  <td style={s.td}>{r.usuario_nome}</td>
                </tr>
              )
            })}
          </tbody>
        </table>}
      </div>

      {modalOpen&&(
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.mHead}><h2 style={s.mTitle}>{editItem?'Editar Registro':'Novo Registro Financeiro'}</h2><button style={s.iconBtn} onClick={()=>setModalOpen(false)}><X size={17} color={T.textMuted}/></button></div>
            <div style={s.mBody}>
              <Row2><F label="Nº CT-e" value={form.numero_cte} set={v=>setForm(f=>({...f,numero_cte:v}))}/><F label="Lote" value={form.lote} set={v=>setForm(f=>({...f,lote:v}))}/></Row2>
              <div style={{color:'#D97706',fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'.7px',borderTop:`1px solid ${T.border}`,paddingTop:8}}>Valores</div>
              <Row3>
                <F label="Esperado (R$)" type="number" value={form.valor_esperado} set={v=>setForm(f=>({...f,valor_esperado:v}))}/>
                <F label="Recebido (R$)" type="number" value={form.valor_recebido} set={v=>setForm(f=>({...f,valor_recebido:v}))}/>
                <F label="Contestado (R$)" type="number" value={form.valor_contestado} set={v=>setForm(f=>({...f,valor_contestado:v}))}/>
              </Row3>
              <Row2>
                <Sel label="Status Pagamento" value={form.status_pagamento} opts={STATUS_PAG} set={v=>setForm(f=>({...f,status_pagamento:v}))}/>
                <F label="Data Pagamento" type="date" value={form.data_pagamento} set={v=>setForm(f=>({...f,data_pagamento:v}))}/>
              </Row2>
              <F label="Observação" value={form.observacao} set={v=>setForm(f=>({...f,observacao:v}))}/>
            </div>
            <div style={s.mFoot}>
              <button style={s.btnCancel} onClick={()=>setModalOpen(false)}>Cancelar</button>
              <button style={s.btnSave} onClick={handleSave} disabled={saving}>{saving?'Salvando...':'Salvar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const Row2=({children})=><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>{children}</div>
const Row3=({children})=><div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>{children}</div>
const F=({label,value,set,type='text'})=>(
  <div style={{display:'flex',flexDirection:'column',gap:4}}>
    <label style={{color:T.textLabel,fontSize:'12px',fontWeight:600}}>{label}</label>
    <input type={type} value={value||''} onChange={e=>set(e.target.value)} style={{background:T.inputBg,border:`1px solid ${T.borderInput}`,borderRadius:7,padding:'8px 10px',color:T.textPrimary,fontSize:13,outline:'none'}}/>
  </div>
)
const Sel=({label,value,opts,set})=>(
  <div style={{display:'flex',flexDirection:'column',gap:4}}>
    <label style={{color:T.textLabel,fontSize:'12px',fontWeight:600}}>{label}</label>
    <select value={value||''} onChange={e=>set(e.target.value)} style={{background:T.inputBg,border:`1px solid ${T.borderInput}`,borderRadius:7,padding:'8px 10px',color:T.textPrimary,fontSize:13,outline:'none'}}>
      {opts.map(o=><option key={o}>{o}</option>)}
    </select>
  </div>
)

const s={
  page:{fontFamily:"'Inter',sans-serif"},
  header:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,flexWrap:'wrap',gap:10},
  title:{color:T.textPrimary,fontSize:22,fontWeight:700,margin:0},
  sub:{color:T.textMuted,fontSize:13,margin:'3px 0 0'},
  actions:{display:'flex',gap:8},
  btnEx:{display:'flex',alignItems:'center',gap:6,background:T.cardBg,border:`1px solid ${T.border}`,borderRadius:8,padding:'9px 14px',color:T.textSecondary,fontSize:13,fontWeight:600,cursor:'pointer',boxShadow:T.shadow},
  btnNw:{display:'flex',alignItems:'center',gap:6,background:T.red,border:'none',borderRadius:8,padding:'9px 14px',color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer',boxShadow:'0 2px 4px rgba(204,17,17,0.25)'},
  cards:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12,marginBottom:20},
  card:{border:'1px solid',borderRadius:10,padding:'16px 18px',boxShadow:T.shadow},
  filters:{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'},
  search:{display:'flex',alignItems:'center',gap:7,background:T.cardBg,border:`1px solid ${T.border}`,borderRadius:8,padding:'9px 12px',flex:1,minWidth:200,boxShadow:T.shadow},
  searchInput:{background:'none',border:'none',color:T.textPrimary,fontSize:13,outline:'none',width:'100%'},
  sel:{background:T.cardBg,border:`1px solid ${T.border}`,borderRadius:8,padding:'9px 12px',color:T.textSecondary,fontSize:13,outline:'none',cursor:'pointer',boxShadow:T.shadow},
  tableWrap:{overflowX:'auto',borderRadius:10,border:`1px solid ${T.border}`,boxShadow:T.shadow},
  table:{width:'100%',borderCollapse:'collapse',fontSize:13,background:T.tableBg},
  th:{padding:'11px 12px',textAlign:'left',color:T.textMuted,fontWeight:700,fontSize:11,textTransform:'uppercase',letterSpacing:'.5px',background:T.tableHead,borderBottom:`1px solid ${T.border}`,whiteSpace:'nowrap'},
  tr:{borderBottom:`1px solid ${T.border}`,cursor:'pointer',transition:'background .1s'},
  td:{padding:'10px 12px',color:T.textSecondary,verticalAlign:'middle'},
  obs:{display:'block',maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:12},
  stBadge:{display:'inline-block',borderRadius:5,padding:'3px 9px',fontSize:11,fontWeight:700},
  empty:{padding:40,textAlign:'center',color:T.textMuted,fontSize:14},
  overlay:{position:'fixed',inset:0,background:T.overlayBg,display:'flex',alignItems:'center',justifyContent:'center',zIndex:100,padding:16},
  modal:{background:T.modalBg,borderRadius:14,border:`1px solid ${T.border}`,width:'100%',maxWidth:500,maxHeight:'92vh',display:'flex',flexDirection:'column',boxShadow:T.shadowLg},
  mHead:{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'18px 20px 14px',borderBottom:`1px solid ${T.border}`},
  mTitle:{color:T.textPrimary,fontSize:16,fontWeight:700,margin:0},
  iconBtn:{background:'none',border:'none',cursor:'pointer',padding:4},
  mBody:{padding:'16px 20px',overflowY:'auto',display:'flex',flexDirection:'column',gap:11,flex:1},
  mFoot:{padding:'14px 20px',borderTop:`1px solid ${T.border}`,display:'flex',gap:8,justifyContent:'flex-end'},
  btnCancel:{background:'#F3F4F6',border:`1px solid ${T.border}`,borderRadius:8,padding:'9px 18px',color:T.textSecondary,fontSize:13,fontWeight:600,cursor:'pointer'},
  btnSave:{background:T.red,border:'none',borderRadius:8,padding:'9px 18px',color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer'},
}
