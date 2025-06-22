import { ColorType, StationInfo } from "./travelBar";

interface DriverData {
  name?: string;
  distance: number;
  paths: (Path | Break)[];
  color: ColorType;
}

export interface Path {
  pathId: number;
  stations: StationInfo[];
}

export interface Break {
  startTime: string;
  endTime: string;
  title: string;
}

export default DriverData;
