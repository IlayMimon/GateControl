import { SharepointQueryResultArray } from "../../types/spFetchTypes";
import { useQueryFetchRequest } from "../useQueryFetch";
import dayjs from "dayjs";

export type Action = {
  ID: number;
  Created: Date;
  ArmyId: { ArmyId: string };
  ActionType: string;
  Location: string;
};

const useGetActions = (todayOnly = false) => {
  const todayFilter = todayOnly
    ? `&$filter=Created ge '${dayjs().startOf("day").toISOString()}' and Created lt '${dayjs()
        .endOf("day")
        .toISOString()}'`
    : "";

  const { data, isLoading, refetch } = useQueryFetchRequest<SharepointQueryResultArray<Action>>(
    `/_api/web/lists/getbytitle('Actions')/items?$select=ID,Created,ArmyId/ArmyId,ActionType,Location&$expand=ArmyId${todayFilter}`
  );

  return { data: data?.d.results, isLoading, refetch };
};

export default useGetActions;
