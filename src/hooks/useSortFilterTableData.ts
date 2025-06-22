export const useSortFilterTableData = <T>(
  data: T[],
  filteredInfo: Record<string, any>,
  sortInfo: any,
): T[] => {
  // Apply filtering
  const filteredData = data.filter((item) => {
    for (const key in filteredInfo) {
      const values = filteredInfo[key];
      const actualValue = (item as any)[key];
      if (values && values.length > 0 && !values.includes(actualValue)) {
        return false;
      }
    }
    return true;
  });

  // Apply sorting
  if (sortInfo?.columnKey && sortInfo?.order) {
    const { columnKey, order } = sortInfo;
    filteredData.sort((a, b) => {
      const aVal = (a as any)[columnKey];
      const bVal = (b as any)[columnKey];
      if (aVal === bVal) return 0;
      const result = aVal > bVal ? 1 : -1;
      return order === "ascend" ? result : -result;
    });
  }

  return filteredData;
};