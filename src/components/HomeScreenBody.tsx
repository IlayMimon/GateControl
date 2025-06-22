import { IconSend, IconSparkles } from "@tabler/icons-react";
import { Button, message, Tooltip } from "antd";
import { useState } from "react";
import { TbPlus } from "react-icons/tb";
import { addItemToList } from "../functions/postToSharepoint";
import useGetTableColumns from "../hooks/useGetTableColumns";
import useGetTableData from "../hooks/useGetTableData";
import { useStatusManager } from "../hooks/useStatusManager";
import AddPatientModal, { PatientFormValues } from "./AddPatientModal";
import AutomationModal from "./AutomationModal";
import BtnPopUpMsg from "./generic/btnPopUpMsg";
import ShuttleAssignmentModal from "./ShuttleAssignmentModal/ShuttleAssignmentModal";
import ShuttleTableHeader from "./ShuttleTable/ShuttleTableHeader";
import Table from "./Table/Table";
import TravelBar from "./travel-bar/TravelBar";

export type TripDirection = "outbound" | "inbound";

const HomeScreenBody = () => {
  const [isShuttlesArranged, setIsShuttlesArranged] = useState(false);
  const [shuttleAssignmentModalVisible, setShuttleAssignmentModalVisible] = useState(false);
  const [automationModalVisible, setAutomationModalVisible] = useState(false);
  const [messagesAlreadySent, setMessagesAlreadySent] = useState(false);
  const [popUpMsgOpen, setPopUpMsgOpen] = useState(false);
  const [tripDirection, setTripDirection] = useState<TripDirection>("outbound");
  const [escortModalOpen, setEscortModalOpen] = useState(false);

const { onAssignClick, status } = useStatusManager(setAutomationModalVisible);


  const handleEscortSubmit = async (values: PatientFormValues) => {
    const patientFormData = {
      Time: values.appointmentTime.toISOString(),
      StationId: values.pickupStation,
      Phone: values.phone,
      IsReturnShuttleRequired: !!values.dropoffStation,
      ReturnStationId: values.dropoffStation,
      RequestedServicesId: values.appointmentTypes,
      FullName: values.fullName,
    };

    await addItemToList("ShuttleRequests", patientFormData);

    setEscortModalOpen(false);
  };

  const handleChangeDirection = (direction: TripDirection) => {
    setTripDirection(direction);
  };

  const handleSubmit = () => {
    message.success("שיבוץ הנסיעות בוצע בהצלחה");
    setIsShuttlesArranged(true);
    setShuttleAssignmentModalVisible(false);
    setAutomationModalVisible(true);

    onAssignClick();
  };

  const columns = useGetTableColumns(tripDirection);
  const data = useGetTableData();

  return (
    <div className="home-screen-body">
      <div className="home-screen-body__header">
        <div className="home-screen-body__header__right">
          <h1>שאטלים</h1>
        </div>
        <div className="home-screen-body__header__left">
          <BtnPopUpMsg
            title="שיבוץ נסיעות מחדש?"
            msg="שים לב, פעולה זו תאפס את השיבוצים הקיימים."
            btnContent="שבץ מחדש"
            isOpen={popUpMsgOpen}
            onConfirm={() => {
              setShuttleAssignmentModalVisible((prevValue) => !prevValue);
              setPopUpMsgOpen(false);
            }}
            onCancel={() => setPopUpMsgOpen(false)}
          >
            <Tooltip
              key="submit"
              title={messagesAlreadySent ? "לא ניתן לשבץ מחדש לאחר הפצת הודעות" : ""}
            >
              <Button
                onClick={() =>
                  isShuttlesArranged
                    ? setPopUpMsgOpen(true)
                    : setShuttleAssignmentModalVisible(true)
                }
                disabled={messagesAlreadySent}
                color="default"
                variant="filled"
                icon={<IconSparkles />}
                className="home-screen-body__header__left__button"
              >
                שבץ נסיעות
              </Button>
            </Tooltip>
          </BtnPopUpMsg>
          <Tooltip title={isShuttlesArranged ? "" : "נדרש לשבץ נסיעות"}>
            <Button
              disabled={!isShuttlesArranged}
              color="default"
              variant="filled"
              icon={<IconSend />}
              className="home-screen-body__header__left__button"
              onClick={() => {
                setMessagesAlreadySent(true);
                setPopUpMsgOpen(false);
              }}
            >
              שליחת הודעות
            </Button>
          </Tooltip>
          <Button
            color="default"
            variant="solid"
            icon={<TbPlus />}
            className="home-screen-body__header__left__button"
            onClick={() => setEscortModalOpen(true)}
          >
            הוספת מטופל
          </Button>
        </div>
      </div>

      <div className="home-screen-body__container">
        <div className="home-screen-body__container__body">
          <ShuttleTableHeader handleChange={handleChangeDirection} tripDirection={tripDirection} />
          {tripDirection === "outbound" ? (
            <Table data={data} columns={columns} rowKey={(row) => row.id} />
          ) : (
            <Table data={data} columns={columns} rowKey={(row) => row.id} />
          )}
        </div>
        <TravelBar />
      </div>
      <ShuttleAssignmentModal
        visible={shuttleAssignmentModalVisible}
        onCancel={() => setShuttleAssignmentModalVisible(false)}
        onSubmit={handleSubmit}
        messagesAlreadySent={false}
      />
<AutomationModal visible={automationModalVisible} status={status} />

      <AddPatientModal
        isOpen={escortModalOpen}
        onClose={() => setEscortModalOpen(false)}
        onSubmit={handleEscortSubmit}
      />
    </div>
  );
};

export default HomeScreenBody;
