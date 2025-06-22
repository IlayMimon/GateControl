import {
  Button,
  Checkbox,
  ConfigProvider,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  TimePicker,
  Typography,
} from "antd";
import heIL from "antd/locale/he_IL";
import dayjs from "dayjs";
import { useState } from "react";
import useGetServices from "../hooks/data/useGetServices";
import useGetStations from "../hooks/data/useGetStations";

const { Text } = Typography;
const { Option } = Select;

export type PatientFormValues = {
  fullName: string;
  phone: string;
  pickupStation?: string | null;
  dropoffStation?: string | null;
  appointmentTypes: string[];
  appointmentDate: dayjs.Dayjs;
  appointmentTime: dayjs.Dayjs;
  notes?: string;
};

type IAddPatientModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: PatientFormValues) => void;
};

const AddPatientModal = ({ isOpen: visible, onClose, onSubmit }: IAddPatientModalProps) => {
  const [form] = Form.useForm<PatientFormValues>();
  const [hasPickup, setHasPickup] = useState(true);
  const [hasDropoff, setHasDropoff] = useState(false);

  // Watch all required fields
  const pickupStation = Form.useWatch("pickupStation", form);
  const dropoffStation = Form.useWatch("dropoffStation", form);
  const fullName = Form.useWatch("fullName", form);
  const phone = Form.useWatch("phone", form);
  const appointmentDate = Form.useWatch("appointmentDate", form);
  const appointmentTime = Form.useWatch("appointmentTime", form);
  const appointmentTypes = Form.useWatch("appointmentTypes", form);

  const servicesData = useGetServices();

  const stationsData = useGetStations();

  const isFormValid = () => {
    return (
      !!fullName?.trim() &&
      /^05\d{8}$/.test(phone || "") &&
      Array.isArray(appointmentTypes) &&
      appointmentTypes.length > 0 &&
      !!appointmentDate &&
      !!appointmentTime &&
      (hasPickup || hasDropoff) &&
      (!hasPickup || !!pickupStation) &&
      (!hasDropoff || !!dropoffStation)
    );
  };

  const handleReset = () => {
    form.resetFields();
    setHasPickup(false);
    setHasDropoff(false);
  };

  return (
    <ConfigProvider locale={heIL} direction="rtl">
      <Modal
        className="add-patient-modal"
        open={visible}
        onCancel={onClose}
        title="הוספת מטופל ידנית"
        footer={[
          <Button key="clear" onClick={handleReset}>
            נקה טופס
          </Button>,
          <Button
            key="submit"
            type="primary"
            disabled={!isFormValid()}
            onClick={() => form.submit()}
          >
            הוסף מטופל
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(submitValues) => {
            onSubmit(submitValues);
            handleReset();
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
                  {stationsData?.map((station) => (
                    <Option key={station.ID} value={station.ID}>
                      {station.Title}
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
                  if (e.target.checked) {
                    form.setFieldsValue({ dropoffStation: pickupStation });
                  } else {
                    form.setFieldsValue({ dropoffStation: null });
                  }
                  form.validateFields(["pickupStation", "dropoffStation"]);
                }}
              >
                תחנת פיזור
              </Checkbox>
              <Form.Item name="dropoffStation">
                <Select disabled={!hasDropoff} placeholder="בחר תחנה">
                  {stationsData?.map((station) => (
                    <Option key={station.ID} value={station.ID}>
                      {station.Title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          </div>

          <Text strong>פרטי התור</Text>

          <div className="add-patient-modal__form-section">
            <Form.Item
              name="appointmentDate"
              label="תאריך התור"
              rules={[{ required: true, message: "יש לבחור תאריך" }]}
            >
              <DatePicker style={{ width: "100%" }} format="DD/MM/YY" />
            </Form.Item>

            <Form.Item
              name="appointmentTime"
              label="שעת הגעה רצויה"
              rules={[{ required: true, message: "יש לבחור שעה" }]}
            >
              <TimePicker format="HH:mm" style={{ width: "100%" }} showNow={false} />
            </Form.Item>

            <Form.Item
              name="appointmentTypes"
              label="סוג התור"
              rules={[{ required: true, message: "יש לבחור לפחות תור אחד" }]}
            >
              <Select mode="multiple" placeholder="בחר תורים">
                {servicesData?.map((service) => (
                  <Option key={service.ID} value={service.ID}>
                    {service.Title}
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
        </Form>
      </Modal>
    </ConfigProvider>
  );
};

export default AddPatientModal;
