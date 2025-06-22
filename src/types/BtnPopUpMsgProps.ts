export interface BtnPopUpMsgProps {
  title: string;
  msg: string;
  btnContent: string;
  isOpen?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  children: React.ReactNode;
}
