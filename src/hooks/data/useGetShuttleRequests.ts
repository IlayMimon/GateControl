import dayjs from "dayjs";
import { useHomePageContext } from "../../contexts/HomePage";
import filterByToday from "../../functions/filterByToday";
import { SharepointQueryResultArray } from "../../types/spFetchTypes";
import { useQueryFetchRequest } from "../useQueryFetch";

export type ShuttleRequests = {
    ID: number
    Title: string
    FullName: string | null
    Phone: string
    RequestedServicesId: { results: number[] }
    IsReturnShuttleRequired: boolean
    ReturnStationId?: number
    StationId: number
    Time: dayjs.Dayjs;
    notes?: string;
};

const useGetShuttleRequests = () => {
    const date = useHomePageContext().selectedDate;
    const { data } = useQueryFetchRequest<SharepointQueryResultArray<ShuttleRequests>>(
        `/_api/web/lists/getbytitle('ShuttleRequests')/items?$select=ID,Title,FullName,Phone,RequestedServicesId,IsReturnShuttleRequired,ReturnStationId,StationId,Time,notes&${filterByToday(date, 'Time')}`
    );

    const shuttleRequests = data?.d.results

    return shuttleRequests
}

export default useGetShuttleRequests;