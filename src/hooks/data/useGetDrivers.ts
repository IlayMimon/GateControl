import { SharepointQueryResultArray } from "../../types/spFetchTypes";
import { Driver } from "../../types/travelBar";
import { useQueryFetchRequest } from "../useQueryFetch";

const useGetDrivers = () => {
  const { data } = useQueryFetchRequest<SharepointQueryResultArray<Driver>>(
    "/_api/web/lists/getbytitle('Drivers')/items?$select=ID,Title"
  );

  const drivers = data?.d.results || []

  return drivers
}

export default useGetDrivers;