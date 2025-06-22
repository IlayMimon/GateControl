import { IconSparkles } from "@tabler/icons-react";
import { Button, ConfigProvider, Form, FormRule, Modal, Select, TimePicker, message } from "antd";
import heIL from "antd/locale/he_IL";
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import React from "react";
import { TbArrowNarrowLeft } from "react-icons/tb";
import { useGetTomorrowShuttles } from "../../functions/useGetTomorrowShuttles";
import { patchItemInList } from "../../functions/postToSharepoint";
import resetShuttles from "../../functions/resetShuttles";
import useGetTomorrowShuttleDetailsPerRequest from "../../hooks/data/useGetTomorrowShuttlesDetailsPerRequest";
import { Props } from "../../types/shuttleAssignmentProps";
import MedicSelect from "../MedicSelect";
dayjs.extend(customParseFormat);
const { Option } = Select;

const ShuttleAssignmentModal: React.FC<Props> = ({ visible, onCancel, onSubmit }) => {
  const [form] = Form.useForm();
  const [selectedMedic, setSelectedMedic] = React.useState<number | undefined>(undefined);

  const { shuttles } = useGetTomorrowShuttles();
  const shuttlesDetailsPerRequest = useGetTomorrowShuttleDetailsPerRequest();

  const validateTimeRange = (_: FormRule, endTime: Dayjs) => {
    const startTime = form.getFieldValue("startTime");
    if (!startTime || !endTime) return Promise.resolve();
    const diff = endTime.diff(startTime, "hour", true);
    if (diff > 12) {
      return Promise.reject("טווח הזמן לא יכול להיות ארוך מ-12 שעות");
    }
    return Promise.resolve();
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then(async () => {
        // const { startTime, endTime, vehicleCount, medic } = values;

        await resetShuttles(shuttles, shuttlesDetailsPerRequest);
        patchItemInList(
          "Status",
          { isOver: false, status: "pending", step: 1, isAssigned: false },
          1,
          "*"
        );
        patchItemInList("trigger", { Title: "000" }, 1, "*");
        form.resetFields();
        onSubmit();
      })
      .catch(() => {
        message.error("נא למלא את כל השדות החובה כראוי");
      });
  };

  return (
    <ConfigProvider locale={heIL} direction="rtl">
      <Modal
        className="ShuttleAssignmentModal"
        title="שיבוץ נסיעות אוטומטי"
        open={visible}
        onCancel={onCancel}
        footer={
          <div className="ShuttleAssignmentModal__footer">
            <Button key="cancel" onClick={onCancel}>
              ביטול
            </Button>

            <Button
              type="primary"
              className="ShuttleAssignmentModal__assign-btn"
              onClick={handleSubmit}
            >
              <IconSparkles />
              שבץ נסיעות
            </Button>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          // onValuesChange={handleValuesChange}
          initialValues={{
            startTime: dayjs("06:30", "HH:mm"),
            endTime: dayjs("18:30", "HH:mm"),
            vehicleCount: 3,
          }}
        >
          <Form.Item
            label="שעות פעילות השאטלים"
            className="ShuttleAssignmentModal__timePicker"
            required
          >
            <div className="ShuttleAssignmentModal__timePicker__container">
              <Form.Item
                name="startTime"
                rules={[{ required: true, message: "יש לבחור שעת התחלה" }]}
                className="ShuttleAssignmentModal__timePicker__container__startTime"
              >
                <TimePicker format="HH:mm" placeholder="התחלה" />
              </Form.Item>

              <TbArrowNarrowLeft className="ShuttleAssignmentModal__timePicker__container__arrowIcon" />

              <Form.Item
                name="endTime"
                rules={[
                  { required: true, message: "יש לבחור שעת סיום" },
                  { validator: validateTimeRange },
                ]}
                className="ShuttleAssignmentModal__timePicker__container__endTime"
              >
                <TimePicker format="HH:mm" placeholder="סיום" />
              </Form.Item>
            </div>
          </Form.Item>

          <Form.Item
            label="מספר נהגים"
            name="vehicleCount"
            rules={[{ required: true, message: "יש לבחור מספר נהגים" }]}
          >
            <Select>
              {[1, 2, 3, 4, 5].map((num) => (
                <Option key={num} value={num}>
                  {num}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="חובש אחראי"
            required
            validateStatus={!selectedMedic ? "error" : ""}
            help={!selectedMedic ? "יש לבחור חובש אחראי" : ""}
          >
            <MedicSelect setSelectedMedic={setSelectedMedic} />
            <input type="hidden" name="medic" value={selectedMedic || ""} />
          </Form.Item>
        </Form>
      </Modal>
    </ConfigProvider>
  );
};

export default ShuttleAssignmentModal;
