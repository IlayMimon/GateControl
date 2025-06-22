import { IconSend } from "@tabler/icons-react";
import { Button } from "antd";

interface DriverOrganizationHeaderProps {
  paramedic: string;
  isSendDisabled: boolean;
  downloadImages: () => void;
  sendToDrivers: () => void;
}

const DriverOrganizationHeader = ({
  paramedic,
  isSendDisabled,
  downloadImages,
  sendToDrivers,
}: DriverOrganizationHeaderProps) => {
  return (
    <div className="driver-organization-header">
      <div className="driver-organization-header__button__container">
        <Button
          className="driver-organization-header__button"
          color="default"
          variant="solid"
          disabled={isSendDisabled}
          onClick={sendToDrivers}
        >
          שלח לנהגים
          <IconSend className="driver-organization-header__button__icon" />
        </Button>
        <Button
          onClick={downloadImages}
          className="driver-organization-header__button"
          color="default"
          variant="outlined"
        >
          הורד כתמונות
        </Button>
      </div>
      <div className="driver-organization-header__title__container">
        <span className="driver-organization-header__title">
          סידור עבודה יומי לנהג
        </span>
        <span className="driver-organization-header__title__name">
          {paramedic}
        </span>
      </div>
    </div>
  );
};

export default DriverOrganizationHeader;
