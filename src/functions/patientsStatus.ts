import { ShuttleDetailsPerRequest } from "../hooks/data/useGetShuttleDetailsPerRequest";
import { ShuttleRequests } from "../hooks/data/useGetShuttleRequests";
import { Shuttle } from "../hooks/data/useGetShuttles";

export enum assignedStatusEnum {
  "initial" = "טרם שובץ",
  "assigned" = "שובץ",
  "arrivingSoon" = "מגיע בקרוב",
  "inClinic" = "במרפאה",
  "done" = "חזר",
}

interface IPatientStatus {
  patientId: number;
  status: assignedStatusEnum;
}

interface IUseGetPatientsStatusParams {
  shuttleRequests: ShuttleRequests[] | undefined;
  shuttleDetailsPerRequest: ShuttleDetailsPerRequest[] | undefined;
  shuttles: Shuttle[] | undefined;
}

export const patientsStatus = ({
  shuttleRequests: patients,
  shuttleDetailsPerRequest,
  shuttles,
}: IUseGetPatientsStatusParams): IPatientStatus[] | undefined => {
  const now = new Date();

  const patientIdToShuttleDetails = new Map(
    shuttleDetailsPerRequest?.map((shuttleDetail) => [shuttleDetail.RequestId, shuttleDetail.ID])
  );

  const shuttleDetailsIdToShuttle = new Map<number, Shuttle>();
  if (shuttles) {
    for (const shuttle of shuttles) {
      for (const shuttleDetailsId of shuttle.RequestsId.results) {
        shuttleDetailsIdToShuttle.set(shuttleDetailsId, shuttle);
      }
    }
  }

  return patients?.map((patient) => {
    const shuttleDetailsId = patientIdToShuttleDetails.get(patient.ID);
    const shuttle = shuttleDetailsId ? shuttleDetailsIdToShuttle.get(shuttleDetailsId) : undefined;

    if (!shuttle) return { patientId: patient.ID, status: assignedStatusEnum.initial };

    const arrivalTime = new Date(shuttle.ArrivalTime);
    const timeToArrival = (arrivalTime.getTime() - now.getTime()) / 60000;
    const timeSinceArrival = (now.getTime() - arrivalTime.getTime()) / 60000;

    let status: assignedStatusEnum = assignedStatusEnum.assigned;

    if (timeToArrival <= 30 && timeToArrival > 0) status = assignedStatusEnum.arrivingSoon;
    if (timeSinceArrival >= 0) status = assignedStatusEnum.inClinic;
    if (timeSinceArrival >= 30) status = assignedStatusEnum.done;

    return { patientId: patient.ID, status };
  });
};
