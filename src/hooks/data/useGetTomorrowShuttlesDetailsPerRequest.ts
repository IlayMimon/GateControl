import { ShuttleDetailsPerRequest } from "../../types/shuttleDetailsPerRequst";
import { SharepointQueryResultArray } from "../../types/spFetchTypes";
import { useQueryFetchRequest } from "../useQueryFetch";


const useGetTomorrowShuttleDetailsPerRequest = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(tomorrow.getDate() + 1);
    
    const isoTomorrow = tomorrow.toISOString();
    const isoDayAfter = dayAfterTomorrow.toISOString();
    
    const { data } = useQueryFetchRequest<SharepointQueryResultArray<ShuttleDetailsPerRequest>>(
        `/_api/web/lists/getbytitle('ShuttleDetailsPerRequest')/items?$select=ID,Title,RequestId,PickupTime,DriverId,ArrivalTime?$filter=PickupTime ge datetime'${isoTomorrow}' and PickupTime lt datetime'${isoDayAfter}'`
    );

    const shuttleDetailsPerRequest: ShuttleDetailsPerRequest[] | undefined = data?.d.results.map((item) => ({
        ID: item.ID,
        Title: item.Title,
        RequestId: item.RequestId,
        PickupTime: item.PickupTime,
        DriverId: item.DriverId,
        ArrivalTime: item.ArrivalTime,
    }));

    return shuttleDetailsPerRequest
}

export default useGetTomorrowShuttleDetailsPerRequest;