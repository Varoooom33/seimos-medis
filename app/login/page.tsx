'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [signupCode, setSignupCode] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else router.push('/tree')
    } else {
      if (signupCode !== process.env.NEXT_PUBLIC_SIGNUP_CODE) {
        setError('Neteisingas šeimos kodas.')
        setLoading(false)
        return
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName || email.split('@')[0] } },
      })
      if (error) setError(error.message)
      else router.push('/tree')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #3b1f0a 0%, #6b3a1f 40%, #9a5a2a 100%)' }}>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[520, 400, 280, 180].map((size, i) => (
            <div key={i} className="absolute rounded-full border border-white/10"
              style={{ width: size, height: size }} />
          ))}
        </div>

        <svg viewBox="0 0 340 380" className="relative z-10 w-72 h-auto drop-shadow-2xl" fill="none">
          <path d="M170 370 C165 320 160 280 163 240 C166 200 170 180 170 170" stroke="#d4a96a" strokeWidth="14" strokeLinecap="round"/>
          <path d="M163 340 C140 345 115 348 95 360" stroke="#d4a96a" strokeWidth="7" strokeLinecap="round" opacity="0.6"/>
          <path d="M170 340 C193 345 215 350 238 362" stroke="#d4a96a" strokeWidth="7" strokeLinecap="round" opacity="0.6"/>
          <path d="M170 200 C145 185 115 175 90 155" stroke="#c49050" strokeWidth="9" strokeLinecap="round"/>
          <path d="M170 200 C195 185 220 175 248 158" stroke="#c49050" strokeWidth="9" strokeLinecap="round"/>
          <path d="M170 230 C155 210 138 195 118 180" stroke="#c49050" strokeWidth="7" strokeLinecap="round"/>
          <path d="M170 230 C185 210 202 195 222 180" stroke="#c49050" strokeWidth="7" strokeLinecap="round"/>
          <path d="M170 170 C165 145 162 120 160 95" stroke="#c49050" strokeWidth="8" strokeLinecap="round"/>
          <path d="M90 155 C72 140 55 128 40 110" stroke="#b07840" strokeWidth="5" strokeLinecap="round"/>
          <path d="M90 155 C80 138 76 122 72 105" stroke="#b07840" strokeWidth="4" strokeLinecap="round"/>
          <path d="M248 158 C265 142 280 128 295 112" stroke="#b07840" strokeWidth="5" strokeLinecap="round"/>
          <path d="M248 158 C258 140 262 122 265 105" stroke="#b07840" strokeWidth="4" strokeLinecap="round"/>
          <path d="M160 95 C148 75 138 58 128 42" stroke="#b07840" strokeWidth="4" strokeLinecap="round"/>
          <path d="M160 95 C170 78 175 62 178 45" stroke="#b07840" strokeWidth="4" strokeLinecap="round"/>
          {[
            [40, 98], [72, 92], [128, 30], [178, 33], [295, 100], [265, 92],
            [85, 142], [252, 145], [118, 168], [222, 168]
          ].map(([cx, cy], i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r={i < 4 ? 22 : 18} fill="#4a7c3f" opacity="0.9"/>
              <circle cx={cx - 10} cy={cy + 8} r={i < 4 ? 18 : 14} fill="#5a9e4a" opacity="0.8"/>
              <circle cx={cx + 12} cy={cy + 5} r={i < 4 ? 16 : 13} fill="#3d6b35" opacity="0.85"/>
              <circle cx={cx + 2} cy={cy - 12} r={i < 4 ? 15 : 12} fill="#62b050" opacity="0.7"/>
            </g>
          ))}
          {[
            [40, 98], [72, 92], [128, 30], [178, 33], [295, 100], [265, 92],
          ].map(([cx, cy], i) => (
            <g key={i}>
              <circle cx={cx as number} cy={cy as number} r="9" fill="#f5e6c8" opacity="0.95"/>
              <circle cx={cx as number} cy={(cy as number) - 5} r="4" fill="#f5e6c8" opacity="0.9"/>
            </g>
          ))}
        </svg>

        <div className="relative z-10 mt-10 text-center px-8">
          <h2 className="text-3xl font-bold text-amber-100 tracking-tight">Šeimos medis</h2>
          <p className="text-amber-200/70 mt-2 text-sm">Išsaugokite šeimos istoriją ateities kartoms</p>
        </div>

        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-8">
          {['Istorijos', 'Ryšiai', 'Paveldas'].map(word => (
            <span key={word} className="text-xs text-amber-200/40 tracking-widest uppercase">{word}</span>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#faf8f5]">
        <div className="w-full max-w-sm">

          <div className="lg:hidden text-center mb-10">
            <h1 className="text-3xl font-bold text-stone-900">Šeimos medis</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-stone-900">
              {mode === 'login' ? 'Sveiki sugrįžę' : 'Sukurti paskyrą'}
            </h2>
            <p className="text-stone-500 text-sm mt-1">
              {mode === 'login'
                ? 'Prisijunkite prie savo šeimos medžio'
                : 'Pradėkite kurti savo šeimos istoriją'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-stone-800 mb-1.5">El. pašto adresas</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="jusu@pastas.lt"
                className="w-full border border-stone-300 rounded-xl px-4 py-2.5 text-sm text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors placeholder:text-stone-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-800 mb-1.5">Slaptažodis</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full border border-stone-300 rounded-xl px-4 py-2.5 text-sm text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors placeholder:text-stone-400"
              />
            </div>

            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-stone-800 mb-1.5">Vardas</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Kaip jus vadinti?"
                    className="w-full border border-stone-300 rounded-xl px-4 py-2.5 text-sm text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors placeholder:text-stone-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-800 mb-1.5">Šeimos kodas</label>
                  <input
                    type="password"
                    value={signupCode}
                    onChange={e => setSignupCode(e.target.value)}
                    placeholder="Paklauskite šeimos nario"
                    required
                    className="w-full border border-stone-300 rounded-xl px-4 py-2.5 text-sm text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors placeholder:text-stone-400"
                  />
                </div>
              </>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            {message && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
                <p className="text-green-700 text-sm">{message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #6b3a1f, #9a5a2a)' }}
            >
              {loading ? 'Kraunama…' : mode === 'login' ? 'Prisijungti' : 'Sukurti paskyrą'}
            </button>
          </form>

          <p className="text-center text-sm text-stone-500 mt-6">
            {mode === 'login' ? 'Neturite paskyros? ' : 'Jau turite paskyrą? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage('') }}
              className="font-medium text-amber-700 hover:text-amber-900 transition-colors"
            >
              {mode === 'login' ? 'Registruotis' : 'Prisijungti'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
