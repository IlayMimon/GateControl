import { Dayjs } from "dayjs";

const formatDate = (date: Dayjs): string => {
  const hebrewDays = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
  const dayOfWeek = date.day(); // Day.js method, returns 0 (Sunday) to 6 (Saturday)
  const hebrewDay = hebrewDays[dayOfWeek];

  const formatted = date.format("DD.MM.YY");

  return `יום ${hebrewDay}’ ${formatted}`;
};

export default formatDate;
