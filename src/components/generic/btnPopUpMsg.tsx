import React from "react";
import { Popconfirm } from "antd";
import { BtnPopUpMsgProps } from "../../types/BtnPopUpMsgProps";

const BtnPopUpMsg: React.FC<BtnPopUpMsgProps> = ({
  title,
  msg,
  btnContent,
  isOpen,
  onConfirm,
  onCancel,
  children,
}) => {
  return (
    <Popconfirm
      placement="bottomRight"
      title={title}
      description={msg}
      okText={btnContent}
      cancelText="ביטול"
      onCancel={onCancel}
      onConfirm={onConfirm}
      open={isOpen}
    >
      {children}
    </Popconfirm>
  );
};

export default BtnPopUpMsg;
