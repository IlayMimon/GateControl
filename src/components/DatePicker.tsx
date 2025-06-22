import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { DatePicker as AntDatePicker, Button, ConfigProvider, Tag } from "antd";
import heIL from "antd/lib/locale/he_IL";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/he";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useMemo } from "react";
import { useHomePageContext } from "../contexts/HomePage";

dayjs.extend(customParseFormat);
dayjs.locale("he");

const allowedDays = [1, 2, 3]; // Sunday, Monday, Tuesday

const DatePicker = () => {
  const { selectedDate, setSelectedDate } = useHomePageContext();

  const isAllowedDay = (day: number) => allowedDays.includes(day);

  const findNextAllowedDay = (current: Dayjs): Dayjs => {
    let next = current.add(1, "day");
    while (!isAllowedDay(next.day())) {
      next = next.add(1, "day");
    }
    return next;
  };

  const findPreviousAllowedDay = (current: Dayjs): Dayjs => {
    let prev = current.subtract(1, "day");
    while (!isAllowedDay(prev.day())) {
      prev = prev.subtract(1, "day");
    }
    return prev;
  };

  const goPreviousDay = () => setSelectedDate(findPreviousAllowedDay(selectedDate));
  const goNextDay = () => setSelectedDate(findNextAllowedDay(selectedDate));
  const disabledDate = (current: Dayjs) => !isAllowedDay(current.day());

  const isToday = useMemo(() => selectedDate.isSame(dayjs(), "day"), [selectedDate]);

  return (
    <div className="date-picker">
      <Button
        className="date-picker__button date-picker__button--prev"
        onClick={goPreviousDay}
        icon={<RightOutlined />}
      />

      <ConfigProvider locale={heIL} direction="rtl">
        <AntDatePicker
          className="date-picker__input"
          picker="date"
          value={selectedDate}
          inputMode="none"
          inputReadOnly
          allowClear={false}
          prefix={
            isToday && (
              <Tag className="date-picker__input--tag" bordered={false}>
                היום
              </Tag>
            )
          }
          suffixIcon={null}
          format="[יום] dd DD.MM.YY"
          onChange={(val) => {
            if (val && isAllowedDay(val.day())) {
              setSelectedDate(val);
            }
          }}
          disabledDate={disabledDate}
        />
      </ConfigProvider>

      <Button
        className="date-picker__button date-picker__button--next"
        onClick={goNextDay}
        icon={<LeftOutlined />}
      />
    </div>
  );
};

export default DatePicker;
