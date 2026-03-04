import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Input, Select, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useGateControlContext } from '../context/GateControlContext';
import type { Person } from '../hooks/data/useGetPeople';

const LOCATION_LABELS: Record<string, string> = {
  'פד"ם': 'פד"ם',
  'גני יעלים': 'מצודת האבות',
  באזל: 'באזל',
};

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

function PeopleListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { peopleData } = useGateControlContext();

  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState<string | null>(
    searchParams.get('location'),
  );
  const [branchFilter, setBranchFilter] = useState<string | null>(
    searchParams.get('branch'),
  );

  const assignedPeople = useMemo(
    () => peopleData.filter((p) => p.Branch?.Title),
    [peopleData],
  );

  const uniqueLocations = useMemo(() => {
    const set = new Set(assignedPeople.map((p) => p.Location).filter(Boolean));
    return Array.from(set);
  }, [assignedPeople]);

  const uniqueBranches = useMemo(() => {
    const set = new Set(assignedPeople.map((p) => p.Branch!.Title));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'he'));
  }, [assignedPeople]);

  const filtered = useMemo(() => {
    const lower = search.trim().toLowerCase();
    return assignedPeople.filter((p) => {
      if (locationFilter && p.Location !== locationFilter) return false;
      if (branchFilter && p.Branch?.Title !== branchFilter) return false;
      if (lower) {
        return (
          p.Title?.toLowerCase().includes(lower) ||
          p.LastName?.toLowerCase().includes(lower) ||
          p.ArmyId?.includes(lower)
        );
      }
      return true;
    });
  }, [assignedPeople, locationFilter, branchFilter, search]);

  const columns: ColumnsType<Person> = [
    {
      title: 'שם פרטי',
      dataIndex: 'Title',
      key: 'firstName',
      sorter: (a, b) => (a.Title ?? '').localeCompare(b.Title ?? '', 'he'),
    },
    {
      title: 'שם משפחה',
      dataIndex: 'LastName',
      key: 'lastName',
      sorter: (a, b) =>
        (a.LastName ?? '').localeCompare(b.LastName ?? '', 'he'),
    },
    {
      title: 'מספר אישי',
      dataIndex: 'ArmyId',
      key: 'armyId',
    },
    {
      title: 'אגף',
      key: 'branch',
      render: (_, record) => record.Branch?.Title ?? '-',
      sorter: (a, b) =>
        (a.Branch?.Title ?? '').localeCompare(b.Branch?.Title ?? '', 'he'),
      filters: uniqueBranches.map((b) => ({ text: b, value: b })),
      onFilter: (value, record) => record.Branch?.Title === value,
      filterSearch: true,
    },
    {
      title: 'מיקום',
      dataIndex: 'Location',
      key: 'location',
      render: (loc: string) => LOCATION_LABELS[loc] ?? loc,
      filters: uniqueLocations.map((loc) => ({
        text: LOCATION_LABELS[loc] ?? loc,
        value: loc,
      })),
      onFilter: (value, record) => record.Location === value,
    },
  ];

  const hasFilter = !!locationFilter || !!branchFilter || !!search;

  const exportToExcel = () => {
    const rows = filtered.map((p) => ({
      'שם פרטי': p.Title ?? '',
      'שם משפחה': p.LastName ?? '',
      'מספר אישי': p.ArmyId ?? '',
      'אגף': p.Branch?.Title ?? '',
      'מיקום': LOCATION_LABELS[p.Location] ?? p.Location ?? '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'נוכחים');
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    const today = new Date();
    const dateStr = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;
    const parts = ['נוכחים', dateStr];
    if (locationFilter) parts.push(LOCATION_LABELS[locationFilter] ?? locationFilter);
    if (branchFilter) parts.push(branchFilter);
    if (search.trim()) parts.push(`חיפוש-${search.trim()}`);
    const filename = `${parts.join('_')}.xlsx`;

    saveAs(new Blob([buf], { type: 'application/octet-stream' }), filename);
  };

  return (
    <div className="people-list-page">
      <div className="people-list-page__header">
        <button
          className="people-list-page__back"
          onClick={() => navigate(-1)}
          aria-label="חזור"
        >
          <BackArrow />
          <span className="people-list-page__back-label">חזור</span>
        </button>
        <h1 className="people-list-page__title">
          רשימת נוכחים
          <span className="people-list-page__count">{filtered.length}</span>
        </h1>
        <div className="people-list-page__header-actions">
          {hasFilter && (
            <button
              className="people-list-page__clear"
              onClick={() => {
                setSearch('');
                setLocationFilter(null);
                setBranchFilter(null);
              }}
            >
              נקה סינון
            </button>
          )}
          <button className="people-list-page__export" onClick={exportToExcel}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>ייצוא Excel</span>
          </button>
        </div>
      </div>

      <div className="people-list-page__filters">
        <Input
          placeholder="חיפוש לפי שם או מספר אישי..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          className="people-list-page__search"
        />
        <Select
          placeholder="סינון לפי מיקום"
          value={locationFilter ?? undefined}
          onChange={(v) => setLocationFilter(v ?? null)}
          allowClear
          className="people-list-page__select"
          options={uniqueLocations.map((loc) => ({
            value: loc,
            label: LOCATION_LABELS[loc] ?? loc,
          }))}
        />
        <Select
          placeholder="סינון לפי אגף"
          value={branchFilter ?? undefined}
          onChange={(v) => setBranchFilter(v ?? null)}
          allowClear
          className="people-list-page__select"
          showSearch
          filterOption={(input, option) =>
            (option?.label as string)?.includes(input)
          }
          options={uniqueBranches.map((b) => ({ value: b, label: b }))}
        />
      </div>

      <div className="people-list-page__table-wrap">
        <Table<Person>
          columns={columns}
          dataSource={filtered}
          rowKey="ID"
          locale={{ emptyText: 'אין נתונים' }}
          pagination={{
            pageSize: 25,
            showSizeChanger: false,
            showTotal: (total) => `סה"כ ${total} רשומות`,
          }}
          size="middle"
          className="people-list-page__table"
          scroll={{ y: 'calc(100vh - 280px)' }}
        />
      </div>
    </div>
  );
}

export default PeopleListPage;
