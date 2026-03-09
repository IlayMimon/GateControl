import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useGateControlContext } from '../context/GateControlContext';

const LOCATIONS: { key: string; label: string; color: string }[] = [
  { key: 'פד"ם', label: 'פד"ם', color: '#fa8c16' },
  { key: 'גני יעלים', label: 'מצודת האבות', color: '#722ed1' },
  { key: 'באזל', label: 'באזל', color: '#13c2c2' },
];

const BRANCH_COLORS = [
  '#007AFF',
  '#34c759',
  '#ff9f0a',
  '#af52de',
  '#5ac8fa',
  '#ff2d55',
  '#a2845e',
  '#30b0c7',
];

function DashboardPage() {
  const navigate = useNavigate();
  const { peopleData } = useGateControlContext();
  const [activeLocation, setActiveLocation] = useState<string | null>(null);
  const [activeBranch, setActiveBranch] = useState<string | null>(null);

  // Only count people assigned to a branch and at one of the known locations
  const LOCATION_KEYS = useMemo(() => new Set(LOCATIONS.map((l) => l.key)), []);

  const assignedPeople = useMemo(
    () =>
      peopleData.filter(
        (p) => p.Branch?.Title && LOCATION_KEYS.has(p.Location),
      ),
    [peopleData, LOCATION_KEYS],
  );

  const locationCounts = useMemo(
    () =>
      LOCATIONS.map((loc) => ({
        ...loc,
        count: assignedPeople.filter((p) => p.Location === loc.key).length,
      })),
    [assignedPeople],
  );

  // Pie data: location distribution, optionally filtered by activeBranch
  const pieData = useMemo(() => {
    const source = activeBranch
      ? assignedPeople.filter((p) => p.Branch?.Title === activeBranch)
      : assignedPeople;
    return LOCATIONS.map((loc) => ({
      name: loc.label,
      locationKey: loc.key,
      value: source.filter((p) => p.Location === loc.key).length,
      color: loc.color,
    })).filter((d) => d.value > 0);
  }, [assignedPeople, activeBranch]);

  // Bar data: branch distribution, optionally filtered by activeLocation
  // "נוכחים" = only people assigned to a location
  const barData = useMemo(() => {
    const source = activeLocation
      ? assignedPeople.filter((p) => p.Location === activeLocation)
      : assignedPeople.filter((p) => p.Location);
    const map = new Map<string, number>();
    source.forEach((person) => {
      const name = person.Branch!.Title;
      map.set(name, (map.get(name) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [assignedPeople, activeLocation]);

  const handlePieClick = (locationKey: string) => {
    setActiveLocation((prev) => (prev === locationKey ? null : locationKey));
  };

  const handleKpiClick = (locationKey: string) => {
    setActiveLocation((prev) => (prev === locationKey ? null : locationKey));
  };

  const handleBarClick = (branchName: string) => {
    setActiveBranch((prev) => (prev === branchName ? null : branchName));
  };

  const goToPeopleList = () => {
    const params = new URLSearchParams();
    if (activeLocation) params.set('location', activeLocation);
    if (activeBranch) params.set('branch', activeBranch);
    navigate(`/people?${params.toString()}`);
  };

  const activeLocationLabel = LOCATIONS.find(
    (l) => l.key === activeLocation,
  )?.label;
  const hasFilter = activeLocation !== null || activeBranch !== null;

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__header">
        {/* <button
          className="dashboard-page__back"
          onClick={() => navigate(-1)}
          aria-label="חזור"
        >
          <BackArrow />
          <span className="dashboard-page__back-label">חזור</span>
        </button> */}
        <h1 className="dashboard-page__title">דאשבורד נוכחות</h1>
        <div className="dashboard-page__header-actions">
          {hasFilter && (
            <button
              className="dashboard-page__clear"
              onClick={() => {
                setActiveLocation(null);
                setActiveBranch(null);
              }}
            >
              נקה סינון
            </button>
          )}
          <button
            className="dashboard-page__history-btn"
            onClick={() => navigate('/history')}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <span>היסטוריה</span>
          </button>
          <button
            className="dashboard-page__names-btn"
            onClick={goToPeopleList}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>רשימת שמות</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="dashboard-page__kpis">
        {locationCounts.map((loc) => (
          <button
            key={loc.key}
            className={`dashboard-kpi ${activeLocation === loc.key ? 'dashboard-kpi--active' : ''}`}
            style={{ '--kpi-color': loc.color } as React.CSSProperties}
            onClick={() => handleKpiClick(loc.key)}
          >
            <span className="dashboard-kpi__count">{loc.count}</span>
            <span className="dashboard-kpi__label">{loc.label}</span>
            <span className="dashboard-kpi__sublabel">נמצאים במתקן</span>
            <div className="dashboard-kpi__accent" />
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="dashboard-page__charts">
        {/* Bar Chart */}
        <div className="dashboard-chart-card">
          <div className="dashboard-chart-card__header">
            <h3>נוכחים לפי אגף</h3>
            {activeLocationLabel && (
              <span
                className="dashboard-chart-card__filter-tag"
                style={
                  {
                    '--tag-color': LOCATIONS.find(
                      (l) => l.key === activeLocation,
                    )?.color,
                  } as React.CSSProperties
                }
              >
                {activeLocationLabel}
              </span>
            )}
          </div>
          {barData.length === 0 ? (
            <div className="dashboard-chart-card__empty">אין נתונים</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={barData}
                margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{
                    fontSize: 12,
                    fontFamily: 'Rubik',
                    fill: 'rgba(0,0,0,0.65)',
                  }}
                  angle={-25}
                  textAnchor="start"
                  interval={0}
                  height={100}
                />
                <YAxis
                  orientation="left"
                  allowDecimals={false}
                  tick={{
                    fontSize: 13,
                    fontFamily: 'Rubik',
                    fill: 'rgba(0,0,0,0.5)',
                    textAnchor: 'start',
                  }}
                  width={42}
                />
                <Tooltip
                  formatter={(val) => [val, 'נוכחים']}
                  contentStyle={{
                    fontFamily: 'Rubik',
                    fontSize: 14,
                    direction: 'rtl',
                    borderRadius: 10,
                    border: '1px solid rgba(0,0,0,0.08)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  }}
                  cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                />
                <Bar
                  dataKey="count"
                  radius={[6, 6, 0, 0]}
                  onClick={(data) =>
                    handleBarClick((data as { name: string }).name)
                  }
                  cursor="pointer"
                >
                  {barData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={
                        activeBranch === entry.name
                          ? BRANCH_COLORS[index % BRANCH_COLORS.length]
                          : activeBranch
                            ? `${BRANCH_COLORS[index % BRANCH_COLORS.length]}50`
                            : BRANCH_COLORS[index % BRANCH_COLORS.length]
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          <p className="dashboard-chart-card__hint">
            לחץ על עמודה לסינון לפי אגף
          </p>
        </div>

        {/* Pie Chart */}
        <div className="dashboard-chart-card">
          <div className="dashboard-chart-card__header">
            <h3>פילוח לפי מיקום</h3>
            {activeBranch && (
              <span
                className="dashboard-chart-card__filter-tag"
                style={{ '--tag-color': '#007AFF' } as React.CSSProperties}
              >
                {activeBranch}
              </span>
            )}
          </div>
          {pieData.length === 0 ? (
            <div className="dashboard-chart-card__empty">אין נתונים</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="42%"
                  outerRadius={90}
                  innerRadius={42}
                  dataKey="value"
                  nameKey="name"
                  onClick={(entry: { locationKey: string }) =>
                    handlePieClick(entry.locationKey)
                  }
                  cursor="pointer"
                  paddingAngle={3}
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.locationKey}
                      fill={
                        activeLocation === entry.locationKey
                          ? entry.color
                          : activeLocation
                            ? `${entry.color}50`
                            : entry.color
                      }
                      stroke={
                        activeLocation === entry.locationKey
                          ? '#fff'
                          : 'transparent'
                      }
                      strokeWidth={3}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [val, name]}
                  contentStyle={{
                    fontFamily: 'Rubik',
                    fontSize: 14,
                    direction: 'rtl',
                    borderRadius: 10,
                    border: '1px solid rgba(0,0,0,0.08)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={12}
                  wrapperStyle={{
                    fontFamily: 'Rubik',
                    fontSize: 16,
                    fontWeight: 500,
                    paddingTop: 6,
                  }}
                  formatter={(value, entry) => (
                    <span
                      style={{
                        color: (entry as { color?: string }).color ?? 'inherit',
                      }}
                    >
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
          <p className="dashboard-chart-card__hint">
            לחץ על פרוסה לסינון לפי מיקום
          </p>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
