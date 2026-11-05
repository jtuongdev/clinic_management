import { ExaminationProvider } from './context/ExaminationContext';
import ExaminationManagement from './page/examination.management';
import ExaminationOverview from './components/ExaminationOverview';
import ExaminationDepartment from './components/ExaminationDepartment';
import ExaminationPatients from './components/ExaminationPatients';
import ExaminationList from './components/ExaminationList';
import ExaminationCLS from './components/ExaminationCLS';
import ExaminationPharmacy from './components/ExaminationPharmacy';
import ExaminationFinance from './components/ExaminationFinance';
import ExaminationHR from './components/ExaminationHR';
import ExaminationFacility from './components/ExaminationFacility';
import ExaminationReports from './components/ExaminationReports';
import NhapKetQuaPage from './page/NhapKetQuaPage';
import ClinicRoomMonitorPage from './page/ClinicRoomMonitorPage';
import ParaclinicalStationPage from './page/ParaclinicalStationPage';
import QueuePublicDisplayPage from './page/QueuePublicDisplayPage';

export const examinationRoutes = [
  {
    path: 'examination',
    element: (
      <ExaminationProvider>
        <ExaminationManagement />
      </ExaminationProvider>
    ),
    children: [
      { path: 'overview', element: <ExaminationOverview /> },
      { path: 'department', element: <ExaminationDepartment /> },
      { path: 'patients', element: <ExaminationPatients /> },
      { path: 'list', element: <ExaminationList /> },
      { path: 'cls', element: <ExaminationCLS /> },
      { path: 'cls/nhap-ket-qua/:id', element: <NhapKetQuaPage /> },
      { path: 'pharmacy', element: <ExaminationPharmacy /> },
      { path: 'finance', element: <ExaminationFinance /> },
      { path: 'hr', element: <ExaminationHR /> },
      { path: 'facility', element: <ExaminationFacility /> },
      { path: 'reports', element: <ExaminationReports /> },
      { path: 'room-monitor', element: <ClinicRoomMonitorPage /> },
      { path: 'paraclinical-station', element: <ParaclinicalStationPage /> },
      { path: 'queue-display', element: <QueuePublicDisplayPage /> },
    ],
  },
];