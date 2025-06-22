import { IconBusStop, IconRoute, IconUsersGroup } from "@tabler/icons-react";
import Kpi from "./Kpi";

interface ISummarizeNumbersProps {
  totalPatients?: number;
  totalStations?: number;
  totalTrips?: number;
}

const SummarizeNumbers = ({ totalPatients, totalStations, totalTrips }: ISummarizeNumbersProps) => {
  return (
    <div className="summarize-numbers">
      <Kpi title={`סה"כ מטופלים`} value={totalPatients || 0} icon={<IconUsersGroup />} />
      <Kpi title={`סה"כ תחנות`} value={totalStations || 0} icon={<IconBusStop />} />
      <Kpi title={`סה"כ נסיעות`} value={totalTrips || 0} icon={<IconRoute />} />
    </div>
  );
};

export default SummarizeNumbers;
