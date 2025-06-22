import DatePicker from "./DatePicker";
import Kpies from "./Kpies";
import MedicSelect from "./MedicSelect";

const Header = () => {
  return (
    <div className="header">
      <div className="header__right">
        <DatePicker />
        <div className="header__right__medic">
          <MedicSelect />
        </div>
      </div>
      <div className="header__left">
        <Kpies />
      </div>
    </div>
  );
};

export default Header;
