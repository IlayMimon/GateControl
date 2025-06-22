import { Select } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useHomePageContext } from "../contexts/HomePage";
import useGetMedics from "../hooks/data/useGetMedics";
import useGetMedicsPerDate from "../hooks/data/useGetMedicsPerDate";
import { addItemToList, patchItemInList, removeItemFromLsit } from "../functions/postToSharepoint";
const { Option } = Select;

interface IMedicSelectProps {
  setSelectedMedic?: React.Dispatch<React.SetStateAction<number | undefined>>;
}

const MedicSelect = ({ setSelectedMedic }: IMedicSelectProps) => {
  const { selectedDate } = useHomePageContext();
  const [medicId, setMedicId] = useState<number | undefined>(undefined);
  const [isUpdatingMedic, setIsUpdatingMedic] = useState(false);
  const medics = useGetMedics();
  const { medicsPerDate, refetch, isLoading } = useGetMedicsPerDate(selectedDate);
  const existingEntry = medicsPerDate?.[0];

  const handleChange = useCallback(
    async (value: number | undefined) => {
      setIsUpdatingMedic(true);
      if (value === undefined && existingEntry) {
        await removeItemFromLsit("MedicPerDate", existingEntry.ID, "*");
      } else if (existingEntry) {
        if (existingEntry.medicId !== value) {
          await patchItemInList("MedicPerDate", { medicId: value }, existingEntry.ID, "*");
        }
      } else {
        await addItemToList("MedicPerDate", {
          medicId: value,
          Date: selectedDate.toISOString(),
        });
      }
      setMedicId(value);
      if (setSelectedMedic) {
        setSelectedMedic(value);
      }
      await refetch();
      setIsUpdatingMedic(false);
    },
    [existingEntry, refetch, selectedDate, setSelectedMedic]
  );

  useEffect(() => {
    if (existingEntry?.medicId) {
      setMedicId(existingEntry?.medicId);
      if (setSelectedMedic) {
        setSelectedMedic(existingEntry?.medicId);
      }
    } else {
      setMedicId(undefined);
      if (setSelectedMedic) {
        setSelectedMedic(undefined);
      }
    }
  }, [existingEntry, setMedicId, setSelectedMedic]);

  return (
    <div className="medic-select">
      <Select
        value={medicId}
        placeholder={"בחר חובש אחראי"}
        loading={isUpdatingMedic || isLoading}
        disabled={isLoading || isUpdatingMedic}
        allowClear
        onChange={(medicId) => handleChange(medicId)}
      >
        {medics?.map((medic) => <Option value={medic.ID}>{medic.Title}</Option>)}
      </Select>
    </div>
  );
};

export default MedicSelect;
