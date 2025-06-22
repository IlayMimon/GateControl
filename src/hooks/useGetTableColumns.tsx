import { TripDirection } from "../components/HomeScreenBody";
import RowActions from "../components/RowActions";
import { TableColumn, TableRow } from "../components/Table/TableTypes";
import dayjs from "dayjs";
import TimeDeviation from "../components/TimeDeviation";
import useGetStations from "./data/useGetStations";

const formatTime = (value: dayjs.Dayjs | undefined) => {
  return value ? dayjs(value).format("HH:mm") : null;
};

const useGetTableColumns = (tripDirection: TripDirection) => {
  const areas = Array.from(
    new Set(useGetStations()?.map((station) => station.Area))
  );

  const directionColumns: TableColumn<TableRow>[] =
    tripDirection === "outbound"
      ? [
          {
            key: "appointmentType",
            title: "סוג תור",
            dataIndex: "appointmentType",
            render: (types: string[]) => types?.join(", "),
          },
          {
            key: "rideId",
            title: "מס״ד נסיעה",
            dataIndex: "rideId",
            sorter: true,
          },
          {
            key: "station",
            title: "תחנה",
            dataIndex: "station",
          },
          {
            key: "area",
            title: "אזור",
            dataIndex: "area",
            filters: areas.map((area) => ({ text: area, value: area })),
            sorter: true,
          },
          {
            key: "pickupTime",
            title: "שעת איסוף",
            dataIndex: "pickupTime",
            render: (value) => formatTime(value),
          },
          {
            key: "estimatedArrival",
            title: "הגעה משוערת",
            dataIndex: "estimatedArrival",
            render: (value) => formatTime(value),
          },
          {
            key: "desiredArrival",
            title: "הגעה רצויה",
            dataIndex: "desiredArrival",
            render: (value) => formatTime(value),
          },
          {
            key: "outboundGap",
            title: "פער",
            dataIndex: "outboundGap",
            render: (value: number) => <TimeDeviation value={value} />,
          },
          {
            key: "driver",
            title: "נהג",
            dataIndex: "driver",
          },
        ]
      : [
          {
            key: "returnStation",
            title: "תחנת חזרה",
            dataIndex: "returnStation",
          },
          {
            key: "returnArea",
            title: "אזור חזרה",
            dataIndex: "returnArea",
            filters: areas.map((area) => ({ text: area, value: area })),
            sorter: true,
          },
          {
            key: "estimatedFinish",
            title: "סיום משוער",
            dataIndex: "estimatedFinish",
            render: (value) => formatTime(value),
          },
          {
            key: "finishTime",
            title: "שעת סיום",
            dataIndex: "finishTime",
            render: (value) => formatTime(value),
          },
          {
            key: "inboundTime",
            title: "שעת חזרה",
            dataIndex: "inboundTime",
            render: (value) => formatTime(value),
          },
          {
            key: "inboundGap",
            title: "פער",
            dataIndex: "inboundGap",
            render: (value: number) => <TimeDeviation value={value} />,
          },
          {
            key: "returnDriver",
            title: "נהג",
            dataIndex: "returnDriver",
          },
        ];

  const columns: TableColumn<TableRow>[] = [
    {
      key: "fullName",
      title: "שם מלא",
      dataIndex: "fullName",
      sorter: true,
    },
    {
      key: "status",
      title: "סטטוס",
      dataIndex: "status",
      filters: [
        { text: "מאושר", value: "מאושר" },
        { text: "ממתין לאישור", value: "ממתין לאישור" },
        { text: "בוטל", value: "בוטל" },
      ],
      sorter: true,
    },
    {
      key: "phone",
      title: "טלפון",
      dataIndex: "phone",
    },
    ...directionColumns,
    {
      key: "notes",
      title: "הערות",
      dataIndex: "notes",
    },
    {
      key: "actions",
      title: "פעולות",
      dataIndex: "actions",
      render: (_value, row) => (
        <RowActions rowData={row} tripDirection={tripDirection} />
      ),
    },
  ];

  return columns;
};

export default useGetTableColumns;
