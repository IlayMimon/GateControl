import { SharepointQueryResultArray } from "../../types/spFetchTypes";
import { Driver } from "../../types/travelBar";
import { useQueryFetchRequest } from "../useQueryFetch";

export interface IDriverData extends Driver {
  Distance: number;
}

const useGetDriversData = () => {
  const { data } = useQueryFetchRequest<SharepointQueryResultArray<IDriverData>>(
    "/_api/web/lists/getbytitle('driversData')/items?$select=ID,Title,Distance"
  );

  const drivers = data?.d.results || [];

  return drivers;
};

export default useGetDriversData;
