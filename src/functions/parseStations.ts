import { StationInfo } from "../types/travelBar";
import dayjs from "dayjs";

export const parseStations = (
  input: string,
  arrivalTime: Date
): StationInfo[] => {
  const lines = input.trim().split("\n");
  const parsedStations = lines.map((line, index) => {
    const [rawName, rawTime] = line.split(": ").map((part) => part.trim());
    return {
      name: rawName,
      arrivalTime: rawTime,
      isOrigin: index === 0 ? true : undefined,
      isDestination: undefined,
    };
  });

  return [
    ...parsedStations,
    {
      name: "מרפא ערבה",
      arrivalTime: dayjs(arrivalTime).format("HH:mm"),
      isOrigin: undefined,
      isDestination: true,
    },
  ];
};
