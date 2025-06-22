import { Dayjs } from 'dayjs';

const filterByToday = (date: Dayjs, columnName: string): string => {
  const startOfDay = date.utc().startOf('day').toISOString();
  const endOfDay = date.utc().endOf('day').toISOString();

  return `$filter=${columnName} ge datetime'${startOfDay}' and ${columnName} lt datetime'${endOfDay}'`;
};

export default filterByToday;
