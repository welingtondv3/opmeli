import { useState } from 'react'
import { TABELAS_INICIAIS } from '../data/mockData'
import { exportToExcel } from '../lib/exportExcel'
import { Plus, Download, Search, X } from 'lucide-react'
import { T } from '../lib/theme'

let nextId = 100

export default function Tabelas() {
  const [tabelas, setTabelas] = useState(TABELAS_INICIAIS)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [busca, setBusca] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(df())

  function df() { return { cnpj_cliente:'',cnpj_origem:'',cnpj_destino:'',cep_inicial:'',cep_final:'',tipo_veiculo:'',nome_rota:'',codigo1:'',codigo2:'',observacao:'' } }
  function openNew() { setEditItem(null); setForm(df()); setModalOpen(true) }
  function openEdit(item) { setEditItem(item); setForm({...item}); setModalOpen(true) }
  function handleSave() {
    setSaving(true)
    setTimeout(() => {
      if (editItem) setTabelas(prev=>prev.map(t=>t.id===editItem.id?{...form,id:editItem.id}:t))
      else setTabelas(prev=>[{...form,id:String(nextId++)},...prev])
      setModalOpen(false); setSaving(false)
    }, 400)
  }

  const filtered = tabelas.filter(t => {
    const b = busca.toLowerCase()
    return !b||t.nome_rota?.toLowerCase().includes(b)||t.cnpj_cliente?.includes(b)||t.codigo1?.includes(b)||t.codigo2?.includes(b)||t.tipo_veiculo?.toLowerCase().includes(b)
  })

  function handleExport() {
    exportToExcel(filtered.map(t=>({'CNPJ Cliente':t.cnpj_cliente,'CNPJ Origem':t.cnpj_origem,'CNPJ Destino':t.cnpj_destino,'CEP Inicial':t.cep_inicial,'CEP Final':t.cep_final,'Veículo':t.tipo_veiculo,'Rota':t.nome_rota,'Código 1':t.codigo1,'Código 2':t.codigo2,'Obs':t.observacao})),'Tabelas_Frete_MELI','Tabelas')
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div><h1 style={s.title}>Tabelas de Frete</h1><p style={s.sub}>{filtered.length} tabelas — clique para editar</p></div>
        <div style={s.actions}>
          <button style={s.btnEx} onClick={handleExport}><Download size={14}/> Exportar Excel</button>
          <button style={s.btnNw} onClick={openNew}><Plus size={14}/> Nova Tabela</button>
        </div>
      </div>

      <div style={s.search}>
        <Search size={14} color={T.textMuted}/>
        <input style={s.searchInput} placeholder="Buscar por rota, CNPJ, código, veículo..." value={busca} onChange={e=>setBusca(e.target.value)}/>
      </div>

      <div style={s.tableWrap}>
        {filtered.length===0?<div style={s.empty}>Nenhuma tabela encontrada.</div>:
        <table style={s.table}>
          <thead><tr>{['CNPJ Cliente','CNPJ Origem','CNPJ Destino','CEPs','Veículo','Rota','Código 1','Código 2','Obs.'].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
          <tbody>
            {filtered.map(t=>(
              <tr key={t.id} style={s.tr} onClick={()=>openEdit(t)}
                onMouseEnter={e=>e.currentTarget.style.background=T.rowHover}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <td style={s.td}><span style={s.mono}>{t.cnpj_cliente}</span></td>
                <td style={s.td}><span style={s.mono}>{t.cnpj_origem}</span></td>
                <td style={s.td}><span style={s.mono}>{t.cnpj_destino}</span></td>
                <td style={s.td}><span style={s.small}>{t.cep_inicial} – {t.cep_final}</span></td>
                <td style={s.td}>{t.tipo_veiculo}</td>
                <td style={{...s.td,color:T.textPrimary,fontWeight:600}}>{t.nome_rota}</td>
                <td style={s.td}><span style={s.cod}>{t.codigo1}</span></td>
                <td style={s.td}><span style={s.cod}>{t.codigo2}</span></td>
                <td style={s.td}><span style={s.small}>{t.observacao||'—'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>}
      </div>

      {modalOpen&&(
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.mHead}><h2 style={s.mTitle}>{editItem?'Editar Tabela':'Nova Tabela de Frete'}</h2><button style={s.iconBtn} onClick={()=>setModalOpen(false)}><X size={17} color={T.textMuted}/></button></div>
            <div style={s.mBody}>
              <F label="CNPJ Cliente" value={form.cnpj_cliente} set={v=>setForm(f=>({...f,cnpj_cliente:v}))}/>
              <Row2><F label="CNPJ Origem" value={form.cnpj_origem} set={v=>setForm(f=>({...f,cnpj_origem:v}))}/><F label="CNPJ Destino" value={form.cnpj_destino} set={v=>setForm(f=>({...f,cnpj_destino:v}))}/></Row2>
              <Row2><F label="CEP Inicial" value={form.cep_inicial} set={v=>setForm(f=>({...f,cep_inicial:v}))}/><F label="CEP Final" value={form.cep_final} set={v=>setForm(f=>({...f,cep_final:v}))}/></Row2>
              <Row2><F label="Tipo de Veículo" value={form.tipo_veiculo} set={v=>setForm(f=>({...f,tipo_veiculo:v}))}/><F label="Nome da Rota" value={form.nome_rota} set={v=>setForm(f=>({...f,nome_rota:v}))}/></Row2>
              <div style={{color:'#059669',fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'.7px',borderTop:`1px solid ${T.border}`,paddingTop:8}}>Códigos para emissão do CT-e</div>
              <Row2><F label="Código 1" value={form.codigo1} set={v=>setForm(f=>({...f,codigo1:v}))}/><F label="Código 2" value={form.codigo2} set={v=>setForm(f=>({...f,codigo2:v}))}/></Row2>
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
const F=({label,value,set})=>(
  <div style={{display:'flex',flexDirection:'column',gap:4}}>
    <label style={{color:T.textLabel,fontSize:'12px',fontWeight:600}}>{label}</label>
    <input value={value||''} onChange={e=>set(e.target.value)} style={{background:T.inputBg,border:`1px solid ${T.borderInput}`,borderRadius:7,padding:'8px 10px',color:T.textPrimary,fontSize:13,outline:'none'}}/>
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
  search:{display:'flex',alignItems:'center',gap:7,background:T.cardBg,border:`1px solid ${T.border}`,borderRadius:8,padding:'9px 12px',marginBottom:16,boxShadow:T.shadow},
  searchInput:{background:'none',border:'none',color:T.textPrimary,fontSize:13,outline:'none',width:'100%'},
  tableWrap:{overflowX:'auto',borderRadius:10,border:`1px solid ${T.border}`,boxShadow:T.shadow},
  table:{width:'100%',borderCollapse:'collapse',fontSize:13,background:T.tableBg},
  th:{padding:'11px 12px',textAlign:'left',color:T.textMuted,fontWeight:700,fontSize:11,textTransform:'uppercase',letterSpacing:'.5px',background:T.tableHead,borderBottom:`1px solid ${T.border}`,whiteSpace:'nowrap'},
  tr:{borderBottom:`1px solid ${T.border}`,cursor:'pointer',transition:'background .1s'},
  td:{padding:'10px 12px',color:T.textSecondary,verticalAlign:'middle'},
  mono:{fontFamily:'monospace',fontSize:12,color:T.textPrimary},
  small:{fontSize:12,color:T.textMuted},
  cod:{display:'inline-block',background:'#ECFDF5',border:'1px solid #A7F3D0',borderRadius:5,padding:'3px 9px',fontSize:12,fontWeight:700,color:'#065F46',fontFamily:'monospace'},
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
