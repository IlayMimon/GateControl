import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import fetchAllSharePointPages from '../../functions/fetchAllSharePointPages';

export type Action = {
  ID: number;
  Created: Date;
  ArmyId: { ArmyId: string };
  ActionType: string;
  Location: string;
};

const useGetActions = (todayOnly = false) => {
  const todayFilter = todayOnly
    ? `&$filter=Created ge '${dayjs().startOf('day').toISOString()}' and Created lt '${dayjs()
        .endOf('day')
        .toISOString()}'`
    : '';

  // $top=500 keeps each page well under SharePoint's 5000-item threshold
  const firstPageUrl =
    "/_api/web/lists/getbytitle('Actions')/items?$select=ID,Created,ArmyId/ArmyId,ActionType,Location&$expand=ArmyId" +
    todayFilter +
    '&$top=500';

  const { data, isLoading, refetch } = useQuery<Action[]>({
    queryKey: [firstPageUrl],
    queryFn: () => fetchAllSharePointPages<Action>(firstPageUrl),
  });

  return { data, isLoading, refetch };
};

export default useGetActions;
