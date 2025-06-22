import { SharepointQueryResultArray } from "../../types/spFetchTypes";
import { useQueryFetchRequest } from "../useQueryFetch";
import dayjs from "dayjs";

type Action = {
  ID: number;
  Created: Date;
  ArmyId: { ArmyId: string };
  ActionType: string;
};

const useGetActions = (todayOnly = false) => {
  const todayFilter = todayOnly
    ? `&$filter=Created ge '${dayjs().startOf("day").toISOString()}' and Created lt '${dayjs()
        .endOf("day")
        .toISOString()}'`
    : "";

  const { data, isLoading, refetch } = useQueryFetchRequest<SharepointQueryResultArray<Action>>(
    `/_api/web/lists/getbytitle('Actions')/items?$select=ID,Created,ArmyId/ArmyId,ActionType&$expand=ArmyId${todayFilter}`
  );

  console.log("useGetActions", data, isLoading, todayOnly);
  return { data: data?.d.results, isLoading, refetch };
};

export default useGetActions;
