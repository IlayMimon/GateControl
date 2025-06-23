import { Input } from 'antd';
import useGetPeople from '../hooks/data/useGetPeople';
import { useState } from 'react';
import PersonItem from './PersonItem';
import { useSearchParams } from 'react-router-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const { Search } = Input;

interface IGateControlProps {
  mode: 'action' | 'status';
}

function GateControl({ mode }: IGateControlProps) {
  const { data, isLoading } = useGetPeople();
  const [searchValue, setSearchValue] = useState<string | undefined>();
  const [searchParams] = useSearchParams();
  const location = searchParams.get('location');

  let filteredData =
    mode === 'status' && location
      ? data?.filter((person) => person.Location === location)
      : data;

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
        {isLoading ? (
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
          <div className="gate-control__no-data">אין נתונים</div>
        )}
      </div>
    </div>
  );
}

export default GateControl;
