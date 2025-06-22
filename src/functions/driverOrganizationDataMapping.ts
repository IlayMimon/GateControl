import DriverData from "../types/DriverOrganizationTypes";
import { ColorType, Driver, StationInfo, TravelItem } from "../types/travelBar";
import dayjs from "dayjs";

const driverOrganizationDataMapping = (
  items: TravelItem[],
  drivers: Driver[],
  driverAssignments: Record<ColorType, number | null>
): DriverData[] => {
  return Object.keys(driverAssignments).map((driverColor) => {
    const driverItems = items.filter((item) => item.colorType === driverColor);

    if (driverItems.length > 0) {
      return {
        name: drivers.find((driver) => driver.ID === driverAssignments[driverColor as ColorType])
          ?.Title,
        paths: driverItems.map((path: TravelItem) => {
          return path.ID === 0
            ? {
                startTime: dayjs(path.StartTime).format("HH:mm"),
                endTime: dayjs(path.ArrivalTime).format("HH:mm"),
                title: path.code,
              }
            : {
                pathId: path.ID,
                stations: path.stations.map((station: StationInfo) => {
                  return { ...station, stationName: station.name };
                }),
              };
        }),
        distance: driverItems[0].totalDistance,
        color: driverItems[0].colorType,
      };
    }

    return {
      name: undefined,
      paths: [],
      distance: 0,
      color: driverColor as ColorType,
    };
  });
};

export default driverOrganizationDataMapping;
