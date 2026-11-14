import { useCallback, useMemo, useState } from 'react';

export function useTaskSelection(visibleIds: string[]) {
  const [selected, setSelected] = useState<string[]>([]);

  const visibleSet = useMemo(() => new Set(visibleIds), [visibleIds]);
  const effective = useMemo(() => selected.filter((id) => visibleSet.has(id)), [selected, visibleSet]);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const selectAll = useCallback(() => setSelected(visibleIds), [visibleIds]);
  const clear = useCallback(() => setSelected([]), []);
  const remove = useCallback((ids: string[]) => {
    setSelected((prev) => prev.filter((id) => !ids.includes(id)));
  }, []);

  return {
    selected: effective,
    count: effective.length,
    allSelected: visibleIds.length > 0 && effective.length === visibleIds.length,
    toggle,
    selectAll,
    clear,
    remove,
    isSelected: (id: string) => effective.includes(id),
  };
}
