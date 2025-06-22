import { Dayjs } from "dayjs";

export interface Props {
  visible: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  messagesAlreadySent: boolean;
}

export interface FormValues {
  startTime: Dayjs;
  endTime: Dayjs;
  vehicleCount: number;
  medic: number;
}
