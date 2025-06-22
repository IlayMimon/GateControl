import { Break } from "../../types/DriverOrganizationTypes";

interface DriverOrganizationCardBreakProps {
  pathBreak: Break;
}

const DriverOrganizationCardBreak = ({
  pathBreak: { startTime, endTime, title },
}: DriverOrganizationCardBreakProps) => {
  return (
    <div className="driver-organization-card-content__break">
      <span className="driver-organization-card-content__break__times">{`${startTime} - ${endTime}`}</span>
      <span className="driver-organization-card-content__break__title">
        {title}
      </span>
    </div>
  );
};

export default DriverOrganizationCardBreak;
