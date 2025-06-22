import { Modal, Progress } from "antd";
import Lottie from "lottie-react";
import busAnimation from "../assets/busAnimation.json";

interface AutomationModalProps {
  visible: boolean;
  status: { isOver: boolean; step: number; isAssigned: boolean } | null;
}

const AutomationModal = ({ visible, status }: AutomationModalProps) => {
  const percent = status
    ? Math.min(Math.round((status.step / 8) * 100), 100)
    : 0;

  return (
    <Modal
      className="automation-modal"
      open={visible}
      centered
      footer={null}
      closable={false}
    >
      <div className="automation-modal__content">
        <Lottie
          animationData={busAnimation}
          loop
          className="automation-modal__content__animation"
        />
        <h3 style={{ marginTop: 24 }}>האוטומציה יצאה לריצה מבצעית</h3>
        <p style={{ color: "#666" }}>
          המערכת עובדת מאחורי הקלעים על פעולות מדויקות במיוחד.
          <br />
          תהליך זה יכול לקחת כמה דקות – ניתן לעבור למסך אחר, היא תמשיך בשקט
          וביעילות, כמו חייל טוב.
        </p>
        <Progress percent={percent} />
      </div>
    </Modal>
  );
};

export default AutomationModal;
