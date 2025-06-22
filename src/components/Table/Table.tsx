import { Table as AntTable, ConfigProvider } from "antd";
import type { ColumnsType, ColumnType, TablePaginationConfig } from "antd/es/table";
import type { FilterValue, SorterResult } from "antd/es/table/interface";
import heIL from "antd/locale/he_IL";
import { useState } from "react";
import { useSortFilterTableData } from "../../hooks/useSortFilterTableData";
import { GenericGroupedTableProps, RenderedCell } from "./TableTypes";

const Table = <T extends object>({ data, columns, rowKey }: GenericGroupedTableProps<T>) => {
  const [sortInfo, setSortInfo] = useState<SorterResult<T>>({});
  const [filteredInfo, setFilteredInfo] = useState<Record<string, FilterValue | null>>({});

  const newData = useSortFilterTableData(data, filteredInfo, sortInfo);

  const handleChange = (_pagination: TablePaginationConfig, filters: Record<string, FilterValue | null>, sorter: SorterResult<T> | SorterResult<T>[]) => {
    setFilteredInfo(filters);
    if (!Array.isArray(sorter)) {
      setSortInfo(sorter);
    }
  };

  const enhancedColumns: ColumnsType<T> = columns.map((col) => {
    const baseCol: ColumnType<T> = {
      key: col.key,
      title: col.title,
      dataIndex: col.dataIndex as string,
      filters: col.filters,
      filteredValue: filteredInfo[col.dataIndex as string] || null,
      onFilter: (value, record) => {
        const actualValue = record[col.dataIndex as keyof T];
        return actualValue?.toString().includes(value.toString()) ?? false;
      },
      sorter: col.sorter
        ? (a, b) => {
          const aValue = a[col.dataIndex as keyof T];
          const bValue = b[col.dataIndex as keyof T];
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        }
        : undefined,
      sortOrder: sortInfo?.columnKey === col.key ? sortInfo.order : null,
      render: (value: T[keyof T], record: T, index: number): RenderedCell => {
        const actualValue =
          col.dataIndex && record ? (record[col.dataIndex as keyof T] as React.ReactNode) : value;

        return col.render ? col.render(actualValue, record, index) : (actualValue ?? null);
      },
    };

    return baseCol;
  });

  return (
    <ConfigProvider locale={heIL} direction="rtl">
      <AntTable<T>
        columns={enhancedColumns}
        dataSource={newData}
        rowKey={rowKey}
        pagination={false}
        onChange={handleChange}
        style={{ height: "100%", overflowY: "auto" }}
      />
    </ConfigProvider>
  );
};

export default Table;
