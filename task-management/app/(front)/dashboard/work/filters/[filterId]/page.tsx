"use client"
import { SectionCard } from '@/app/(front)/components/sectionCard.component'
import { TaskList } from '@/app/(front)/components/task/taskList.component'
import { filterApi } from '@/app/(front)/feature/api/filters/filter.api'
import { useHeader } from '@/app/(front)/providers/header.provider'
import { useMutation, useQueries, useQuery } from '@tanstack/react-query'
import React, { use, useEffect } from 'react'

const page = ({ params }: { params: Promise<{ filterId: string }> }) => {
  const { filterId } = use(params);
  const { setTitle } = useHeader()
  const { data, isPending } = useQuery({
    queryFn: () => filterApi.getById(filterId),
    queryKey: ["detail", "filter", filterId]
  })
  useEffect(() => {
    if (data) {
      setTitle(data.filter.name)
    }
  }, [filterId, data])
  return (
    <div className="flex gap-3 py-3">
      <SectionCard count={data?.tasks.length ?? 0} onPlusClick={() => {
      }} title="Quá hạn">
        <TaskList tasks={data?.tasks ?? []} />
      </SectionCard>

    </div>
  )
}

export default page