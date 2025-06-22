export type Shuttle = {
    Id: number;
    StartTime: Date;
    ArrivalTime: Date;
    totalDistance: number;
  };
  
  export type Driver = {
    id: number;
    name: string;
    schedule: DriverAssignment[];
  };
  
  export type DriverAssignment = {
    shuttleId: number;
    StartTime: Date;
    ArrivalTime: Date;
    totalDistance: number;
  };
  
  export type ShuttleAssignment = {
    shuttleId: number;
    driverId: number;
    driverName: string;
  };
  