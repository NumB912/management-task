"use client"
import { SectionCard } from '@/app/(front)/components/sectionCard.component'
import { TaskList } from '@/app/(front)/components/task/taskList.component'
import { useHeader } from '@/app/(front)/providers/header.provider'
import { useWorkspaceStore } from '@/app/(front)/states/workspace.state'
import { use, useEffect, useMemo } from 'react'
import { FilterX } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'

const FilterDetailPage = ({ params }: { params: Promise<{ filterId: string }> }) => {
  const { filterId } = use(params)
  const { setTitle } = useHeader()
  const { listIndex,filterIndex } = useWorkspaceStore()
  const tasks = useWorkspaceStore(useShallow((state)=>state.getTaskFilter(filterId))) 
  useEffect(() => {
    if (filterIndex[filterId]) {
      setTitle(filterIndex[filterId].name)
    }
  }, [filterId, setTitle])

  const tasksByList = useMemo(() => {
    const groups = new Map<string, { listId: string; listName: string; tasks: string[] }>()

    for (const task of tasks) {
      const listId = task.list
      const listName = listIndex[task.list]?.name ?? "..."
      if (!groups.has(listId)) {
        groups.set(listId, { listId, listName, tasks: [] })
      }
      groups.get(listId)!.tasks.push(task.id)
    }

    return Array.from(groups.values())
  }, [listIndex,tasks])

  if (tasksByList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <FilterX className="size-30 opacity-40 text-primary" strokeWidth={2} />
        <p className="text-sm text-gray-400">Không có task nào phù hợp với bộ lọc này</p>
      </div>
    )
  }

  return (
    <div className="flex gap-3 py-3 items-start flex-wrap">
      {tasksByList.map((group) => (
        <SectionCard
          key={group.listId}
          count={group.tasks.length}
          onPlusClick={() => {}}
          title={group.listName}
        >
          <TaskList tasks={group.tasks} />
        </SectionCard>
      ))}
    </div>
  )
}

export default FilterDetailPage