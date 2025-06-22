import { SharePointResponse } from "../components/types/SharePointResponse";
import { useQueryFetchRequest } from "../hooks/useQueryFetch";
import { Shuttle } from "../types/assignDriversTypes";

export interface ShuttlesPerDay {
  Id: number;
  StartTime: Date;
  ArrivalTime: Date;
  totalDistance: number;
}

export const useGetTomorrowShuttles = () => {
  const today = new Date();

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(tomorrow.getDate() + 1);

  const isoTomorrow = tomorrow.toISOString();
  const isoDayAfter = dayAfterTomorrow.toISOString();

  const { data, refetch } = useQueryFetchRequest<SharePointResponse<Shuttle>>(
    `/_api/web/lists/getbytitle('Shuttles')/items?$filter=StartTime ge datetime'${isoTomorrow}' and StartTime lt datetime'${isoDayAfter}'`,
    true,
    "GET"
  );

  const shuttles: ShuttlesPerDay[] | undefined = data?.d.results.map((shuttle) => {
    return {
      Id: shuttle.Id,
      StartTime: shuttle.StartTime,
      ArrivalTime: shuttle.ArrivalTime,
      totalDistance: shuttle.totalDistance,
    };
  });

  return { shuttles, refetch };
};
