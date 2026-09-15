"use client"
import { SectionCard } from '@/app/(front)/components/sectionCard.component'
import { TaskList } from '@/app/(front)/components/task/taskList.component'
import { useHeader } from '@/app/(front)/providers/header.provider'
import { useWorkspaceStore } from '@/app/(front)/states/workspace.state'
import { use, useEffect, useMemo } from 'react'
import { FilterX } from 'lucide-react'

const FilterDetailPage = ({ params }: { params: Promise<{ filterId: string }> }) => {
  const { filterId } = use(params)
  const { setTitle } = useHeader()
  const { listInfo,getTaskFilter,filterInfo } = useWorkspaceStore()
  useEffect(() => {
    if (filterInfo[filterId]) {
      setTitle(filterInfo[filterId].name)
    }
  }, [filterId, setTitle])

  const tasksByList = useMemo(() => {
    const tasks = getTaskFilter(filterInfo[filterId]) ?? []
    const groups = new Map<string, { listId: string; listName: string; tasks: typeof tasks }>()

    for (const task of tasks) {
      const listId = task.list
      const listName = listInfo[task.list]?.list.name ?? "..."

      if (!groups.has(listId)) {
        groups.set(listId, { listId, listName, tasks: [] })
      }
      groups.get(listId)!.tasks.push(task)
    }

    return Array.from(groups.values())
  }, [listInfo])

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