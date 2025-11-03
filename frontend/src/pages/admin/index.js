import SeeQuotation from './SeeQuotation';
import { Route } from 'react-router-dom';

const AdminRoutes = () => {
  return (
    <>
      <Route path="/admin/see-quotations" element={<SeeQuotation />} />
    </>
  );
};

export default AdminRoutes; 