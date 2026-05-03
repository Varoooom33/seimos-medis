import { Handle, Position } from 'reactflow'
import type { Person } from '@/types'

interface Props {
  data: { person: Person }
  selected: boolean
}

export default function PersonNode({ data: { person }, selected }: Props) {
  const initials = [person.first_name[0], person.last_name?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase()

  const isDeceased = !!person.death_date
  const bgColor = person.gender === 'female' ? 'bg-rose-50 border-rose-200'
    : person.gender === 'male' ? 'bg-sky-50 border-sky-200'
    : 'bg-stone-50 border-stone-200'

  return (
    <div className={`
      rounded-xl border-2 px-4 py-3 w-44 cursor-pointer shadow-sm
      transition-all duration-150
      ${bgColor}
      ${selected ? 'ring-2 ring-stone-800 ring-offset-2' : 'hover:shadow-md'}
      ${isDeceased ? 'opacity-70' : ''}
    `}>
      <Handle type="target" position={Position.Top} className="!bg-stone-400" />
      <Handle type="source" position={Position.Bottom} className="!bg-stone-400" />
      <Handle type="target" position={Position.Left} className="!bg-rose-400" id="left" />
      <Handle type="source" position={Position.Right} className="!bg-rose-400" id="right" />

      <div className="flex items-center gap-2">
        {person.photo_url ? (
          <img
            src={person.photo_url}
            alt={person.first_name}
            className="w-9 h-9 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0
            ${person.gender === 'female' ? 'bg-rose-200 text-rose-700'
              : person.gender === 'male' ? 'bg-sky-200 text-sky-700'
              : 'bg-stone-200 text-stone-600'}`}>
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <p className="font-medium text-sm text-stone-900 truncate leading-tight">
            {person.first_name} {person.last_name}
          </p>
          {person.birth_date && (
            <p className="text-xs text-stone-500 truncate">
              g. {new Date(person.birth_date).getFullYear()}
              {isDeceased && ` – ${new Date(person.death_date!).getFullYear()}`}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
