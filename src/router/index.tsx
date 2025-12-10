import { useRoutes } from 'react-router-dom';
import React from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import AuthRoutes from '../components/ProtectedRoute/AuthRoutes';
import VendorBankResponseProtectedRoute from '../components/VendorBankResponseProtectedRoute';
import { Role } from '@/constants';
// import { withLazyLoading } from '@/utils/lazyStrategies';

// Normal imports instead of lazy loading
import DashboardOverview1 from '@/pages/DashboardOverview1/index';
import Users from '@/pages/Users/index';
import Clients from '@/pages/Clients';
import Roles from '@/pages/Roles/index';
import Reports from '@/pages/Reports/index';
import TransactionList from '@/pages/TransactionList/index';
import Chat from '@/pages/Chat/index';
import Login from '@/pages/Login/index';
import Register from '@/pages/Register/index';
import LandingPage from '@/pages/LandingPage/index';
import Settlement from '@/pages/Settlement/index';
import ChargeBack from '@/pages/ChargeBack/index';
import AddData from '@/pages/AddData/index';
import Designation from '@/pages/Designation/index';
import BankAccount from '@/pages/BankAccount/index';
import Unauthorized from '@/pages/Unauthorized/index';
import NotFound from '@/pages/NotFound';
import BeneficiaryAccounts from '@/pages/BeneficiaryAccounts';
import LazyLayout from '../themes';

// Commented out lazy loading approach:
// const DashboardOverview1 = withLazyLoading(() => import('@/pages/DashboardOverview1/index'), { 
//   chunkName: 'dashboard', 
//   retries: 3 
// });
// const Users = withLazyLoading(() => import('@/pages/Users/index'), { 
//   chunkName: 'users', 
//   retries: 3 
// });
// const Clients = withLazyLoading(() => import('@/pages/Clients'), { 
//   chunkName: 'clients', 
//   retries: 3 
// });
// const Roles = withLazyLoading(() => import('@/pages/Roles/index'), { 
//   chunkName: 'roles', 
//   retries: 3 
// });
// const Reports = withLazyLoading(() => import('@/pages/Reports/index'), { 
//   chunkName: 'reports', 
//   retries: 3 
// });
// const TransactionList = withLazyLoading(() => import('@/pages/TransactionList/index'), { 
//   chunkName: 'transaction-list', 
//   retries: 3 
// });
// const Chat = withLazyLoading(() => import('@/pages/Chat/index'), { 
//   chunkName: 'chat', 
//   retries: 3 
// });
// const Login = withLazyLoading(() => import('@/pages/Login/index'), { 
//   chunkName: 'auth', 
//   retries: 3 
// });
// const Register = withLazyLoading(() => import('@/pages/Register/index'), { 
//   chunkName: 'auth', 
//   retries: 3 
// });
// const LandingPage = withLazyLoading(() => import('@/pages/LandingPage/index'), { 
//   chunkName: 'landing', 
//   retries: 3 
// });
// const Settlement = withLazyLoading(() => import('@/pages/Settlement/index'), { 
//   chunkName: 'settlement', 
//   retries: 3 
// });
// const ChargeBack = withLazyLoading(() => import('@/pages/ChargeBack/index'), { 
//   chunkName: 'chargeback', 
//   retries: 3 
// });
// const AddData = withLazyLoading(() => import('@/pages/AddData/index'), { 
//   chunkName: 'add-data', 
//   retries: 3 
// });
// const Designation = withLazyLoading(() => import('@/pages/Designation/index'), { 
//   chunkName: 'admin', 
//   retries: 3 
// });
// const BankAccount = withLazyLoading(() => import('@/pages/BankAccount/index'), { 
//   chunkName: 'bank-account', 
//   retries: 3 
// });
// const Unauthorized = withLazyLoading(() => import('@/pages/Unauthorized/index'), { 
//   chunkName: 'errors', 
//   retries: 3 
// });
// const NotFound = withLazyLoading(() => import('@/pages/NotFound'), { 
//   chunkName: 'errors', 
//   retries: 3 
// });
// const BeneficiaryAccounts = withLazyLoading(() => import('@/pages/BeneficiaryAccounts'), { 
//   chunkName: 'beneficiary', 
//   retries: 3 
// });

// Wrapper for Layout with lazy loading
// const LazyLayout = withLazyLoading(() => import('../themes'), { 
//   chunkName: 'layout', 
//   retries: 3 
// });

function Router(): React.ReactElement | null {
  const routes = [
    {
      path: '/',
      element: (
        <AuthRoutes>
          <Login />
        </AuthRoutes>
      ),
    },
    {
      path: 'auth',
      element: <LazyLayout />,
      children: [
        {
          path: 'dashboard',
          element: (
            <ProtectedRoute
              allowedRoles={[
                Role.ADMIN,
                Role.TRANSACTIONS,
                Role.OPERATIONS,
                Role.MERCHANT,
                Role.SUB_MERCHANT,
                Role.MERCHANT_OPERATIONS,
                Role.VENDOR,
                Role.SUB_VENDOR,
                Role.VENDOR_ADMIN,
                Role.VENDOR_OPERATIONS,
              ]}
            />
          ),
          children: [
            {
              path: '/auth/dashboard',
              element: <DashboardOverview1 />,
            },
          ],
        },
        {
          path: 'clients',
          element: (
            <ProtectedRoute
              allowedRoles={[
                Role.ADMIN,
                Role.TRANSACTIONS,
                Role.OPERATIONS,
                Role.MERCHANT,
                Role.SUB_MERCHANT,
                Role.MERCHANT_OPERATIONS,
                Role.VENDOR,
                Role.SUB_VENDOR,
                Role.VENDOR_ADMIN,
                Role.VENDOR_OPERATIONS,
              ]}
            />
          ),
          children: [
            {
              path: '/auth/clients',
              element: <Clients />,
            },
          ],
        },
        {
          path: 'users',
          element: (
            <ProtectedRoute
              allowedRoles={[
                Role.ADMIN,
                Role.MERCHANT,
                Role.SUB_MERCHANT,
                Role.VENDOR,
                Role.SUB_VENDOR,
                Role.VENDOR_ADMIN,
              ]}
            />
          ),
          children: [
            {
              path: '/auth/users',
              element: <Users />,
            },
          ],
        },
        {
          path: 'reports',
          element: (
            <ProtectedRoute
              allowedRoles={[
                Role.ADMIN,
                Role.TRANSACTIONS,
                Role.MERCHANT,
                Role.SUB_MERCHANT,
                Role.VENDOR,
                Role.SUB_VENDOR,
                Role.VENDOR_ADMIN
              ]}
            />
          ),
          children: [
            {
              path: '/auth/reports',
              element: <Reports />,
            },
          ],
        },
        {
          path: 'transaction-list',
          element: (
            <ProtectedRoute
              allowedRoles={[
                Role.ADMIN,
                Role.TRANSACTIONS,
                Role.OPERATIONS,
                Role.MERCHANT,
                Role.SUB_MERCHANT,
                Role.MERCHANT_OPERATIONS,
                Role.VENDOR,
                Role.SUB_VENDOR,
                Role.VENDOR_ADMIN,
                Role.VENDOR_OPERATIONS,
              ]}
            />
          ),
          children: [
            {
              path: '/auth/transaction-list',
              element: <TransactionList />,
            },
          ],
        },
        {
          path: 'settlement',
          element: (
            <ProtectedRoute
              allowedRoles={[
                Role.ADMIN,
                Role.TRANSACTIONS,
                Role.MERCHANT,
                Role.SUB_MERCHANT,
                Role.MERCHANT_OPERATIONS,
                Role.VENDOR,
                Role.SUB_VENDOR,
                Role.VENDOR_ADMIN,
                Role.VENDOR_OPERATIONS,
              ]}
            />
          ),
          children: [
            {
              path: '/auth/settlement',
              element: <Settlement />,
            },
          ],
        },
        {
          path: 'beneficiaryaccounts',
          element: (
            <ProtectedRoute
              allowedRoles={[
                Role.ADMIN,
                Role.TRANSACTIONS,
                Role.MERCHANT,
                Role.SUB_MERCHANT,
                Role.MERCHANT_OPERATIONS,
                Role.VENDOR,
                Role.SUB_VENDOR,
                Role.VENDOR_ADMIN,
                Role.VENDOR_OPERATIONS,
              ]}
            />
          ),
          children: [
            {
              path: '/auth/beneficiaryaccounts',
              element: <BeneficiaryAccounts />,
            },
          ],
        },
        {
          path: 'chargeback',
          element: (
            <ProtectedRoute
              allowedRoles={[
                Role.ADMIN,
                Role.TRANSACTIONS,
                Role.MERCHANT,
                Role.SUB_MERCHANT,
                Role.VENDOR,
                Role.SUB_VENDOR,
                Role.VENDOR_ADMIN,
              ]}
            />
          ),
          children: [
            {
              path: '/auth/chargeback',
              element: <ChargeBack />,
            },
          ],
        },
        {
          path: 'add-data',
          element: (
            <ProtectedRoute
              allowedRoles={[
                Role.ADMIN,
                Role.TRANSACTIONS,
                Role.OPERATIONS,
                Role.VENDOR,
                Role.SUB_VENDOR,
                Role.VENDOR_ADMIN,
                Role.VENDOR_OPERATIONS,
              ]}
            />
          ),
          children: [
            {
              path: '/auth/add-data',
              element: (
                <VendorBankResponseProtectedRoute>
                  <AddData />
                </VendorBankResponseProtectedRoute>
              ),
            },
          ],
        },
        {
          path: 'chat',
          element: <Chat />,
        },
        {
          path: 'bankaccounts',
          element: (
            <ProtectedRoute
              allowedRoles={[
                Role.ADMIN,
                Role.TRANSACTIONS,
                Role.OPERATIONS,
                Role.VENDOR,
                Role.SUB_VENDOR,
                Role.VENDOR_ADMIN,
                Role.VENDOR_OPERATIONS,
              ]}
            />
          ),
          children: [
            {
              path: '/auth/bankaccounts',
              element: <BankAccount />,
            },
          ],
        },
        {
          path: 'designation',
          element: <ProtectedRoute allowedRoles={[Role.ADMIN]} />,
          children: [
            {
              path: '',
              element: <Designation />,
            },
          ],
        },
        {
          path: 'roles',
          element: <ProtectedRoute allowedRoles={[Role.ADMIN]} />,
          children: [
            {
              path: '',
              element: <Roles />,
            },
          ],
        },
      ],
    },
    {
      path: '/landing-page',
      element: <LandingPage />,
    },
    {
      path: '/register',
      element: <Register />,
    },
    {
      path: '/unauthorized',
      element: <Unauthorized />,
    },
    {
      path: '/*',
      element: <NotFound />,
    },
  ];

  return useRoutes(routes);
}

export default Router;