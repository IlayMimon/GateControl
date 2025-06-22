import { Modal as AntModal } from "antd";
import { createRef, Dispatch, SetStateAction, useEffect, useMemo } from "react";
import downloadDom from "../../functions/downloadDom";
import DriverData from "../../types/DriverOrganizationTypes";
import DriverOrganizationCard from "./DriverOrganizationCard";
import DriverOrganizationHeader from "./DriverOrganizationHeader";
import { useHomePageContext } from "../../contexts/HomePage";
import useGetMedicsPerDate from "../../hooks/data/useGetMedicsPerDate";
import useGetMedics from "../../hooks/data/useGetMedics";

interface DriverOrganizationProps {
  data: DriverData[];
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
}

const DriverOrganization = ({ data, isModalOpen, setIsModalOpen }: DriverOrganizationProps) => {
  const { selectedDate } = useHomePageContext();

  const { medicsPerDate, refetch } = useGetMedicsPerDate(selectedDate);
  const medics = useGetMedics();

  // in a loop to avoid repeating code. useMemo for efficiency between renders
  const [allCards, ...rest] = useMemo(
    () => Array.from({ length: 4 }, () => createRef<HTMLDivElement>()),
    []
  );

  const downloadImages = () => {
    if (navigator.userAgent.toLowerCase().includes("firefox")) {
      alert("הורדת תמונה לא עובדת בדפדפן זה. אנא השתמשו בכרום");
      return;
    }

    [allCards, ...rest].forEach((ref, index) => {
      const fileName = index === 0 ? "all-drivers" : "driver-" + index.toString();
      downloadDom(ref, fileName);
    });
  };

  useEffect(() => {
    if (isModalOpen) {
      refetch();
    }
  }, [isModalOpen, refetch]);

  return (
    <AntModal
      open={isModalOpen}
      footer={null}
      closeIcon={false}
      onCancel={() => setIsModalOpen(false)}
      width="131.5rem"
      centered
      className="driver-organization__modal"
    >
      <div className="driver-organization">
        <DriverOrganizationHeader
          downloadImages={downloadImages}
          sendToDrivers={() => "not yet implemented"}
          isSendDisabled={!data.every((driver) => driver.name)}
          paramedic={
            (medicsPerDate?.length &&
              medics?.find((medic) => medic.ID === medicsPerDate[0].medicId)?.Title) ||
            "לא שובץ"
          }
        />
        <div className="driver-organization-card__scroll">
          <div ref={allCards} className="driver-organization-card__scroll__container">
            {data.map((driverData, index) => (
              <DriverOrganizationCard
                key={driverData.color + index}
                ref={rest[index]}
                driverData={driverData}
                index={index}
                chosenDate={selectedDate}
              />
            ))}
          </div>
        </div>
      </div>
    </AntModal>
  );
};

export default DriverOrganization;
