import dayjs from "dayjs";
import { useHomePageContext } from "../../contexts/HomePage";
import filterByToday from "../../functions/filterByToday";
import { SharepointQueryResultArray } from "../../types/spFetchTypes";
import { useQueryFetchRequest } from "../useQueryFetch";

export type ShuttleDetailsPerRequest = {
    ID: number
    Title: string
    RequestId: number
    DriverId: number
    PickupTime: dayjs.Dayjs;
    ArrivalTime: dayjs.Dayjs;
    FinishTime: dayjs.Dayjs;
    InboundTime: dayjs.Dayjs;
    ReturnDriverId?: number;
};

const useGetShuttleDetailsPerRequest = () => {
    const date = useHomePageContext().selectedDate;
    const { data } = useQueryFetchRequest<SharepointQueryResultArray<ShuttleDetailsPerRequest>>(
        `/_api/web/lists/getbytitle('ShuttleDetailsPerRequest')/items?$select=ID,Title,RequestId,PickupTime,DriverId,ReturnDriverId,ArrivalTime,FinishTime,InboundTime&${filterByToday(date, 'PickupTime')}`
    );

    const shuttleDetailsPerRequest = data?.d.results

    return shuttleDetailsPerRequest
}

export default useGetShuttleDetailsPerRequest;