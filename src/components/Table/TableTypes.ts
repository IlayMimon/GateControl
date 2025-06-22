import { ColumnType } from "antd/es/table";
import dayjs from "dayjs";
import { CSSProperties, ReactNode } from "react";

export interface TableColumn<T> extends Omit<ColumnType<T>, "dataIndex"> {
  key: string;
  title: string;
  dataIndex?: string | number | (string | number)[];
  render?: (value: any, record: T, index: number) => React.ReactNode;
}

export interface GenericGroupedTableProps<T> {
  data: T[];
  groupBy?: (record: T) => string;
  columns: TableColumn<T>[];
  rowKey: (record: T) => number;
}

export type CellType = {
  colSpan?: number;
  rowSpan?: number;
  style?: CSSProperties;
  className?: string;
  title?: string;
};

export type RenderedCell =
  | ReactNode
  | {
    children?: ReactNode;
    props?: CellType;
  };

export type TableRow = {
  id: number;
  requestDetailsId: number;
  shuttleId: number;
  fullName: string;
  status: string;
  phone: string;
  appointmentType: string[];
  station: string;
  area: string;
  pickupTime?: dayjs.Dayjs;
  estimatedArrival?: dayjs.Dayjs;
  desiredArrival?: dayjs.Dayjs;
  outboundGap?: number;
  estimatedFinish?: dayjs.Dayjs;
  finishTime?: dayjs.Dayjs;
  inboundTime?: dayjs.Dayjs;
  inboundGap?: number;
  driver: string;
  notes?: string;
  actions: string;
};
