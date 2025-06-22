import { useMemo } from "react";
import { assignedStatusEnum, patientsStatus } from "../functions/patientsStatus";
import useGetShuttleDetailsPerRequest from "../hooks/data/useGetShuttleDetailsPerRequest";
import useGetShuttleRequests from "../hooks/data/useGetShuttleRequests";
import useGetShuttles from "../hooks/data/useGetShuttles";
import Kpi from "./Kpi";
import SummarizeNumbers from "./SummarizeNumbers";

const Kpies = () => {
  const shuttleRequests = useGetShuttleRequests();
  const shuttleDetailsPerRequest = useGetShuttleDetailsPerRequest();
  const {shuttles} = useGetShuttles();

  const patientStatuses = useMemo(
    () => patientsStatus({ shuttleDetailsPerRequest, shuttles, shuttleRequests }),
    [shuttleDetailsPerRequest, shuttles, shuttleRequests]
  );

  const statuses = Object.keys(assignedStatusEnum).map((assignedStatus) => {
    return {
      statusType: assignedStatus,
      value:
        patientStatuses?.filter(
          (patient) =>
            patient.status === assignedStatusEnum[assignedStatus as keyof typeof assignedStatusEnum]
        ).length || 0,
    };
  });

  return (
    <div className="kpies">
      <SummarizeNumbers totalPatients={patientStatuses?.length} totalTrips={shuttles?.length} />
      <div className="kpies__seperator" />
      <Kpi
        title="טרם שובצו"
        value={statuses.find((status) => status.statusType === "initial")?.value}
        titleColor="--Colors-orange-6"
        borderColor="--Colors-orange-3"
      />
      <Kpi
        title="שובצו"
        value={statuses.find((status) => status.statusType === "assigned")?.value}
        titleColor="--Colors-purple-6"
        borderColor="--Colors-purple-3"
      />
      <Kpi
        title="נשלחה הודעה"
        value={0}
        titleColor="--Colors-green-6"
        borderColor="--Colors-green-3"
      />
      <div className="kpies__seperator" />
      <Kpi
        title="מגיעים בקרוב"
        value={statuses.find((status) => status.statusType === "arrivingSoon")?.value}
        titleColor="--Colors-cyan-6"
        borderColor="--Colors-cyan-3"
      />
      <Kpi
        title="במרפאה"
        value={statuses.find((status) => status.statusType === "inClinic")?.value}
        titleColor="--Colors-green-6"
        borderColor="--Colors-green-3"
      />
      <div className="kpies__seperator" />
      <Kpi
        title="מסיימים בקרוב"
        value={0}
        titleColor="--Colors-geekblue-6"
        borderColor="--Colors-geekblue-3"
      />
      <Kpi
        title="ממתינים לחזור"
        value={0}
        titleColor="--Colors-orange-6"
        borderColor="--Colors-orange-3"
      />
      <Kpi
        title="חזרו"
        value={statuses.find((status) => status.statusType === "done")?.value}
        titleColor="--Colors-green-6"
        borderColor="--Colors-green-3"
      />
    </div>
  );
};

export default Kpies;
