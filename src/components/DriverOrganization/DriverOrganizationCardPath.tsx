import classNames from "classnames";
import { Path } from "../../types/DriverOrganizationTypes";
import { ColorType } from "../../types/travelBar";

interface DriverOrganizationCardPathProps {
  path: Path;
  pathIndex: number;
  color: ColorType;
}

const DriverOrganizationCardPath = ({
  path,
  pathIndex,
  color,
}: DriverOrganizationCardPathProps) => {
  const styleObject = { "--card-color-primary": `var(--Colors-${color}-3)` };
  return (
    <div
      key={path.pathId}
      style={styleObject as React.CSSProperties}
      className="driver-organization-card-content__path"
    >
      <div className="driver-organization-card-content__path__id__container">
        <span className="driver-organization-card-content__path__id__index">
          {pathIndex.toString()}
        </span>
        <span className="driver-organization-card-content__path__id">
          {"# " + path.pathId}
        </span>
      </div>
      {path.stations.map(({ name, arrivalTime, passengers }, index) => (
        <div
          className={classNames(
            "driver-organization-card-content__path__station",
            name === 'מרפ"א ערבה' && "--marpe-station"
          )}
          key={arrivalTime}
        >
          <div className="driver-organization-card-content__path__station__details">
            <span className="driver-organization-card-content__path__station__details__arrival-time">
              {arrivalTime}
            </span>
            <div className="driver-organization-card-content__path__station__details__name-and-passengers">
              <span>{name}</span>
              <span className="driver-organization-card-content__path__station__details__name-and-passengers__passengers">
                {passengers &&
                  passengers.join(", ") + ` (${passengers.length.toString()})`}
              </span>
            </div>
          </div>
          <div className="driver-organization-card-content__path__station__circle-and-line__container">
            <div className="driver-organization-card-content__path__station__circle-and-line__circle --path-circle"></div>
            {!(path.stations.length === index + 1) && (
              <div className="driver-organization-card-content__path__station__circle-and-line__line"></div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DriverOrganizationCardPath;
