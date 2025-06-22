import { Menu } from "antd";
import { useState } from "react";
import { TbDotsVertical, TbPencil } from "react-icons/tb";
import { patchItemInList } from "../functions/postToSharepoint";
import EditPatientModal, { PatientFormValues } from "./EditPatientModal";
import { TableRow } from "./Table/TableTypes";
import { TripDirection } from "./HomeScreenBody";
import useGetShuttles from "../hooks/data/useGetShuttles";

interface RowActionsProps {
  rowData: TableRow;
  tripDirection: TripDirection;
}

const RowActions = ({ rowData, tripDirection }: RowActionsProps) => {
  const [isEditPatientModalOpen, setisEditPatientModalOpen] = useState(false);
  const {shuttles} = useGetShuttles();

  const handleEditColumn = () => {
    setisEditPatientModalOpen(true);
  };

  const handleSubmitForm = async (values: PatientFormValues) => {
    let oldShuttle;
    const newShuttle = shuttles?.find((shuttle) => values.rideId === shuttle.ID);

    if (!newShuttle?.RequestsId.results.includes(values.requestDetailsId)) {
      oldShuttle = shuttles?.find((shuttle) =>
        shuttle.RequestsId.results.includes(values.requestDetailsId)
      );
    }

    const requestData = {
      Time: values.desiredArrival.toISOString(),
      StationId: values.pickupStation,
      Phone: values.phone,
      IsReturnShuttleRequired: !!values.dropoffStation,
      ReturnStationId: values.dropoffStation,
      RequestedServicesId: values.appointmentType,
      FullName: values.fullName,
      notes: values.notes,
    };

    const requestDetailsData = {
      ReturnDriverId: values.driver,
      PickupTime: values.pickupTime.toISOString(),
      FinishTime: values.finishTime.toISOString(),
      InboundTime: values.inboundTime.toISOString(),
    };

    const oldShuttleData = {
      RequestsId: oldShuttle?.RequestsId.results.filter(
        (RequestId) => RequestId !== values.requestDetailsId
      ),
    };
    const newShuttleData = {
      RequestsId: [...(newShuttle?.RequestsId.results || []), values.requestDetailsId],
    };

    try {
      await patchItemInList(
        "ShuttleDetailsPerRequest",
        requestDetailsData,
        rowData.requestDetailsId,
        "*"
      );
    } catch (error) {
      console.error("Error updating request details:", error);
    }

    try {
      await patchItemInList("ShuttleRequests", requestData, rowData.id, "*");
    } catch (error) {
      console.error("Error updating request:", error);
    }

    if (oldShuttle && newShuttle) {
      console.log("Updating shuttles:", oldShuttle.ID, newShuttle.ID);

      try {
        await patchItemInList("Shuttles", oldShuttleData, oldShuttle.ID, "*");
      } catch (error) {
        console.error("Error updating the old shuttle:", error);
      }

      try {
        await patchItemInList("Shuttles", newShuttleData, newShuttle.ID, "*");
      } catch (error) {
        console.error("Error updating the new shuttle:", error);
      }
    }

    setisEditPatientModalOpen(false);
  };

  const items = [
    {
      key: "options",
      icon: <TbDotsVertical />,
      children: [
        {
          key: "1",
          label: "ערוך מטופל",
          icon: <TbPencil />,
          onClick: handleEditColumn,
        },
      ],
    },
  ];

  return (
    <>
      <Menu style={{ width: 0 }} items={items} />
      <EditPatientModal
        isOpen={isEditPatientModalOpen}
        onClose={() => setisEditPatientModalOpen(false)}
        onSubmit={handleSubmitForm}
        initialValues={rowData}
        tripDirection={tripDirection}
      />
    </>
  );
};

export default RowActions;
