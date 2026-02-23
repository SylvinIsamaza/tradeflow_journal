"use client";

import PlaybookView from "@/components/views/PlaybookView";
import { useApp } from "@/app/AppContext";
import { useStrategies, useCreateStrategy, useUpdateStrategy, useDeleteStrategy, useTrades } from "@/lib/hooks";

export default function PlaybooksPage() {
  const { selectedAccount } = useApp();
  const { data: strategies = [], isLoading } = useStrategies(selectedAccount?.id);
  const { data: trades = [] } = useTrades({ account_id: selectedAccount?.id });
  const createMutation = useCreateStrategy();
  const updateMutation = useUpdateStrategy();
  const deleteMutation = useDeleteStrategy();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <PlaybookView
      strategies={strategies}
      trades={trades}
      onAddStrategy={(s) => createMutation.mutate({ ...s, account_id: selectedAccount?.id || '' })}
      onUpdateStrategy={(s) => updateMutation.mutate({ id: s.id, data: s })}
      onDeleteStrategy={(id) => deleteMutation.mutate(id)}
    />
  );
}
