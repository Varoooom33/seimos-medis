'use client'

import { useState, useCallback, useMemo } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import type { Person, Relationship } from '@/types'
import PersonNode from './PersonNode'
import PersonModal from './PersonModal'
import AddPersonModal from './AddPersonModal'

interface Props {
  initialPeople: Person[]
  initialRelationships: Relationship[]
}

const nodeTypes = { person: PersonNode }

function buildGraph(people: Person[], relationships: Relationship[]) {
  const SPACING_X = 220
  const SPACING_Y = 160

  const nodes: Node[] = people.map((p, i) => ({
    id: p.id,
    type: 'person',
    position: { x: (i % 4) * SPACING_X, y: Math.floor(i / 4) * SPACING_Y },
    data: { person: p },
  }))

  const edges: Edge[] = relationships.map(r => ({
    id: r.id,
    source: r.person_a_id,
    target: r.person_b_id,
    type: 'smoothstep',
    label: r.relationship_type === 'partner' ? '♥' : '',
    style: r.relationship_type === 'partner'
      ? { stroke: '#e11d48', strokeDasharray: '5,5' }
      : { stroke: '#78716c' },
    markerEnd: r.relationship_type === 'parent_child'
      ? { type: MarkerType.ArrowClosed, color: '#78716c' }
      : undefined,
  }))

  return { nodes, edges }
}

export default function FamilyTreeClient({ initialPeople, initialRelationships }: Props) {
  const [people, setPeople] = useState<Person[]>(initialPeople)
  const [relationships, setRelationships] = useState<Relationship[]>(initialRelationships)
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => buildGraph(people, relationships),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  useMemo(() => {
    const { nodes: n, edges: e } = buildGraph(people, relationships)
    setNodes(n)
    setEdges(e)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [people, relationships])

  const onConnect = useCallback(
    (params: Connection) => setEdges(eds => addEdge(params, eds)),
    [setEdges]
  )

  function onNodeClick(_: React.MouseEvent, node: Node) {
    const person = people.find(p => p.id === node.id)
    if (person) setSelectedPerson(person)
  }

  function handlePersonUpdated(updated: Person) {
    setPeople(prev => prev.map(p => p.id === updated.id ? updated : p))
    setSelectedPerson(updated)
  }

  function handlePersonAdded(person: Person) {
    setPeople(prev => [...prev, person])
  }

  function handleRelationshipAdded(rel: Relationship) {
    setRelationships(prev => [...prev, rel])
  }

  if (people.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-stone-500">
        <p className="text-lg">Nėra žmonių — pridėkite pirmą šeimos narį!</p>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-stone-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-stone-700 transition-colors"
        >
          + Pridėti asmenį
        </button>
        {showAddModal && (
          <AddPersonModal
            people={people}
            onClose={() => setShowAddModal(false)}
            onPersonAdded={handlePersonAdded}
            onRelationshipAdded={handleRelationshipAdded}
          />
        )}
      </div>
    )
  }

  return (
    <div className="flex-1 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
      >
        <Background color="#d6d3d1" gap={24} />
        <Controls />
        <MiniMap nodeStrokeWidth={3} zoomable pannable />
      </ReactFlow>

      <button
        onClick={() => setShowAddModal(true)}
        className="absolute top-4 right-4 z-10 bg-stone-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-stone-700 transition-colors shadow-md"
      >
        + Pridėti asmenį
      </button>

      {selectedPerson && (
        <PersonModal
          person={selectedPerson}
          people={people}
          relationships={relationships}
          onClose={() => setSelectedPerson(null)}
          onPersonUpdated={handlePersonUpdated}
          onRelationshipAdded={handleRelationshipAdded}
        />
      )}

      {showAddModal && (
        <AddPersonModal
          people={people}
          onClose={() => setShowAddModal(false)}
          onPersonAdded={handlePersonAdded}
          onRelationshipAdded={handleRelationshipAdded}
        />
      )}
    </div>
  )
}
