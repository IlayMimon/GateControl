import { Driver, Shuttle } from "../../types/assignDriversTypes";

export function canAssignShuttle(driver: Driver, shuttle: Shuttle): boolean {
    // מיון לפי זמן
    const assignments = driver.schedule.sort((a, b) => new Date(a.StartTime).getTime() - new Date(b.StartTime).getTime());

    // בדוק האם יש חפיפה בזמנים
    for (const assignment of assignments) {
      if (
        new Date(shuttle.StartTime).getTime() < new Date(assignment.ArrivalTime).getTime() &&  
        new Date(shuttle.ArrivalTime).getTime() > new Date(assignment.StartTime).getTime()   
      ) {
        return false;
      }
    }
  
    // חישוב זמן נהיגה רצוף
    const fourHours = 4 * 60 * 60 * 1000;
    const HalfAnHour = 30 * 60 * 1000;
    const recentAssignments = assignments.filter(
      a => new Date(shuttle.StartTime).getTime() - new Date(a.ArrivalTime).getTime() <= HalfAnHour
    );
  
    let totalDriveTime = 0;
    for (const a of recentAssignments) {
      totalDriveTime += new Date(a.ArrivalTime).getTime() - new Date(a.StartTime).getTime();
    }
  
    // אם עבר 4 שעות - הפסקה 
    return totalDriveTime <= fourHours;
  }
   