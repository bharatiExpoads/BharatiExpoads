import React from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineFileText, AiOutlineTransaction, AiOutlineBank, AiOutlineCreditCard, AiOutlineSwap } from 'react-icons/ai';
import Layout from '../components/Layout';

const VoucherCard = ({ title, icon, description, to }) => (
  <Link
    to={to}
    className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-green-100 rounded-full">
        {icon}
      </div>
    </div>
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    <p className="mt-2 text-sm text-gray-600">{description}</p>
  </Link>
);

const VouchersDashboard = () => {
  return (
    <Layout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <AiOutlineFileText className="mr-2" /> Voucher Management
          </h1>
          <p className="text-gray-600">Manage all types of vouchers from one place</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

          <VoucherCard
            title="Payment Voucher"
            icon={<AiOutlineTransaction className="h-6 w-6 text-green-600" />}
            description="Record payments made to parties"
            to="/vouchers/payment"
          />

          <VoucherCard
            title="Receipt Voucher"
            icon={<AiOutlineBank className="h-6 w-6 text-blue-600" />}
            description="Log received payments"
            to="/vouchers/receipt"
          />

          <VoucherCard
            title="Journal Voucher"
            icon={<AiOutlineFileText className="h-6 w-6 text-indigo-600" />}
            description="Manage journal entries"
            to="/vouchers/journal"
          />

          <VoucherCard
            title="Contra Voucher"
            icon={<AiOutlineSwap className="h-6 w-6 text-purple-600" />}
            description="Handle cash and bank transfers"
            to="/vouchers/contra"
          />

          <VoucherCard
            title="Debit Note"
            icon={<AiOutlineCreditCard className="h-6 w-6 text-red-600" />}
            description="Record debit notes issued"
            to="/vouchers/debit-note"
          />

          <VoucherCard
            title="Credit Note"
            icon={<AiOutlineCreditCard className="h-6 w-6 text-yellow-600" />}
            description="Record credit notes received"
            to="/vouchers/credit-note"
          />

        </div>
      </div>
    </Layout>
  );
};

export default VouchersDashboard;
