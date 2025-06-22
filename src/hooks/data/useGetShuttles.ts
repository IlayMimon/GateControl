import { useHomePageContext } from "../../contexts/HomePage";
import filterByToday from "../../functions/filterByToday";
import { SharepointQueryResultArray } from "../../types/spFetchTypes";
import { useQueryFetchRequest } from "../useQueryFetch";

export type Shuttle = {
  ID: number;
  Title: string;
  StartTime: Date;
  ArrivalTime: Date;
  Details: string;
  RequestsId: { results: number[] };
  DriverId: number | null;
  totalDistance: number;
  driverData: {
    ID: number;
    Title: string;
  };
};

const useGetShuttles = () => {
  const date = useHomePageContext().selectedDate;
  const { data, refetch } = useQueryFetchRequest<SharepointQueryResultArray<Shuttle>>(
    `/_api/web/lists/getbytitle('shuttles')/items?$select=ID,Title,StartTime,ArrivalTime,Details,RequestsId,DriverId,totalDistance,driverData/ID,driverData/Title&$expand=driverData&${filterByToday(date, "StartTime")}`
  );

  const shuttles = data?.d.results;

  return { shuttles, refetch };
};

export default useGetShuttles;
