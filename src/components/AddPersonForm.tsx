import { Button, Form, Input, Select } from "antd";
import { toast } from "react-toastify";
import { useGateControlContext } from "../context/GateControlContext";
import addPerson from "../functions/addPerson";
import { Branch } from "../hooks/data/useGetBranch";
import { toastConfig } from "./PersonItem";
import { useState } from "react";

interface IAddPersonFormProps {
  branches: Branch[];
  onCancel: () => void;
}

export function AddPersonForm({ branches, onCancel }: IAddPersonFormProps) {
  const { setPeopleData } = useGateControlContext();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Form
      layout="vertical"
      onFinish={async (values: {
        firstName: string;
        lastName: string;
        armyId: string;
        branch: number;
      }) => {
        // Will only be called if all validations pass
        setIsLoading(true);
        const personResponse = await addPerson(values);
        if (personResponse === "success") {
          // Update the people data in context or state
          setPeopleData((prevData) => {
            return [
              {
                ID: parseInt(values.armyId), // Simulating a new ID, replace with actual ID from DB on refresh
                ArmyId: values.armyId,
                Title: values.firstName,
                LastName: values.lastName,
                Branch: {
                  id: values.branch,
                  Title:
                    branches.find((b) => b.ID === values.branch)?.Title || "",
                },
                Location: "לא נמצא", // Default location
              },
              ...(prevData || []),
            ];
          });

          toast.success("אדם נוסף בהצלחה", toastConfig);

          onCancel(); // Close the form
        } else {
          toast.error("אירעה שגיאה בהוספת אדם", toastConfig);
        }
        setIsLoading(false);
      }}
    >
      <Form.Item
        name="firstName"
        rules={[{ required: true, message: "נא הכנס שם פרטי" }]}
      >
        <Input placeholder="שם פרטי" />
      </Form.Item>

      <Form.Item
        name="lastName"
        rules={[{ required: true, message: "נא הכנס שם משפחה" }]}
      >
        <Input placeholder="שם משפחה" />
      </Form.Item>

      <Form.Item
        name="armyId"
        rules={[
          { required: true, message: "נא הכנס מספר אישי" },
          { pattern: /^\d{7}$/, message: "מספר אישי חייב להיות בדיוק 7 ספרות" },
        ]}
      >
        <Input placeholder="מספר אישי" maxLength={7} />
      </Form.Item>

      <Form.Item
        name="branch"
        rules={[{ required: true, message: "נא לבחור אגף" }]}
      >
        <Select placeholder="בחר אגף">
          {branches?.map((branch) => (
            <Select.Option key={branch.ID} value={branch.ID}>
              {branch.Title}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      {isLoading ? (
        <span>טוען...</span>
      ) : (
        <Form.Item>
          <div className="gate-control__add-buttons">
            <Button
              className="gate-control__add-button"
              type="primary"
              htmlType="submit"
            >
              הוספה
            </Button>
            <Button
              className="gate-control__cancel-button"
              onClick={onCancel}
              htmlType="button"
            >
              ביטול
            </Button>
          </div>
        </Form.Item>
      )}
    </Form>
  );
}
