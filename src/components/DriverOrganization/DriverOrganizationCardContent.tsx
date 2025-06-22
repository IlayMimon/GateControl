import DriverData from "../../types/DriverOrganizationTypes";
import DriverOrganizationCardBreak from "./DriverOrganizationCardBreak";
import DriverOrganizationCardPath from "./DriverOrganizationCardPath";

interface DriverOrganizationCardContentProps {
  driverData: DriverData;
}

const DriverOrganizationCardContent = ({
  driverData,
}: DriverOrganizationCardContentProps) => {
  const paths = driverData.paths.filter((path) => "pathId" in path);

  return (
    <div className="driver-organization-card-content">
      {driverData.paths.map((path, index) => {
        if ("pathId" in path) {
          return (
            <DriverOrganizationCardPath
              key={path.pathId + index}
              color={driverData.color}
              path={path}
              pathIndex={paths.indexOf(path) + 1}
            />
          );
        } else
          return (
            <DriverOrganizationCardBreak
              pathBreak={path}
              key={path.title + index}
            />
          );
      })}
    </div>
  );
};

export default DriverOrganizationCardContent;
