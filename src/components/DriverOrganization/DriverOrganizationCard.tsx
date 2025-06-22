import { Dayjs } from "dayjs";
import formatDate from "../../functions/formatDate";
import DriverData from "../../types/DriverOrganizationTypes";
import DriverOrganizationCardContent from "./DriverOrganizationCardContent";
import DriverOrganizationCardDetails from "./DriverOrganizationCardDetails";

interface DriverOrganizationCardProps {
  driverData: DriverData;
  index: number;
  chosenDate: Dayjs;
  ref: React.RefObject<HTMLDivElement | null>;
}

const DriverOrganizationCard = ({
  driverData,
  index,
  chosenDate,
  ref,
}: DriverOrganizationCardProps) => {
  return (
    <div
      key={chosenDate.valueOf()}
      ref={ref}
      className="driver-organization-card"
    >
      <div className="driver-organization-card__date">
        <span className="driver-organization-card__date__text">
          {formatDate(chosenDate)}
        </span>
      </div>
      <DriverOrganizationCardDetails driverData={driverData} index={index} />
      <div className="driver-organization-card-content__container">
        <DriverOrganizationCardContent driverData={driverData} />
      </div>
    </div>
  );
};

export default DriverOrganizationCard;
