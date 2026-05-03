'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Person, Relationship, Source } from '@/types'

interface Props {
  person: Person
  people: Person[]
  relationships: Relationship[]
  onClose: () => void
  onPersonUpdated: (p: Person) => void
  onPersonDeleted: (id: string) => void
  onRelationshipAdded: (r: Relationship) => void
}

export default function PersonModal({
  person, people, relationships, onClose, onPersonUpdated, onPersonDeleted, onRelationshipAdded
}: Props) {
  const [tab, setTab] = useState<'info' | 'edit' | 'sources' | 'relationships'>('info')
  const [form, setForm] = useState({ ...person })
  const [saving, setSaving] = useState(false)
  const [sources, setSources] = useState<Source[]>([])
  const [sourcesLoaded, setSourcesLoaded] = useState(false)
  const [newSource, setNewSource] = useState({ title: '', description: '', url: '' })
  const [relType, setRelType] = useState<'parent_child' | 'partner'>('parent_child')
  const [relDirection, setRelDirection] = useState<'parent' | 'child'>('parent')
  const [relPersonId, setRelPersonId] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [photoUploading, setPhotoUploading] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const myRelationships = relationships.filter(
    r => r.person_a_id === person.id || r.person_b_id === person.id
  )

  async function loadSources() {
    if (sourcesLoaded) return
    const { data } = await supabase.from('sources').select('*').eq('person_id', person.id)
    setSources(data ?? [])
    setSourcesLoaded(true)
  }

  async function saveEdit() {
    setSaving(true)
    const { data, error } = await supabase
      .from('people')
      .update({
        first_name: form.first_name,
        last_name: form.last_name,
        maiden_name: form.maiden_name,
        birth_date: form.birth_date || null,
        death_date: form.death_date || null,
        birth_place: form.birth_place,
        death_place: form.death_place,
        gender: form.gender,
        bio: form.bio,
        photo_url: form.photo_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', person.id)
      .select()
      .single()
    if (!error && data) onPersonUpdated(data)
    setSaving(false)
    setTab('info')
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${person.id}-${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage.from('photos').upload(path, file, { upsert: true })
    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(path)
      setForm(f => ({ ...f, photo_url: publicUrl }))
    }
    setPhotoUploading(false)
  }

  async function deletePerson() {
    setDeleting(true)
    // Check if user is flagged first
    const { data: flagged } = await supabase.rpc('is_user_flagged', {
      uid: (await supabase.auth.getUser()).data.user?.id
    })
    if (flagged) {
      alert('Jūsų paskyra laikinai užblokuota dėl įtartinos veiklos. Susisiekite su administratoriumi.')
      setDeleting(false)
      setConfirmDelete(false)
      return
    }
    const { error } = await supabase.from('people').delete().eq('id', person.id)
    if (!error) {
      onPersonDeleted(person.id)
      onClose()
    }
    setDeleting(false)
  }

  async function addSource() {
    if (!newSource.title) return
    const { data, error } = await supabase
      .from('sources')
      .insert({ ...newSource, person_id: person.id })
      .select()
      .single()
    if (!error && data) {
      setSources(prev => [...prev, data])
      setNewSource({ title: '', description: '', url: '' })
    }
  }

  async function addRelationship() {
    if (!relPersonId) return
    let person_a_id = person.id
    let person_b_id = relPersonId
    if (relType === 'parent_child' && relDirection === 'child') {
      person_a_id = relPersonId
      person_b_id = person.id
    }
    const { data, error } = await supabase
      .from('relationships')
      .insert({ person_a_id, person_b_id, relationship_type: relType })
      .select()
      .single()
    if (!error && data) {
      onRelationshipAdded(data)
      setRelPersonId('')
    }
  }

  const getPersonName = (id: string) => {
    const p = people.find(p => p.id === id)
    return p ? `${p.first_name} ${p.last_name ?? ''}`.trim() : 'Nežinomas'
  }

  const tabLabels = { info: 'Info', edit: 'Redaguoti', relationships: 'Ryšiai', sources: 'Šaltiniai' }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-stone-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {person.photo_url ? (
                <img src={person.photo_url} alt={person.first_name}
                  className="w-12 h-12 rounded-full object-cover shrink-0" />
              ) : (
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-semibold shrink-0
                  ${person.gender === 'female' ? 'bg-rose-100 text-rose-600'
                    : person.gender === 'male' ? 'bg-sky-100 text-sky-600'
                    : 'bg-stone-100 text-stone-600'}`}>
                  {person.first_name[0]}{person.last_name?.[0]}
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold text-stone-900">{person.first_name} {person.last_name}</h2>
                {person.birth_date && (
                  <p className="text-sm text-stone-500 mt-0.5">
                    {new Date(person.birth_date).getFullYear()}
                    {person.death_date && ` – ${new Date(person.death_date).getFullYear()}`}
                    {!person.death_date && ' – dabar'}
                  </p>
                )}
              </div>
            </div>
            <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-xl leading-none">✕</button>
          </div>
          <div className="flex gap-1 mt-4">
            {(Object.keys(tabLabels) as Array<keyof typeof tabLabels>).map(t => (
              <button key={t}
                onClick={() => { setTab(t); if (t === 'sources') loadSources() }}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${tab === t ? 'bg-stone-800 text-white' : 'text-stone-500 hover:bg-stone-100'}`}>
                {tabLabels[t]}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4">

          {/* Info */}
          {tab === 'info' && (
            <dl className="space-y-3 text-sm">
              {person.birth_place && <div><dt className="text-stone-500">Gimė</dt><dd className="text-stone-900">{person.birth_place}</dd></div>}
              {person.death_place && <div><dt className="text-stone-500">Mirė</dt><dd className="text-stone-900">{person.death_place}</dd></div>}
              {person.maiden_name && <div><dt className="text-stone-500">Mergautinė pavardė</dt><dd className="text-stone-900">{person.maiden_name}</dd></div>}
              {person.gender && <div><dt className="text-stone-500">Lytis</dt><dd className="text-stone-900">{person.gender === 'male' ? 'Vyras' : person.gender === 'female' ? 'Moteris' : 'Kita'}</dd></div>}
              {person.bio && <div><dt className="text-stone-500 mb-1">Aprašymas</dt><dd className="text-stone-700 leading-relaxed">{person.bio}</dd></div>}
              {!person.birth_place && !person.bio && !person.maiden_name && (
                <p className="text-stone-400 italic">Dar nėra informacijos — spauskite „Redaguoti".</p>
              )}
            </dl>
          )}

          {/* Edit */}
          {tab === 'edit' && (
            <div className="space-y-3">
              {/* Photo */}
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Nuotrauka</label>
                <div className="flex items-center gap-3">
                  {form.photo_url ? (
                    <img src={form.photo_url} alt="" className="w-14 h-14 rounded-full object-cover" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 text-xs">Nėra</div>
                  )}
                  <div className="flex flex-col gap-1">
                    <button type="button" onClick={() => photoInputRef.current?.click()}
                      disabled={photoUploading}
                      className="text-sm px-3 py-1.5 border border-stone-300 rounded-lg hover:bg-stone-50 disabled:opacity-50">
                      {photoUploading ? 'Įkeliama…' : 'Įkelti nuotrauką'}
                    </button>
                    {form.photo_url && (
                      <button type="button" onClick={() => setForm(f => ({ ...f, photo_url: null }))}
                        className="text-xs text-red-500 hover:text-red-700">
                        Pašalinti nuotrauką
                      </button>
                    )}
                  </div>
                  <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Vardas" value={form.first_name ?? ''} onChange={v => setForm(f => ({ ...f, first_name: v }))} />
                <Field label="Pavardė" value={form.last_name ?? ''} onChange={v => setForm(f => ({ ...f, last_name: v }))} />
              </div>
              <Field label="Mergautinė pavardė" value={form.maiden_name ?? ''} onChange={v => setForm(f => ({ ...f, maiden_name: v }))} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Gimimo data" type="date" value={form.birth_date ?? ''} onChange={v => setForm(f => ({ ...f, birth_date: v }))} />
                <Field label="Mirties data" type="date" value={form.death_date ?? ''} onChange={v => setForm(f => ({ ...f, death_date: v }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Gimimo vieta" value={form.birth_place ?? ''} onChange={v => setForm(f => ({ ...f, birth_place: v }))} />
                <Field label="Mirties vieta" value={form.death_place ?? ''} onChange={v => setForm(f => ({ ...f, death_place: v }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Lytis</label>
                <select value={form.gender ?? ''} onChange={e => setForm(f => ({ ...f, gender: e.target.value as Person['gender'] }))}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900">
                  <option value="">Pasirinkti</option>
                  <option value="male">Vyras</option>
                  <option value="female">Moteris</option>
                  <option value="other">Kita</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Aprašymas</label>
                <textarea value={form.bio ?? ''} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  rows={3} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 resize-none" />
              </div>
              <button onClick={saveEdit} disabled={saving}
                className="w-full bg-stone-800 text-white rounded-lg py-2 text-sm font-medium hover:bg-stone-700 disabled:opacity-50">
                {saving ? 'Išsaugoma…' : 'Išsaugoti pakeitimus'}
              </button>

              {/* Delete */}
              <div className="border-t border-stone-100 pt-3">
                {!confirmDelete ? (
                  <button onClick={() => setConfirmDelete(true)}
                    className="w-full border border-red-200 text-red-500 rounded-lg py-2 text-sm hover:bg-red-50 transition-colors">
                    Ištrinti asmenį
                  </button>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                    <p className="text-sm text-red-700 font-medium">Ar tikrai ištrinti {person.first_name} {person.last_name}?</p>
                    <p className="text-xs text-red-500">Šis veiksmas bus užfiksuotas. Sistema aptiks įtartiną veiklą, jei trinsite kitų žmonių sukurtus įrašus.</p>
                    <div className="flex gap-2">
                      <button onClick={() => setConfirmDelete(false)}
                        className="flex-1 border border-stone-300 rounded-lg py-1.5 text-sm text-stone-600 hover:bg-stone-50">
                        Atšaukti
                      </button>
                      <button onClick={deletePerson} disabled={deleting}
                        className="flex-1 bg-red-500 text-white rounded-lg py-1.5 text-sm font-medium hover:bg-red-600 disabled:opacity-50">
                        {deleting ? 'Trinamas…' : 'Taip, ištrinti'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Relationships */}
          {tab === 'relationships' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2 text-stone-900">Esami ryšiai</h3>
                {myRelationships.length === 0 && <p className="text-stone-400 text-sm italic">Dar nėra ryšių.</p>}
                <ul className="space-y-1">
                  {myRelationships.map(r => {
                    const otherId = r.person_a_id === person.id ? r.person_b_id : r.person_a_id
                    const label = r.relationship_type === 'partner' ? 'Partneris'
                      : r.person_a_id === person.id ? 'Tėvas/motina' : 'Vaikas'
                    return (
                      <li key={r.id} className="text-sm flex gap-2">
                        <span className="text-stone-500 w-28 shrink-0">{label}</span>
                        <span className="text-stone-900">{getPersonName(otherId)}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
              <div className="border-t border-stone-100 pt-4">
                <h3 className="text-sm font-medium mb-3 text-stone-900">Pridėti ryšį</h3>
                <div className="space-y-2">
                  <select value={relPersonId} onChange={e => setRelPersonId(e.target.value)}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900">
                    <option value="">Pasirinkti asmenį</option>
                    {people.filter(p => p.id !== person.id).map(p => (
                      <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <select value={relType} onChange={e => setRelType(e.target.value as 'parent_child' | 'partner')}
                      className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900">
                      <option value="parent_child">Tėvas / Vaikas</option>
                      <option value="partner">Partneris</option>
                    </select>
                    {relType === 'parent_child' && (
                      <select value={relDirection} onChange={e => setRelDirection(e.target.value as 'parent' | 'child')}
                        className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900">
                        <option value="parent">Aš esu tėvas/motina</option>
                        <option value="child">Aš esu vaikas</option>
                      </select>
                    )}
                  </div>
                  <button onClick={addRelationship} disabled={!relPersonId}
                    className="w-full bg-stone-800 text-white rounded-lg py-2 text-sm font-medium hover:bg-stone-700 disabled:opacity-50">
                    Pridėti ryšį
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sources */}
          {tab === 'sources' && (
            <div className="space-y-4">
              {sources.length === 0 && <p className="text-stone-400 text-sm italic">Dar nėra šaltinių.</p>}
              <ul className="space-y-3">
                {sources.map(s => (
                  <li key={s.id} className="border border-stone-200 rounded-lg p-3">
                    <p className="font-medium text-sm text-stone-900">{s.title}</p>
                    {s.description && <p className="text-xs text-stone-500 mt-1">{s.description}</p>}
                    {s.url && (
                      <a href={s.url} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline mt-1 block truncate">{s.url}</a>
                    )}
                  </li>
                ))}
              </ul>
              <div className="border-t border-stone-100 pt-4 space-y-2">
                <h3 className="text-sm font-medium text-stone-900">Pridėti šaltinį</h3>
                <Field label="Pavadinimas" value={newSource.title} onChange={v => setNewSource(s => ({ ...s, title: v }))} />
                <Field label="Aprašymas" value={newSource.description} onChange={v => setNewSource(s => ({ ...s, description: v }))} />
                <Field label="Nuoroda (neprivaloma)" value={newSource.url} onChange={v => setNewSource(s => ({ ...s, url: v }))} />
                <button onClick={addSource} disabled={!newSource.title}
                  className="w-full bg-stone-800 text-white rounded-lg py-2 text-sm font-medium hover:bg-stone-700 disabled:opacity-50">
                  Pridėti šaltinį
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; type?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-stone-600 mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white" />
    </div>
  )
}
