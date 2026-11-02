import { PatientManagement } from '../patient/page/patient.management';
import { PatientDetail } from './page/patient.detail';

export const patientRoutes = [
  {
    path: 'patients',
    element: <PatientManagement/>,
  },
  {
    path: 'patient/detail/:id', 
    element: <PatientDetail />,
  }
];