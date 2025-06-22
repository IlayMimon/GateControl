const getTotalDrivingTime = (times: { first: string; last: string }[]): string => {
  if (!times.length) return "אין נתונים";

  const toMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const totalMinutes = times
    .map((time) => {
      const firstMinutes = toMinutes(time.first);
      const lastMinutes = toMinutes(time.last);
      return lastMinutes - firstMinutes;
    })
    .reduce((total, num) => total + num, 0);

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (!Number.isFinite(hours) || Number.isNaN(minutes)) return "אירעה שגיאה";

  const parts = [];
  if (hours > 0) parts.push(`${hours} ש’`);
  if (minutes > 0) parts.push(`${minutes} דק’`);

  return parts.length > 0 ? parts.join(" ") : "0 דק’";
};

export default getTotalDrivingTime;
