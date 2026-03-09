import { useQuery } from '@tanstack/react-query';
import { Dayjs } from 'dayjs';
import fetchAllSharePointPages from '../../functions/fetchAllSharePointPages';
import { Action } from './useGetActions';

const useGetActionsForDate = (date: Dayjs) => {
  const start = date.startOf('day').toISOString();
  const end = date.endOf('day').toISOString();

  const url =
    `/_api/web/lists/getbytitle('Actions')/items` +
    `?$select=ID,Created,ArmyId/ArmyId,ActionType,Location` +
    `&$expand=ArmyId` +
    `&$filter=Created ge '${start}' and Created lt '${end}'` +
    `&$orderby=Created asc&$top=4999`;

  const { data, isLoading } = useQuery<Action[]>({
    queryKey: ['actions-date', date.format('YYYY-MM-DD')],
    queryFn: () => fetchAllSharePointPages<Action>(url),
  });

  return { data: data ?? [], isLoading };
};

export default useGetActionsForDate;
