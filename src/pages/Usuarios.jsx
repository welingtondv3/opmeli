import { useState } from 'react'
import { USUARIOS } from '../data/mockData'
import { exportToExcel } from '../lib/exportExcel'
import { Plus, Download, X } from 'lucide-react'
import { T } from '../lib/theme'

const PERFIS = ['admin','operacional','comercial','financeiro']
const MODULOS = ['operacional','comercial','financeiro']
const PCOR = { admin:{bg:'#FEF2F2',color:'#991B1B'}, operacional:{bg:'#EEF2FF',color:'#3730A3'}, comercial:{bg:'#ECFDF5',color:'#065F46'}, financeiro:{bg:'#FFFBEB',color:'#92400E'} }
let nextId = 100

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState(USUARIOS)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(df())

  function df() { return { nome:'',email:'',senha:'',perfil:'operacional',modulos:[],ativo:true } }
  function openNew() { setEditItem(null); setForm(df()); setModalOpen(true) }
  function openEdit(u) { setEditItem(u); setForm({...u,senha:''}); setModalOpen(true) }
  function handleSave() {
    setSaving(true)
    setTimeout(()=>{
      if (editItem) setUsuarios(prev=>prev.map(u=>u.id===editItem.id?{...form,id:editItem.id}:u))
      else setUsuarios(prev=>[...prev,{...form,id:String(nextId++)}])
      setModalOpen(false); setSaving(false)
    },400)
  }
  function toggleMod(m) { setForm(f=>({...f,modulos:f.modulos.includes(m)?f.modulos.filter(x=>x!==m):[...f.modulos,m]})) }

  function handleExport() {
    exportToExcel(usuarios.map(u=>({'Nome':u.nome,'E-mail':u.email,'Perfil':u.perfil,'Módulos':u.modulos.join(', '),'Ativo':u.ativo?'Sim':'Não'})),'Usuarios_MELI','Usuários')
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div><h1 style={s.title}>Gestão de Usuários</h1><p style={s.sub}>{usuarios.length} usuários cadastrados</p></div>
        <div style={s.actions}>
          <button style={s.btnEx} onClick={handleExport}><Download size={14}/> Exportar Excel</button>
          <button style={s.btnNw} onClick={openNew}><Plus size={14}/> Novo Usuário</button>
        </div>
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead><tr>{['Nome','E-mail','Perfil','Módulos','Status'].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
          <tbody>
            {usuarios.map(u=>{
              const pc=PCOR[u.perfil]||PCOR.operacional
              return (
                <tr key={u.id} style={s.tr} onClick={()=>openEdit(u)}
                  onMouseEnter={e=>e.currentTarget.style.background=T.rowHover}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{...s.td,display:'flex',alignItems:'center',gap:10}}>
                    <div style={{...s.av,background:u.perfil==='admin'?T.red:'#6B7280'}}>{u.nome?.charAt(0)?.toUpperCase()}</div>
                    <span style={{color:T.textPrimary,fontWeight:600}}>{u.nome}</span>
                  </td>
                  <td style={s.td}>{u.email}</td>
                  <td style={s.td}><span style={{...s.pBadge,background:pc.bg,color:pc.color}}>{u.perfil}</span></td>
                  <td style={s.td}><div style={s.mods}>{u.perfil==='admin'?<span style={s.mod}>Todos</span>:u.modulos.map(m=><span key={m} style={s.mod}>{m}</span>)}</div></td>
                  <td style={s.td}><span style={{...s.stDot,background:u.ativo?'#ECFDF5':'#F3F4F6',color:u.ativo?'#065F46':'#9CA3AF',border:`1px solid ${u.ativo?'#A7F3D0':'#E5E7EB'}`}}>{u.ativo?'Ativo':'Inativo'}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {modalOpen&&(
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.mHead}><h2 style={s.mTitle}>{editItem?'Editar Usuário':'Novo Usuário'}</h2><button style={s.iconBtn} onClick={()=>setModalOpen(false)}><X size={17} color={T.textMuted}/></button></div>
            <div style={s.mBody}>
              <F label="Nome completo" value={form.nome} set={v=>setForm(f=>({...f,nome:v}))}/>
              {!editItem&&<>
                <F label="E-mail" type="email" value={form.email} set={v=>setForm(f=>({...f,email:v}))}/>
                <F label="Senha inicial" type="password" value={form.senha} set={v=>setForm(f=>({...f,senha:v}))}/>
              </>}
              <Sel label="Perfil" value={form.perfil} opts={PERFIS} set={v=>setForm(f=>({...f,perfil:v}))}/>
              {form.perfil!=='admin'&&(
                <div>
                  <label style={{color:T.textLabel,fontSize:'12px',fontWeight:600,display:'block',marginBottom:8}}>Módulos com acesso</label>
                  {MODULOS.map(m=>(
                    <label key={m} style={{display:'flex',alignItems:'center',gap:8,marginBottom:8,cursor:'pointer'}}>
                      <input type="checkbox" checked={form.modulos.includes(m)} onChange={()=>toggleMod(m)} style={{accentColor:T.red,width:15,height:15}}/>
                      <span style={{color:T.textPrimary,fontSize:13,textTransform:'capitalize'}}>{m}</span>
                    </label>
                  ))}
                </div>
              )}
              <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}>
                <input type="checkbox" checked={form.ativo} onChange={e=>setForm(f=>({...f,ativo:e.target.checked}))} style={{accentColor:T.red,width:15,height:15}}/>
                <span style={{color:T.textPrimary,fontSize:13}}>Usuário ativo</span>
              </label>
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
  tableWrap:{overflowX:'auto',borderRadius:10,border:`1px solid ${T.border}`,boxShadow:T.shadow},
  table:{width:'100%',borderCollapse:'collapse',fontSize:13,background:T.tableBg},
  th:{padding:'11px 12px',textAlign:'left',color:T.textMuted,fontWeight:700,fontSize:11,textTransform:'uppercase',letterSpacing:'.5px',background:T.tableHead,borderBottom:`1px solid ${T.border}`,whiteSpace:'nowrap'},
  tr:{borderBottom:`1px solid ${T.border}`,cursor:'pointer',transition:'background .1s'},
  td:{padding:'10px 12px',color:T.textSecondary,verticalAlign:'middle'},
  av:{width:32,height:32,borderRadius:'50%',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:13,flexShrink:0},
  pBadge:{display:'inline-block',borderRadius:5,padding:'3px 9px',fontSize:11,fontWeight:700,textTransform:'capitalize'},
  mods:{display:'flex',gap:4,flexWrap:'wrap'},
  mod:{background:'#F3F4F6',borderRadius:4,padding:'2px 7px',fontSize:11,color:T.textSecondary},
  stDot:{display:'inline-block',borderRadius:20,padding:'3px 10px',fontSize:12,fontWeight:600},
  overlay:{position:'fixed',inset:0,background:T.overlayBg,display:'flex',alignItems:'center',justifyContent:'center',zIndex:100,padding:16},
  modal:{background:T.modalBg,borderRadius:14,border:`1px solid ${T.border}`,width:'100%',maxWidth:420,maxHeight:'92vh',display:'flex',flexDirection:'column',boxShadow:T.shadowLg},
  mHead:{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'18px 20px 14px',borderBottom:`1px solid ${T.border}`},
  mTitle:{color:T.textPrimary,fontSize:16,fontWeight:700,margin:0},
  iconBtn:{background:'none',border:'none',cursor:'pointer',padding:4},
  mBody:{padding:'16px 20px',overflowY:'auto',display:'flex',flexDirection:'column',gap:12,flex:1},
  mFoot:{padding:'14px 20px',borderTop:`1px solid ${T.border}`,display:'flex',gap:8,justifyContent:'flex-end'},
  btnCancel:{background:'#F3F4F6',border:`1px solid ${T.border}`,borderRadius:8,padding:'9px 18px',color:T.textSecondary,fontSize:13,fontWeight:600,cursor:'pointer'},
  btnSave:{background:T.red,border:'none',borderRadius:8,padding:'9px 18px',color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer'},
}
