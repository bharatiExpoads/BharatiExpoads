import React from 'react';
import { Link } from 'react-router-dom';
import {
  AiOutlineDashboard,
  AiOutlineFileText,
  AiOutlineEye,
  AiOutlineTeam
} from 'react-icons/ai';
import EmployeeLayout from '../components/EmployeeLayout'; // Use the employee/admin layout

const CampaignCard = ({ title, icon, description, to }) => (
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

const CampaignDashboard = () => {
  return (
    <EmployeeLayout >
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <AiOutlineDashboard className="mr-2" /> Campaign Management Dashboard
          </h1>
          <p className="text-gray-600">Manage campaigns, enquiries, and quotations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <CampaignCard
            title="Enquiries"
            icon={<AiOutlineTeam className="h-6 w-6 text-blue-600" />}
            description="View and manage all campaign enquiries"
            to="/admin/enquiries"
          />

          <CampaignCard
            title="Quotations"
            icon={<AiOutlineFileText className="h-6 w-6 text-green-600" />}
            description="Create or manage quotations for campaigns"
            to="/admin/quotation"
          />

          <CampaignCard
            title="View Quotations"
            icon={<AiOutlineEye className="h-6 w-6 text-purple-600" />}
            description="View all submitted quotations"
            to="/admin/see-quotations"
          />

          <CampaignCard
            title="Campaigns"
            icon={<AiOutlineDashboard className="h-6 w-6 text-yellow-600" />}
            description="Manage all campaigns and campaign details"
            to="/admin/campaign/create"
          />
            <CampaignCard
            title="Vendor Registration"
            icon={<AiOutlineDashboard className="h-6 w-6 text-yellow-600" />}
            description="Manage all vendor registrations"
            to="/admin/campaign/vendor"
          />
            <CampaignCard
            title="See campaigns"
            icon={<AiOutlineDashboard className="h-6 w-6 text-yellow-600" />}
            description="Manage all campaigns and campaign details"
            to="/admin/campaign/list"
          />
        </div>
      </div>
    </EmployeeLayout>
  );
};

export default CampaignDashboard;
