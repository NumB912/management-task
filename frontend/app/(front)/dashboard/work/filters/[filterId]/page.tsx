"use client"
import { SectionCard } from '@/app/(front)/components/sectionCard.component'
import { TaskList } from '@/app/(front)/components/task/taskList.component'
import { useHeader } from '@/app/(front)/providers/header.provider'
import { useWorkspaceStore } from '@/app/(front)/feature/store/workspace.state'
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
      setTitle(`Bộ lọc ${filterIndex[filterId].name}`)
    }
  }, [filterId, filterIndex, setTitle])

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
      <div className="flex min-w-0 flex-col items-center justify-center gap-3 px-2 py-12 text-center sm:py-16">
        <FilterX className="size-30 opacity-40 text-primary" strokeWidth={2} />
        <p className="text-sm text-gray-400">Không có task nào phù hợp với bộ lọc này</p>
      </div>
    )
  }

  return (
    <div className="grid w-full min-w-0 grid-cols-1 items-start gap-3 py-2 min-[1100px]:grid-cols-2 min-[1500px]:grid-cols-3">
      {tasksByList.map((group) => (
        <SectionCard
          key={group.listId}
          responsive
          count={group.tasks.length}
          title={group.listName}
        >
          <TaskList tasks={group.tasks} />
        </SectionCard>
      ))}
    </div>
  )
}

export default FilterDetailPage
