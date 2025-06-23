import { Button } from 'antd';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast, ToastOptions } from 'react-toastify';
import preformAction from '../functions/preformAction';
import { Person } from '../hooks/data/useGetPeople';

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
};

function PersonItem({ person, mode }: IPersonItemProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const location = searchParams.get('location') as 'פד"ם' | 'גני יעלים';

  const handleClick = async (
    location: 'פד"ם' | 'גני יעלים',
    actionType: 'inbound' | 'outbound',
    personId: number
  ) => {
    setIsLoading(true);
    const response = await preformAction(location, actionType, personId);
    if (response === 'error') {
      toast.error('אירעה שגיאה בביצוע הפעולה', toastConfig);
    } else {
      toast.success('פעולה בוצעה בהצלחה', toastConfig);
    }
    console.log(response);

    setIsLoading(false);
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
            אגף: {person.Branch}
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
            onClick={() => handleClick(location, 'inbound', person.ID)}
            disabled={isLoading}
          >
            כניסה
          </Button>
          <Button
            onClick={() => handleClick(location, 'outbound', person.ID)}
            disabled={isLoading}
          >
            יציאה
          </Button>
        </div>
      )}
    </div>
  );
}

export default PersonItem;
