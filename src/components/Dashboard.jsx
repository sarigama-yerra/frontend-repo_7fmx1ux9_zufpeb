import { useEffect, useMemo, useState } from 'react'
import Spline from '@splinetool/react-spline'
import { Bell, Moon, Sun, Globe, Settings, Search, User, ChevronDown } from 'lucide-react'
import { languages, useI18nState } from '../i18n'

const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function ThemeToggle({ theme, setTheme, t }){
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition"
      aria-label={t.theme}
    >
      {theme === 'dark' ? <Sun size={16}/> : <Moon size={16}/>}
      <span className="text-sm">{theme === 'dark' ? t.themes.light : t.themes.dark}</span>
    </button>
  )
}

function LanguageSelect({ lang, setLang }){
  return (
    <div className="relative">
      <select
        className="appearance-none pl-8 pr-8 py-2 rounded-md bg-black/5 dark:bg-white/10 text-sm"
        value={lang}
        onChange={(e)=>{ setLang(e.target.value); localStorage.setItem('lang', e.target.value) }}
      >
        {Object.keys(languages).map(k => <option key={k} value={k}>{k.toUpperCase()}</option>)}
      </select>
      <Globe className="absolute left-2 top-2.5" size={16}/>
      <ChevronDown className="absolute right-2 top-2.5" size={16}/>
    </div>
  )
}

function Stat({ label, value }){
  return (
    <div className="p-4 rounded-xl bg-white/60 dark:bg-white/10 shadow-sm border border-black/5 dark:border-white/10">
      <div className="text-xs opacity-60 mb-1">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  )
}

function Notifications({ t, userId }){
  const [items, setItems] = useState([])
  const load = async () => {
    try{
      const res = await fetch(`${backend}/notifications/${userId}`)
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
    }catch(e){ setItems([]) }
  }
  useEffect(()=>{ load() },[userId])
  return (
    <div className="p-4 rounded-xl bg-white/60 dark:bg-white/10 shadow-sm border border-black/5 dark:border-white/10">
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium">{t.myNotifications}</div>
        <button onClick={load} className="text-xs px-2 py-1 rounded bg-black/5 dark:bg-white/10">{t.refresh}</button>
      </div>
      <div className="space-y-2 max-h-48 overflow-auto">
        {items.length === 0 && <div className="text-sm opacity-60">—</div>}
        {items.map((n,i)=> (
          <div key={i} className="text-sm flex items-start gap-2">
            <Bell size={14} className="mt-0.5 opacity-70"/>
            <div>
              <div className="font-medium">{n.title}</div>
              <div className="opacity-70">{n.body}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Insights({ t }){
  const [data, setData] = useState({ summary: '', overloaded: [], approaching: [] })
  const load = async () => {
    try{
      const res = await fetch(`${backend}/insights/system`)
      const d = await res.json()
      setData(d)
    }catch(e){ /* ignore */ }
  }
  useEffect(()=>{ load() },[])
  return (
    <div className="p-4 rounded-xl bg-white/60 dark:bg-white/10 shadow-sm border border-black/5 dark:border-white/10">
      <div className="font-medium mb-2">{t.systemInsights}</div>
      <div className="text-sm opacity-80 mb-3">{data.summary}</div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-xs opacity-60 mb-1">{t.approaching}</div>
          <div className="space-y-1 max-h-24 overflow-auto">
            {data.approaching?.map((id)=> <div key={id} className="px-2 py-1 rounded bg-black/5 dark:bg-white/10 font-mono text-xs">{id}</div>)}
          </div>
        </div>
        <div>
          <div className="text-xs opacity-60 mb-1">{t.overloaded}</div>
          <div className="space-y-1 max-h-24 overflow-auto">
            {data.overloaded?.map((u,i)=> <div key={i} className="px-2 py-1 rounded bg-black/5 dark:bg-white/10 text-xs">{u.user_id}: {u.active}/{u.capacity}</div>)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard(){
  const [lang, setLang] = useState(useI18nState())
  const t = languages[lang]
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')
  useEffect(()=>{
    localStorage.setItem('theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const [role, setRole] = useState('manager')
  const [userId, setUserId] = useState('demo-user-id')

  const [projects, setProjects] = useState([])
  const [parts, setParts] = useState([])
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('deadline')

  const loadData = async () => {
    try{
      const p = await fetch(`${backend}/projects?sort=${sort}`)
      const parts = await fetch(`${backend}/parts`)
      setProjects(await p.json())
      setParts(await parts.json())
    }catch(e){ /* ignore */ }
  }
  useEffect(()=>{ loadData() },[sort])

  const filteredProjects = useMemo(()=>{
    const q = query.toLowerCase()
    return projects.filter(p =>
      p.title?.toLowerCase().includes(q) || p.tags?.some(t=>t.toLowerCase().includes(q))
    )
  }, [projects, query])

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-slate-100 dark:from-slate-900 dark:to-black text-slate-900 dark:text-slate-100">
      <div className="relative h-[380px]">
        <Spline scene="https://prod.spline.design/LU2mWMPbF3Qi1Qxh/scene.splinecode" style={{ width: '100%', height: '100%' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/30 to-white dark:from-black/60 dark:via-black/30 dark:to-black pointer-events-none" />
        <div className="absolute inset-x-0 top-0 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User size={18}/>
            <div className="font-semibold">{t.appName}</div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle theme={theme} setTheme={setTheme} t={t} />
            <LanguageSelect lang={lang} setLang={setLang} />
            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-black/5 dark:bg-white/10"><Settings size={16}/> Settings</button>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-6 flex flex-col items-center text-center px-4">
          <div className="text-4xl sm:text-5xl font-extrabold tracking-tight drop-shadow-sm">{t.tagline}</div>
          <div className="opacity-80 mt-2 max-w-2xl">Real-time, role-based dashboards for complex multi-part projects.</div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto -mt-16 relative z-10 p-4">
        <div className="rounded-2xl bg-white/70 dark:bg-white/10 shadow-xl backdrop-blur border border-black/5 dark:border-white/10 p-4">
          <div className="flex flex-wrap items-center gap-2 justify-between">
            <div className="inline-flex items-center gap-2">
              <select value={role} onChange={(e)=>setRole(e.target.value)} className="px-3 py-2 rounded-md bg-black/5 dark:bg-white/10">
                <option value="admin">{t.roles.admin}</option>
                <option value="manager">{t.roles.manager}</option>
                <option value="worker">{t.roles.worker}</option>
                <option value="guest">{t.roles.guest}</option>
              </select>
              <div className="relative">
                <Search className="absolute left-2 top-2.5" size={16}/>
                <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder={t.search} className="pl-8 pr-3 py-2 rounded-md bg-black/5 dark:bg-white/10"/>
              </div>
              <select value={sort} onChange={(e)=>setSort(e.target.value)} className="px-3 py-2 rounded-md bg-black/5 dark:bg-white/10">
                <option value="deadline">{t.sort.deadline}</option>
                <option value="progress">{t.sort.progress}</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Stat label={t.capacity} value={"—"} />
              <Stat label={t.active} value={"—"} />
              <Stat label={t.available} value={"—"} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="md:col-span-2 space-y-3">
              <div className="text-sm opacity-60">{t.projects}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredProjects.map((p)=> (
                  <div key={String(p._id)} className="p-4 rounded-xl bg-white/60 dark:bg-white/10 border border-black/5 dark:border-white/10">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold">{p.title}</div>
                        <div className="text-xs opacity-70">{t.progress}: {Math.round(p.progress||0)}%</div>
                      </div>
                      <div className="text-xs px-2 py-1 rounded bg-black/5 dark:bg-white/10">{p.priority}</div>
                    </div>
                    <div className="mt-2 text-sm opacity-80 line-clamp-3">{p.description}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <Notifications t={t} userId={userId}/>
              <Insights t={t}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
