import {
  Button,
  Checkbox,
  ConfigProvider,
  Form,
  Input,
  Modal,
  Segmented,
  Select,
  TimePicker,
  Typography,
} from "antd";
import heIL from "antd/locale/he_IL";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import useGetDrivers from "../hooks/data/useGetDrivers";
import useGetServices from "../hooks/data/useGetServices";
import useGetShuttles from "../hooks/data/useGetShuttles";
import useGetStations from "../hooks/data/useGetStations";
import { TripDirection } from "./HomeScreenBody";
import { TableRow } from "./Table/TableTypes";
import useGetShuttleRequests from "../hooks/data/useGetShuttleRequests";
import { assignedStatusEnum } from "../functions/patientsStatus";

const { Text } = Typography;
const { Option } = Select;

export type PatientFormValues = {
  id: number;
  requestDetailsId: number;
  rideId?: number;
  fullName: string;
  phone: string;
  pickupStation?: number | null;
  dropoffStation?: number | null;
  driver?: number;
  appointmentType: number[];
  pickupTime: dayjs.Dayjs;
  desiredArrival: dayjs.Dayjs;
  finishTime: dayjs.Dayjs;
  inboundTime: dayjs.Dayjs;
  notes?: string;
};

type IAddPatientModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: PatientFormValues) => void;
  initialValues: TableRow;
  tripDirection: TripDirection;
};

const EditPatientModal = ({
  isOpen: visible,
  onClose,
  onSubmit,
  initialValues,
  tripDirection,
}: IAddPatientModalProps) => {
  const [form] = Form.useForm<PatientFormValues>();
  const [hasPickup, setHasPickup] = useState(initialValues.pickupTime !== null);
  const [hasDropoff, setHasDropoff] = useState(false);
  const [formTripDirection, setFormTripDirection] = useState<TripDirection>("outbound");

  const rawAppointmentOptions = useGetServices();
  const rawStations = useGetStations();
  const {shuttles: rawRides} = useGetShuttles();
  const rawDrivers = useGetDrivers();
  const rawRequests = useGetShuttleRequests();

  const appointmentOptions = useMemo(() => rawAppointmentOptions || [], [rawAppointmentOptions]);
  const stations = useMemo(() => rawStations || [], [rawStations]);
  const rides = useMemo(() => rawRides || [], [rawRides]);
  const drivers = useMemo(() => rawDrivers || [], [rawDrivers]);
  const requests = useMemo(() => rawRequests || [], [rawRequests]);

  // Watch all required fields
  const fullName = Form.useWatch("fullName", form);
  const phone = Form.useWatch("phone", form);
  const pickupStation = Form.useWatch("pickupStation", form);
  const dropoffStation = Form.useWatch("dropoffStation", form);
  const appointmentTypes = Form.useWatch("appointmentType", form);
  const pickupTime = Form.useWatch("pickupTime", form);
  const desiredArrival = Form.useWatch("desiredArrival", form);
  const finishTime = Form.useWatch("finishTime", form);
  const inboundTime = Form.useWatch("inboundTime", form);

  const shuttleRequest = useMemo(() => {
    return requests.find((request) => request.ID === initialValues.id);
  }, [requests, initialValues.id]);

  useEffect(() => {
    if (stations.length && appointmentOptions.length && drivers.length && rides.length) {
      form.setFieldsValue({
        ...initialValues,
        pickupStation: shuttleRequest?.StationId ?? null,
        dropoffStation: shuttleRequest?.ReturnStationId ?? null,
        driver: drivers.find((d) => d.Title === initialValues.driver)?.ID ?? undefined,
        appointmentType: initialValues.appointmentType
          .map((type) => appointmentOptions.find((opt) => opt.Title === type)?.ID)
          .filter((id): id is number => id !== undefined),
      });
    }
  }, [
    requests,
    stations,
    appointmentOptions,
    drivers,
    rides,
    form,
    initialValues,
    tripDirection,
    shuttleRequest?.StationId,
    shuttleRequest?.ReturnStationId,
  ]);

  const isFormValid = () => {
    return (
      !!fullName?.trim() &&
      /^05\d{8}$/.test(phone || "") &&
      Array.isArray(appointmentTypes) &&
      appointmentTypes.length > 0 &&
      !!pickupTime &&
      !!desiredArrival &&
      !!finishTime &&
      !!inboundTime &&
      (hasPickup || hasDropoff) &&
      (!hasPickup || !!pickupStation) &&
      (!hasDropoff || !!dropoffStation)
    );
  };

  const handleReset = () => {
    form.resetFields();
    setHasPickup(false);
    setHasDropoff(false);
    setFormTripDirection("outbound");
  };

  return (
    <ConfigProvider locale={heIL} direction="rtl">
      <Modal
        className="add-patient-modal"
        open={visible}
        onCancel={onClose}
        title="עריכת פרטי מטופל"
        footer={[
          <Button
            key="submit"
            type="primary"
            disabled={!isFormValid()}
            onClick={() => form.submit()}
          >
            עדכן פרטים
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(submitValues) => {
            onSubmit({
              ...submitValues,
              id: initialValues.id,
              requestDetailsId: initialValues.requestDetailsId,
            });
            handleReset();
          }}
          initialValues={{
            ...initialValues,
          }}
        >
          <Text strong>פרטי החייל</Text>
          <div className="add-patient-modal__form-section">
            <Form.Item
              name="fullName"
              label="שם מלא"
              rules={[
                { required: true, message: "יש להזין שם" },
                { max: 20, message: "מקסימום 20 תווים" },
              ]}
            >
              <Input maxLength={20} />
            </Form.Item>

            <Form.Item
              name="phone"
              label="טלפון"
              rules={[
                { required: true, message: "יש להזין מספר טלפון" },
                { pattern: /^05\d{8}$/, message: "מספר לא תקין" },
              ]}
            >
              <Input maxLength={10} />
            </Form.Item>

            <div>
              <Checkbox
                checked={hasPickup}
                onChange={(e) => {
                  setHasPickup(e.target.checked);
                  if (!e.target.checked) {
                    form.setFieldsValue({ pickupStation: null });
                  }
                  form.validateFields(["pickupStation", "dropoffStation"]);
                }}
              >
                תחנת איסוף
              </Checkbox>
              <Form.Item
                name="pickupStation"
                rules={[
                  {
                    validator: () => {
                      if (!hasPickup && !hasDropoff) {
                        return Promise.reject(new Error("יש לבחור לפחות תחנת איסוף או תחנת פיזור"));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Select disabled={!hasPickup} placeholder="בחר תחנה">
                  {stations.map((station) => (
                    <Option key={station.ID} value={station.ID}>
                      {station.Title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="status" label="סטטוס">
                <Select placeholder="בחר סטטוס" style={{ width: "100%" }}>
                  {Object.entries(assignedStatusEnum).map(([key, value]) => (
                    <Option key={key} value={value}>
                      {value}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            <div>
              <Checkbox
                checked={hasDropoff}
                onChange={(e) => {
                  setHasDropoff(e.target.checked);
                  if (!e.target.checked) {
                    form.setFieldsValue({ dropoffStation: null });
                  }
                  form.validateFields(["pickupStation", "dropoffStation"]);
                }}
              >
                תחנת פיזור
              </Checkbox>
              <Form.Item name="dropoffStation">
                <Select disabled={!hasDropoff} placeholder="בחר תחנה">
                  {stations.map((station) => (
                    <Option key={station.ID} value={station.ID}>
                      {station.Title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="notes"
                label="הערות"
                rules={[{ max: 300, message: "ההערה ארוכה מדי (מקסימום 300 תווים)" }]}
              >
                <Input.TextArea placeholder="הקלד הערה" autoSize={{ maxRows: 1 }} />
              </Form.Item>
            </div>
          </div>

          <Segmented
            dir="ltr"
            className="shuttle-table-header__segmented"
            options={[
              { label: "הלוך", value: "outbound" },
              { label: "חזור", value: "inbound" },
            ]}
            block
            value={formTripDirection}
            onChange={(direction: TripDirection) => setFormTripDirection(direction)}
          />

          <div
            style={{ display: formTripDirection === "outbound" ? "grid" : "none" }}
            className="add-patient-modal__form-section"
          >
            <Form.Item name="rideId" label='מס"ד נסיעה'>
              <Select placeholder='בחר מס"ד'>
                {rides.map((ride) => (
                  <Option key={ride.ID} value={ride.ID}>
                    {ride.ID}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="appointmentType"
              label="סוג התור"
              rules={[{ required: true, message: "יש לבחור לפחות תור אחד" }]}
            >
              <Select mode="multiple" placeholder="בחר תורים">
                {appointmentOptions.map((type) => (
                  <Option key={type.ID} value={type.ID}>
                    {type.Title}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="desiredArrival"
              label="שעת הגעה רצויה"
              rules={[{ required: formTripDirection === "outbound", message: "יש לבחור שעה" }]}
            >
              <TimePicker format="HH:mm" style={{ width: "100%" }} showNow={false} />
            </Form.Item>

            <Form.Item
              name="pickupTime"
              label="שעת איסוף"
              rules={[{ required: formTripDirection === "outbound", message: "יש לבחור שעה" }]}
            >
              <TimePicker format="HH:mm" style={{ width: "100%" }} showNow={false} />
            </Form.Item>
          </div>

          <div
            style={{ display: formTripDirection === "inbound" ? "grid" : "none" }}
            className="add-patient-modal__form-section"
          >
            <Form.Item name="returnDriver" label="נהג">
              <Select placeholder="בחר נהג">
                {drivers.map((driver) => (
                  <Option key={driver.ID} value={driver.ID}>
                    {driver.Title}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="appointmentType"
              label="סוג התור"
              rules={[{ required: true, message: "יש לבחור לפחות תור אחד" }]}
            >
              <Select mode="multiple" placeholder="בחר תורים">
                {appointmentOptions.map((type) => (
                  <Option key={type.ID} value={type.ID}>
                    {type.Title}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="finishTime"
              label="שעת סיום"
              rules={[{ required: formTripDirection === "inbound", message: "יש לבחור שעה" }]}
            >
              <TimePicker format="HH:mm" style={{ width: "100%" }} showNow={false} />
            </Form.Item>

            <Form.Item
              name="inboundTime"
              label="שעת חזרה"
              rules={[{ required: formTripDirection === "inbound", message: "יש לבחור שעה" }]}
            >
              <TimePicker format="HH:mm" style={{ width: "100%" }} showNow={false} />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </ConfigProvider>
  );
};

export default EditPatientModal;
