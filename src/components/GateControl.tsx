import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Input, Select } from 'antd';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import NoDataPicture from '../assets/pictures/no-data.png';
import { usePeopleContext } from '../context/PeopleContext';
import PersonItem from './PersonItem';

const { Search } = Input;

interface IGateControlProps {
  mode: 'action' | 'status';
}

function GateControl({ mode }: IGateControlProps) {
  const { peopleData, peopleIsLoading } = usePeopleContext();
  const [searchValue, setSearchValue] = useState<string | undefined>();
  const [addingPerson, setAddingPerson] = useState<boolean>(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [armyId, setArmyId] = useState(searchValue);
  const [branch, setBranch] = useState<string | undefined>(undefined);
  const [searchParams] = useSearchParams();
  const location = searchParams.get('location');

  let filteredData =
    mode === 'status' && location
      ? peopleData?.filter((person) => person.Location === location)
      : peopleData;

  filteredData = searchValue
    ? filteredData?.filter((person) => person.ArmyId.includes(searchValue))
    : filteredData;

  return (
    <div className="gate-control">
      <Search
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="הכנס מספר אישי"
      />
      <div className="gate-control__list">
        {peopleIsLoading ? (
          <div className="gate-control__loading">
            <DotLottieReact
              src="https://lottie.host/8026cb7a-061a-44af-948e-22d13b9e55a7/TXtEMrjcEY.lottie"
              loop
              autoplay
            />
          </div>
        ) : filteredData?.length ? (
          filteredData.map((person) => (
            <PersonItem key={person.ID} person={person} mode={mode} />
          ))
        ) : (
          <div className="gate-control__no-data">
            {!addingPerson ? (
              <>
                <img src={NoDataPicture} alt="No data" />
                <span>אין מידע</span>
                {mode === 'action' && (
                  <div className="gate-control__no-data-action">
                    <button
                      className="gate-control__no-data-button"
                      onClick={() => setAddingPerson(true)}
                    >
                      להוספה לחצ/י
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="gate-control__add-person">
                <Input
                  placeholder="שם פרטי"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <Input
                  placeholder="שם משפחה"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
                <Input
                  placeholder="מספר אישי"
                  defaultValue={searchValue}
                  value={armyId}
                  onChange={(e) => setArmyId(e.target.value)}
                />
                <Select
                  placeholder="בחר אגף"
                  value={branch}
                  onChange={(value) => setBranch(value)}
                >
                  {/* {branch.map((branch) => (
                    <Select.Option key={branch} value={branch}>
                      {branch}
                    </Select.Option>
                  ))} */}
                </Select>
                <div className="gate-control__add-buttons">
                  <button
                    className="gate-control__add-button"
                    onClick={() => {
                      setAddingPerson(false);
                    }}
                  >
                    הוספה
                  </button>
                  <button
                    className="gate-control__cancel-button"
                    onClick={() => setAddingPerson(false)}
                  >
                    ביטול
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default GateControl;
