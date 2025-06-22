import dayjs from "dayjs";
import { TableRow } from "../components/Table/TableTypes";
import useGetDrivers from "./data/useGetDrivers";
import useGetServices from "./data/useGetServices";
import useGetShuttleDetailsPerRequest from "./data/useGetShuttleDetailsPerRequest";
import useGetShuttleRequests from "./data/useGetShuttleRequests";
import useGetShuttles from "./data/useGetShuttles";
import useGetStations from "./data/useGetStations";
import { assignedStatusEnum, patientsStatus } from "../functions/patientsStatus";

const useGetTableData = () => {
  const {shuttles} = useGetShuttles();
  const shuttleRequests = useGetShuttleRequests();
  const shuttleDetailsPerRequest = useGetShuttleDetailsPerRequest();
  const stations = useGetStations();
  const services = useGetServices();
  const drivers = useGetDrivers();

  const patientsStatuses = patientsStatus({ shuttleDetailsPerRequest, shuttleRequests, shuttles });

  const data = shuttleDetailsPerRequest?.flatMap((requestDetails) => {
    const shuttle = shuttles?.find((shut) =>
      shut?.RequestsId?.results.includes(requestDetails?.ID)
    );
    const request = shuttleRequests?.find((req) => req.ID === requestDetails.RequestId);
    const pickupStation = stations?.find((station) => station.ID === request?.StationId);
    const dropoffStation = stations?.find((station) => station.ID === request?.ReturnStationId);
    const driver = drivers?.find((driver) => driver.ID === requestDetails.DriverId);
    const returnDriver = drivers?.find((driver) => driver.ID === requestDetails.ReturnDriverId);
    const requestedServices = request?.RequestedServicesId?.results
      .map((serviceId) => services?.find((service) => service.ID === serviceId))
      .filter((service) => service !== undefined);
    const requestedServicesTitles = requestedServices?.map((service) => service?.Title);
    const servicesDuration =
      requestedServices?.reduce((total, service) => total + (service?.Time || 0), 0) || 0;

    if (!request) return [];

    const basicPassangerData = {
      id: request.ID,
      requestDetailsId: requestDetails.ID || 0,
      shuttleId: shuttle?.ID || 0,
      fullName: request?.FullName || "",
      status:
        patientsStatuses?.find((status) => status.patientId === request.ID)?.status ||
        assignedStatusEnum.initial,
      phone: request?.Phone || "",
      appointmentType: requestedServicesTitles || [],
      rideId: shuttle?.ID || "",
      station: pickupStation?.Title || "",
      returnStation: dropoffStation?.Title || "",
      area: pickupStation?.Area || "",
      returnArea: dropoffStation?.Area || "",
      driver: driver?.Title || "",
      returnDriver: returnDriver?.Title || "",
      notes: request?.notes || "",
      actions: "actions",
    };

    const estimatedArrival = dayjs(shuttle?.ArrivalTime || new Date());
    const desiredArrival = dayjs(request?.Time || new Date());
    const finishTime = dayjs(requestDetails.FinishTime || new Date());
    const inboundTime = dayjs(requestDetails.InboundTime || new Date());

    const directionPassangerData = {
      pickupTime: dayjs(requestDetails.PickupTime),
      estimatedArrival: estimatedArrival,
      desiredArrival: desiredArrival,
      outboundGap: estimatedArrival.diff(desiredArrival, "minute"),
      estimatedFinish: estimatedArrival.add(servicesDuration, "minute"),
      finishTime: finishTime,
      inboundTime: inboundTime,
      inboundGap: inboundTime.diff(finishTime, "minute"),
    };

    const passangerData: TableRow = { ...basicPassangerData, ...directionPassangerData };

    return passangerData;
  });

  return data || [];
};

export default useGetTableData;
