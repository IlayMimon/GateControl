import { IconClock, IconRoute, IconRoute2, IconUserCircle } from "@tabler/icons-react";
import getTotalDrivingTime from "../../functions/getTimeDifference";
import DriverData from "../../types/DriverOrganizationTypes";

interface DriverOrganizationCardDetailsProps {
  driverData: DriverData;
  index: number;
}

const DriverOrganizationCardDetails = ({
  driverData,
  index,
}: DriverOrganizationCardDetailsProps) => {
  const details = [
    {
      icon: <IconUserCircle className="driver-organization-card__details__icon" />,
      text: driverData.name || "נהג " + (index + 1).toString(),
    },
    {
      icon: <IconRoute className="driver-organization-card__details__icon" />,
      text: driverData.paths.filter((path) => "pathId" in path).length.toString(),
    },
    {
      icon: <IconRoute2 className="driver-organization-card__details__icon" />,
      text: `${driverData.distance.toString()} ק"מ`,
    },
    {
      icon: <IconClock className="driver-organization-card__details__icon" />,
      text: getTotalDrivingTime(
        driverData.paths
          .filter((path) => "pathId" in path)
          .map((path) => {
            const times = path.stations.map((station) => station.arrivalTime || "00:00");

            return !times.length
              ? { first: "00:00", last: "00:00" }
              : {
                  first: times[0],
                  last: times[times.length - 1],
                };
          })
      ),
    },
  ];

  return (
    <div className="driver-organization-card__details__container">
      {details.map((detail) => (
        <div key={detail.text} className="driver-organization-card__details">
          {detail.icon}
          <span className="driver-organization-card__details__text">{detail.text}</span>
        </div>
      ))}
    </div>
  );
};

export default DriverOrganizationCardDetails;
