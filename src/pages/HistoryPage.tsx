import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import { DatePicker } from 'antd';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import fetchAllSharePointPages from '../functions/fetchAllSharePointPages';
import type { Action } from '../hooks/data/useGetActions';
import { useGateControlContext } from '../context/GateControlContext';

const LOCATIONS = [
  { key: 'פד"ם', label: 'פד"ם', color: '#fa8c16' },
  { key: 'גני יעלים', label: 'מצודת האבות', color: '#722ed1' },
  { key: 'באזל', label: 'באזל', color: '#13c2c2' },
];

const LOCATION_KEYS = new Set(LOCATIONS.map((l) => l.key));

const ALL_ACTIONS_URL =
  `/_api/web/lists/getbytitle('Actions')/items` +
  `?$select=ID,Created,ArmyId/ArmyId,ActionType,Location` +
  `&$expand=ArmyId&$orderby=Created asc&$top=500`;

/**
 * Computes hourly occupancy anchored to the live People-list count.
 *
 * Instead of summing from 0 forward (which drifts from reality),
 * we start from the known-correct current count and walk BACKWARDS
 * through all actions, undoing each one to reconstruct history.
 *
 * This means ALL historical hours — not just the current one — stay
 * consistent with the People list as the ground truth.
 */
function computeHourlyAttendance(
  allActions: Action[],
  locationKey: string,
  date: Dayjs,
  liveCount: number,
): { label: string; count: number }[] {
  const dayStart = date.startOf('day').valueOf();
  const isToday = date.isSame(dayjs(), 'day');
  const maxHour = isToday ? dayjs().hour() : 23;

  // Walk backwards from liveCount, undoing each action to get the count AFTER it happened
  let running = liveCount;
  const flatTimeline: { ms: number; count: number }[] = [];

  const relevant = allActions
    .filter((a) => a.Location === locationKey)
    .sort((a, b) => new Date(b.Created).getTime() - new Date(a.Created).getTime()); // descending

  for (const action of relevant) {
    // running at this point = occupancy right after this action happened
    flatTimeline.push({ ms: new Date(action.Created).getTime(), count: running });
    // Undo the action to get the count before it
    if (action.ActionType === 'inbound') {
      running = Math.max(0, running - 1);
    } else {
      running += 1;
    }
  }

  // Sort ascending for forward scan
  flatTimeline.sort((a, b) => a.ms - b.ms);

  // running now = occupancy before the very first action ever recorded
  const countBeforeHistory = running;

  // Find the carry-over at midnight of the selected day
  // = count after the last action that happened before this day
  let lastKnown = countBeforeHistory;
  for (const e of flatTimeline) {
    if (e.ms < dayStart) lastKnown = e.count;
    else break;
  }

  // Resample to hourly buckets with forward-fill
  const slots: { label: string; count: number }[] = [];
  for (let h = 0; h <= maxHour; h++) {
    const bucketStart = dayStart + h * 3_600_000;
    const bucketEnd = bucketStart + 3_600_000;

    for (const e of flatTimeline) {
      if (e.ms > bucketStart && e.ms <= bucketEnd) {
        lastKnown = e.count;
      }
    }

    // Current hour on today: use liveCount directly (identical to the KPI)
    const count = isToday && h === maxHour ? liveCount : lastKnown;
    slots.push({ label: `${String(h).padStart(2, '0')}:00`, count: Math.max(0, count) });
  }

  return slots;
}

function findPeakDay(
  allActions: Action[],
  locationKey: string,
  liveCount: number,
): Dayjs {
  const dates = new Set(
    allActions
      .filter((a) => a.Location === locationKey)
      .map((a) => dayjs(a.Created).format('YYYY-MM-DD')),
  );

  let peakDay = '';
  let peakCount = 0;

  for (const day of dates) {
    const hourly = computeHourlyAttendance(allActions, locationKey, dayjs(day), liveCount);
    const dayPeak = Math.max(...hourly.map((h) => h.count));
    if (dayPeak > peakCount) {
      peakCount = dayPeak;
      peakDay = day;
    }
  }

  return peakDay ? dayjs(peakDay) : dayjs();
}

const BackArrow = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

function HistoryPage() {
  const navigate = useNavigate();
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [loadingPeakFor, setLoadingPeakFor] = useState<string | null>(null);

  // People list — the ground truth for current occupancy per location
  const { peopleData } = useGateControlContext();

  const liveCountByLocation = useMemo(
    () =>
      Object.fromEntries(
        LOCATIONS.map((loc) => [
          loc.key,
          peopleData.filter(
            (p) => p.Branch?.Title && LOCATION_KEYS.has(p.Location) && p.Location === loc.key,
          ).length,
        ]),
      ),
    [peopleData],
  );

  // All historical actions — fetched once, cached
  const { data: allActions = [], isLoading } = useQuery<Action[]>({
    queryKey: ['all-actions-history'],
    queryFn: () => fetchAllSharePointPages<Action>(ALL_ACTIONS_URL),
  });

  const isToday = date.isSame(dayjs(), 'day');

  const handleFindPeakDay = async (locationKey: string) => {
    setLoadingPeakFor(locationKey);
    const peak = findPeakDay(allActions, locationKey, liveCountByLocation[locationKey] ?? 0);
    setDate(peak);
    setLoadingPeakFor(null);
  };

  return (
    <div className="history-page">
      <div className="history-page__header">
        <button
          className="history-page__back"
          onClick={() => navigate(-1)}
          aria-label="חזור"
        >
          <BackArrow />
          <span className="history-page__back-label">חזור</span>
        </button>
        <h1 className="history-page__title">היסטוריית נוכחות</h1>
        <div className="history-page__date-wrap">
          <DatePicker
            value={date}
            onChange={(d) => d && setDate(d)}
            disabledDate={(d) => d.isAfter(dayjs(), 'day')}
            format="DD/MM/YYYY"
            allowClear={false}
            className="history-page__date-picker"
          />
        </div>
      </div>

      <div className="history-page__cards">
        {LOCATIONS.map((loc) => {
          const liveCount = liveCountByLocation[loc.key] ?? 0;
          const hourly = computeHourlyAttendance(allActions, loc.key, date, liveCount);
          const counts = hourly.map((h) => h.count);
          const peak = counts.length ? Math.max(...counts) : 0;
          const activeCounts = counts.filter((c) => c > 0);
          const min = activeCounts.length ? Math.min(...activeCounts) : 0;
          const isPeakLoading = loadingPeakFor === loc.key;

          return (
            <div
              className="history-chart-card"
              key={loc.key}
              style={{ '--loc-color': loc.color } as React.CSSProperties}
            >
              <div className="history-chart-card__accent" />
              <div className="history-chart-card__header">
                <h3 className="history-chart-card__title">{loc.label}</h3>
                <div className="history-chart-card__stats">
                  <span className="history-chart-card__stat history-chart-card__stat--peak">
                    <span className="history-chart-card__stat-label">שיא</span>
                    <span className="history-chart-card__stat-value">{isLoading ? '—' : peak}</span>
                  </span>
                  <span className="history-chart-card__stat history-chart-card__stat--min">
                    <span className="history-chart-card__stat-label">מינ׳</span>
                    <span className="history-chart-card__stat-value">{isLoading ? '—' : min}</span>
                  </span>
                  {isToday && (
                    <span className="history-chart-card__stat history-chart-card__stat--live">
                      <span className="history-chart-card__stat-label">כעת</span>
                      <span className="history-chart-card__stat-value">{liveCount}</span>
                    </span>
                  )}
                </div>
                <button
                  className="history-chart-card__peak-btn"
                  onClick={() => handleFindPeakDay(loc.key)}
                  disabled={isPeakLoading || isLoading}
                  title="מצא את יום השיא"
                >
                  {isPeakLoading ? '...' : '📈 יום שיא'}
                </button>
              </div>

              {isLoading ? (
                <div className="history-chart-card__loading">טוען...</div>
              ) : peak === 0 ? (
                <div className="history-chart-card__empty">אין נתונים לתאריך זה</div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart
                    data={hourly}
                    margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id={`grad-${loc.key}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="5%" stopColor={loc.color} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={loc.color} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fontFamily: 'Rubik', fill: 'rgba(0,0,0,0.45)' }}
                      interval={2}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fontFamily: 'Rubik', fill: 'rgba(0,0,0,0.45)' }}
                      tickLine={false}
                      axisLine={false}
                      width={32}
                    />
                    <Tooltip
                      formatter={(val) => [val, 'נוכחים']}
                      contentStyle={{
                        fontFamily: 'Rubik',
                        fontSize: 13,
                        direction: 'rtl',
                        borderRadius: 10,
                        border: '1px solid rgba(0,0,0,0.08)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke={loc.color}
                      strokeWidth={2}
                      fill={`url(#grad-${loc.key})`}
                      dot={false}
                      activeDot={{ r: 4, fill: loc.color }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default HistoryPage;
