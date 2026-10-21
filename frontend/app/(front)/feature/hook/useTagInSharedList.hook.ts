import { useWorkspaceStore } from "../store/workspace.state";

export function useTagInSharedList(name: string | undefined) {
  return useWorkspaceStore((state) =>
    !!name && Object.values(state.taskIndex).some(
      (task) => state.listIndex[task.list]?.isShareList === true &&
        task.rule?.tags?.includes(name),
    ),
  );
}
