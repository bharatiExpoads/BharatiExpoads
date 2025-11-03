import React from 'react';
import { Link } from 'react-router-dom';
import { 
  AiOutlineDashboard, AiOutlineDatabase, AiOutlineUser, 
  AiOutlineTeam, AiOutlineUserAdd, AiOutlineShop,
  AiOutlineApartment, AiOutlineBank
} from 'react-icons/ai';
import Layout from '../components/Layout';

const MasterCard = ({ title, icon, description, to }) => (
  <Link 
    to={to}
    className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-blue-100 rounded-full">
        {icon}
      </div>
    </div>
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    <p className="mt-2 text-sm text-gray-600">{description}</p>
  </Link>
);

const MastersDashboard = () => {
  return (
    <Layout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <AiOutlineDashboard className="mr-2" /> Master Data Management
          </h1>
          <p className="text-gray-600">Manage all your master data from a single place</p>
        </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <MasterCard
          title="Hoarding Master"
          icon={<AiOutlineDatabase className="h-6 w-6 text-blue-600" />}
          description="Manage your hoarding sites and locations"
          to="/masters/hoarding"
        />
        
        <MasterCard
          title="Labour Master"
          icon={<AiOutlineTeam className="h-6 w-6 text-blue-600" />}
          description="Manage your labour workforce and skills"
          to="/masters/labour"
        />
        
        <MasterCard
          title="Employee Master"
          icon={<AiOutlineUserAdd className="h-6 w-6 text-blue-600" />}
          description="Manage your employee information and roles"
          to="/masters/employee"
        />
        
        <MasterCard
          title="Landlord Master"
          icon={<AiOutlineUser className="h-6 w-6 text-blue-600" />}
          description="Manage landlord information for hoardings"
          to="/masters/landlord"
        />
        
        <MasterCard
          title="Client Master"
          icon={<AiOutlineShop className="h-6 w-6 text-blue-600" />}
          description="Manage your client and customer data"
          to="/masters/client"
        />
        
        <MasterCard
          title="Agency Master"
          icon={<AiOutlineApartment className="h-6 w-6 text-blue-600" />}
          description="Manage agency partnerships and details"
          to="/masters/agency"
        />
        
        <MasterCard
          title="Creditor Master"
          icon={<AiOutlineBank className="h-6 w-6 text-blue-600" />}
          description="Manage creditor information and credit limits"
          to="/masters/creditor"
        />

        <MasterCard
  title="Designer Master"
  icon={<AiOutlineUser className="h-6 w-6 text-purple-600" />}  // you can change icon/color if desired
  description="Manage designer profiles and related information"
  to="/masters/designer"
/>

      </div>
    </div>
    </Layout>
  );
};

export default MastersDashboard;