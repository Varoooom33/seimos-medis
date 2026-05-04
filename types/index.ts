export interface Person {
  id: string
  first_name: string
  last_name: string | null
  maiden_name: string | null
  birth_date: string | null
  death_date: string | null
  birth_place: string | null
  death_place: string | null
  gender: 'male' | 'female' | 'other' | null
  bio: string | null
  photo_url: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Relationship {
  id: string
  person_a_id: string
  person_b_id: string
  relationship_type: 'parent_child' | 'partner' | 'sibling'
  created_at: string
}

export interface Source {
  id: string
  person_id: string
  title: string
  description: string | null
  url: string | null
  file_url: string | null
  created_by: string | null
  created_at: string
}
