import { Button } from "antd";
import { Person } from "../hooks/data/useGetPeople";

interface IPersonItemProps {
  person: Person;
  mode: "action" | "status";
}
function PersonItem({ person, mode }: IPersonItemProps) {
  return (
    <div className="person-item">
      <div className="person-item__right">
        <div className="person-item__right__title">
          <span className="person-item__right__title__name">
            {person.Title} {person.LastName}
          </span>
          <span className="person-item__right__title__army-id">{person.ArmyId}</span>
        </div>
        <div className="person-item__subtitle">
          <span className="person-item__subtitle__branch">אגף: {person.Branch}</span>
        </div>
      </div>
      {mode === "status" && (
        <div className="person-item__status">
          <span className="person-item__status__text">נמצא במתקן</span>
        </div>
      )}
      {mode === "action" && (
        <div className="person-item__left">
          <Button>כניסה</Button>
          <Button>יציאה</Button>
        </div>
      )}
    </div>
  );
}

export default PersonItem;
