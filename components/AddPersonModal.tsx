'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Person, Relationship } from '@/types'

interface Props {
  people: Person[]
  onClose: () => void
  onPersonAdded: (p: Person) => void
  onRelationshipAdded: (r: Relationship) => void
}

export default function AddPersonModal({ people, onClose, onPersonAdded, onRelationshipAdded }: Props) {
  const [form, setForm] = useState({
    first_name: '', last_name: '', maiden_name: '',
    birth_date: '', death_date: '', birth_place: '', death_place: '',
    gender: '' as Person['gender'] | '',
    bio: '',
  })
  const [relPersonId, setRelPersonId] = useState('')
  const [relType, setRelType] = useState<'parent_child' | 'partner'>('parent_child')
  const [relDirection, setRelDirection] = useState<'parent' | 'child'>('parent')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.first_name) return
    setSaving(true)
    setError('')

    const { data: person, error: personError } = await supabase
      .from('people')
      .insert({
        first_name: form.first_name,
        last_name: form.last_name || null,
        maiden_name: form.maiden_name || null,
        birth_date: form.birth_date || null,
        death_date: form.death_date || null,
        birth_place: form.birth_place || null,
        death_place: form.death_place || null,
        gender: form.gender || null,
        bio: form.bio || null,
      })
      .select()
      .single()

    if (personError || !person) {
      setError(personError?.message ?? 'Nepavyko pridėti asmens')
      setSaving(false)
      return
    }

    onPersonAdded(person)

    if (relPersonId) {
      let person_a_id = person.id
      let person_b_id = relPersonId

      if (relType === 'parent_child' && relDirection === 'child') {
        person_a_id = relPersonId
        person_b_id = person.id
      }

      const { data: rel } = await supabase
        .from('relationships')
        .insert({ person_a_id, person_b_id, relationship_type: relType })
        .select()
        .single()

      if (rel) onRelationshipAdded(rel)
    }

    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-4 border-b border-stone-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-900">Pridėti asmenį</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-xl leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Vardas *" value={form.first_name} onChange={v => setForm(f => ({ ...f, first_name: v }))} />
            <Field label="Pavardė" value={form.last_name} onChange={v => setForm(f => ({ ...f, last_name: v }))} />
          </div>
          <Field label="Mergautinė pavardė" value={form.maiden_name} onChange={v => setForm(f => ({ ...f, maiden_name: v }))} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Gimimo data" type="date" value={form.birth_date} onChange={v => setForm(f => ({ ...f, birth_date: v }))} />
            <Field label="Mirties data" type="date" value={form.death_date} onChange={v => setForm(f => ({ ...f, death_date: v }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Gimimo vieta" value={form.birth_place} onChange={v => setForm(f => ({ ...f, birth_place: v }))} />
            <Field label="Mirties vieta" value={form.death_place} onChange={v => setForm(f => ({ ...f, death_place: v }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Lytis</label>
            <select
              value={form.gender ?? ''}
              onChange={e => setForm(f => ({ ...f, gender: e.target.value as Person['gender'] }))}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 bg-white"
            >
              <option value="">Pasirinkti</option>
              <option value="male">Vyras</option>
              <option value="female">Moteris</option>
              <option value="other">Kita</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Aprašymas</label>
            <textarea
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              rows={2}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 resize-none bg-white"
            />
          </div>

          {people.length > 0 && (
            <div className="border-t border-stone-100 pt-3 space-y-2">
              <p className="text-xs font-medium text-stone-600">Susieti su esamu asmeniu (neprivaloma)</p>
              <select
                value={relPersonId}
                onChange={e => setRelPersonId(e.target.value)}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 bg-white"
              >
                <option value="">Nesusieti</option>
                {people.map(p => (
                  <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                ))}
              </select>
              {relPersonId && (
                <div className="flex gap-2">
                  <select
                    value={relType}
                    onChange={e => setRelType(e.target.value as 'parent_child' | 'partner')}
                    className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 bg-white"
                  >
                    <option value="parent_child">Tėvas / Vaikas</option>
                    <option value="partner">Partneris</option>
                  </select>
                  {relType === 'parent_child' && (
                    <select
                      value={relDirection}
                      onChange={e => setRelDirection(e.target.value as 'parent' | 'child')}
                      className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 bg-white"
                    >
                      <option value="parent">Naujas asmuo yra tėvas/motina</option>
                      <option value="child">Naujas asmuo yra vaikas</option>
                    </select>
                  )}
                </div>
              )}
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-stone-300 rounded-lg py-2 text-sm text-stone-700 hover:bg-stone-50"
            >
              Atšaukti
            </button>
            <button
              type="submit"
              disabled={saving || !form.first_name}
              className="flex-1 bg-stone-800 text-white rounded-lg py-2 text-sm font-medium hover:bg-stone-700 disabled:opacity-50"
            >
              {saving ? 'Pridedama…' : 'Pridėti asmenį'}
            </button>
          </div>
        </form>
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
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white"
      />
    </div>
  )
}
