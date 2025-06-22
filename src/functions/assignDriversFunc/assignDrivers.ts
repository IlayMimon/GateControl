import { canAssignShuttle } from "./canAssignDriver";
import { Driver, Shuttle, ShuttleAssignment } from "../../types/assignDriversTypes";
import { patchItemInList } from "../postToSharepoint";

function getTotalKm(driver: Driver): number {
    return driver.schedule.reduce((sum, a) => sum + a.totalDistance, 0);
  }
  
export function assignShuttlesToDrivers(shuttles: Shuttle[], drivers: Driver[]) {
    const result: ShuttleAssignment[] = [];
    console.log("assignShuttlesToDrivers called", shuttles, drivers);
    // מיון השאטלים לפי זמן התחלה
    const sortedShuttles = shuttles.sort((a, b) => new Date(a.StartTime).getTime() - new Date(b.StartTime).getTime());

    console.log("Sorted Shuttles:", sortedShuttles);
    for (const shuttle of sortedShuttles) {
      let assigned = false;
      
      // מתחיל מהנהגים עם הכי פחות קילומטרים
      const sortedDrivers = [...drivers].sort((a, b) => getTotalKm(a) - getTotalKm(b));
  
      for (const driver of sortedDrivers) {
        if (canAssignShuttle(driver, shuttle)) {
          // אם הנהג יכול לקבל את השאטל, מוסיף אותו ללוח הזמנים של הנהג
          driver.schedule.push({
            shuttleId: shuttle.Id,
            StartTime: shuttle.StartTime,
            ArrivalTime: shuttle.ArrivalTime,
            totalDistance: shuttle.totalDistance
          });
  
          result.push({
            shuttleId: shuttle.Id,
            driverId: driver.id,
            driverName: driver.name
          });
          
          assigned = true;
          break;
        }
      }
  
      if (!assigned) {
        console.warn(`לא נמצא נהג זמין לנסיעה ${shuttle.Id}`);
      }
    }
    
    for (const driver of drivers) {
      patchItemInList('driversData', {Distance: 0}, driver.id, '*')
        if (driver.schedule.length !== 0) {
          patchItemInList('driversData', {Distance: getTotalKm(driver)}, driver.id, '*')
        }
    }
    for (const assignment of result) {
        patchItemInList('Shuttles', {driverDataId: assignment.driverId}, assignment.shuttleId, '*')
    }
    patchItemInList("Status", {isAssigned: true}, 1, '*')
  }
