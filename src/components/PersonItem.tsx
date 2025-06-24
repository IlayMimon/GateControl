import { Button } from 'antd';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast, ToastOptions } from 'react-toastify';
import preformAction from '../functions/preformAction';
import { Person } from '../hooks/data/useGetPeople';
import { IoPersonAdd, IoPersonRemove } from 'react-icons/io5';
import { Select } from 'antd';
import useGetBranch from '../hooks/data/useGetBranch';

interface IPersonItemProps {
  person: Person;
  mode: 'action' | 'status';
}

const toastConfig: ToastOptions = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: false,
  pauseOnHover: false,
  draggable: true,
  progress: undefined,
  theme: 'light',
  className: 'toast-notification',
};

function PersonItem({ person, mode }: IPersonItemProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [branch, setBranch] = useState<number | undefined>(person.Branch);
  const [searchParams] = useSearchParams();
  const location = searchParams.get('location') as 'פד"ם' | 'גני יעלים';
  const { data: branchData } = useGetBranch();

  const handleClick = async (
    location: 'פד"ם' | 'גני יעלים',
    actionType: 'inbound' | 'outbound',
    personId: number,
    personBranch?: number
  ) => {
    console.log('person branch ---- ', personBranch);
    setIsLoading(true);

    if (!person.Branch && !branch) {
      toast.error('יש לבחור אגף', toastConfig);
      setIsLoading(false);
      return;
    } else {
      const response = await preformAction(location, actionType, personId);
      if (response === 'error') {
        toast.error('אירעה שגיאה בביצוע הפעולה', toastConfig);
      } else {
        toast.success('פעולה בוצעה בהצלחה', toastConfig);
      }
      console.log(response);

      setIsLoading(false);
    }
  };

  const handleBranchChange = (value: number) => {
    setBranch(value);
    console.log('Selected:', value);
  };

  return (
    <div className="person-item">
      <div className="person-item__right">
        <div className="person-item__right__title">
          <span className="person-item__right__title__name">
            {person.Title} {person.LastName}
          </span>
          <span className="person-item__right__title__army-id">
            {person.ArmyId}
          </span>
        </div>
        <div className="person-item__subtitle">
          <span className="person-item__subtitle__branch">
            אגף:
            {!person.Branch ? (
              <Select
                showSearch
                placeholder="בחר אגף"
                onChange={handleBranchChange}
                filterOption={(input, option) => {
                  var _a;
                  return (
                    (_a =
                      option === null || option === void 0
                        ? void 0
                        : option.label) !== null && _a !== void 0
                      ? _a
                      : ''
                  )
                    .toLowerCase()
                    .includes(input.toLowerCase());
                }}
                options={branchData?.map((branch) => ({
                  value: branch.ID,
                  label: branch.Title,
                }))}
              />
            ) : (
              person.Branch
            )}
          </span>
        </div>
      </div>
      {mode === 'status' && (
        <div className="person-item__status">
          <span className="person-item__status__text">נמצא במתקן</span>
        </div>
      )}
      {mode === 'action' && (
        <div className="person-item__left">
          <Button
            className="person-item__left__enter-button"
            onClick={() =>
              handleClick(location, 'inbound', person.ID, person.Branch)
            }
            disabled={isLoading}
          >
            <IoPersonAdd style={{ marginLeft: '2px' }} />
            כניסה
          </Button>
          <Button
            className="person-item__left__exit-button"
            onClick={() => handleClick(location, 'outbound', person.ID)}
            disabled={isLoading}
          >
            <IoPersonRemove style={{ marginLeft: '2px' }} />
            יציאה
          </Button>
        </div>
      )}
    </div>
  );
}

export default PersonItem;
