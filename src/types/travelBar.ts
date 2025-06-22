import { Shuttle } from "../hooks/data/useGetShuttles";

export type ColorType = "purple" | "cyan" | "orange";

export interface StationInfo {
  name: string;
  arrivalTime: string;
  passengers?: string[];
  isOrigin?: boolean;
  isDestination?: boolean;
}

export interface TravelItem extends Shuttle {
  code: string;
  colorType: ColorType;
  stations: StationInfo[];
}

export interface TravelBarProps {
  title?: string;
  initialItems?: TravelItem[];
}
export type Driver = {
  ID: number;
  Title: string;
};

export interface IDriverDropdownProps {
  color: ColorType;
  isOpen: boolean;
  availableDrivers: Driver[];
  assignDriver: (color: ColorType, driverId: number) => void;
  isDriverAssigned: (driverId: number, currentColor: ColorType) => boolean;
}

export interface DriverFilterButtonProps {
  drivers: Driver[];
  selectedDriver?: Driver;
  placeholder: string;
  kilometers: number;
  color: ColorType;
  isActive: boolean;
  isUpdatingDriver: boolean;
  isDriverAssigned: boolean;
  toggleFilter: (color: ColorType) => void;
  assignDriver: (color: ColorType, driverId: number) => void;
  isDriverAssignedFunc: (driverId: number, currentColor: ColorType) => boolean;
}
