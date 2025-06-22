import { Driver } from "../types/assignDriversTypes";

export const initDrivers = (numberOfDrivers: number) => {
    const drivers: Driver[] = [];
    
    for (let i = 1; i <= numberOfDrivers; i++) {
      drivers.push({
        id: i,
        name: `Driver ${i}`,
        schedule: [],
      });
    }
    
    return drivers;
  };