import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { icons } from "@/components/Base/Lucide";
import { Role } from "@/constants";
import { resetTabs } from "../tabs/tabSlice";

export interface Menu {
  icon: keyof typeof icons;
  title: string;
  badge?: number;
  pathname?: string;
  subMenu?: Menu[];
  ignore?: boolean;
}

export interface SideMenuState {
  menu: Array<Menu | string>;
  activeMenu: string | null;
}

const getUserRoleFromStorage = (): keyof typeof Role | undefined => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    return userData?.designation;
};

const generateMenuForRole = (role?: keyof typeof Role): Array<Menu | string> => {
  const baseMenu = [
    "DASHBOARDS",
    {
      icon: "LayoutDashboard" as keyof typeof icons,
      pathname: "/auth/dashboard",
      title: "Dashboard",
    },
    "TRANSACTIONS",
    {
      icon: "ArrowRightLeft" as keyof typeof icons,
      pathname: "/auth/transaction-list",
      title: "Transactions",
    }
  ];

  const settlements_chargebacks = [
    "SETTLEMENTS & CHARGEBACKS",
    {
      icon: "NotebookText" as keyof typeof icons,
      pathname: "/auth/settlement",
      title: "Settlements",
    },
    {
      icon: "Landmark" as keyof typeof icons,
      pathname: "/auth/beneficiaryaccounts",
      title: "BeneficiaryAccounts",
    },
    {
      icon: "ArrowLeftCircle" as keyof typeof icons,
      pathname: "/auth/chargeback",
      title: "ChargeBacks",
    }
  ];


  // const settlements_transactions = [
  //   "SETTLEMENTS",
  //   {
  //     icon: "NotebookText" as keyof typeof icons,
  //     pathname: "/auth/settlement",
  //     title: "Settlements",
  //   },]
//show vendor settlement in vendor operations
  const settlements_vendor_operations = [
    "SETTLEMENTS",
    {
      icon: "NotebookText" as keyof typeof icons,
      pathname: "/auth/settlement",
      title: "Settlements",
    },
    {
      icon: "Landmark" as keyof typeof icons,
      pathname: "/auth/beneficiaryaccounts",
      title: "BeneficiaryAccounts",
    },
  ]

  const adminItems = [
    "DATA ENTRIES",
    {
      icon: "FileText" as keyof typeof icons,
      pathname: "/auth/add-data",
      title: "Data Entries",
    },
    "BANK DETAILS",
    {
      icon: "Landmark" as keyof typeof icons,
      pathname: "/auth/bankaccounts",
      title: "Bank Details",
    }
  ];

  // const vendorItems = [
  //   "BANK DETAILS",
  //   {
  //     icon: "Landmark" as keyof typeof icons,
  //     pathname: "/auth/bankaccounts",
  //     title: "Bank Details",
  //   }
  // ];

  // const bankItems = [
  //   "BANK DETAILS",
  //   {
  //     icon: "Landmark" as keyof typeof icons,
  //     pathname: "/auth/bankaccounts",
  //     title: "Bank Details",
  //   }
  // ];
  const userItems = [
    "USERS",
    {
      icon: "Users" as keyof typeof icons,
      pathname: "/auth/users",
      title: "Users",
    }
  ];

  const reports = [
    "REPORTS",
    {
      icon: "SquareUser" as keyof typeof icons,
      pathname: "/auth/reports",
      title: "Reports",
    },
  ];

  const commonItems = [
    "CLIENTS",
    {
      icon: "CreditCard" as keyof typeof icons,
      pathname: "/auth/clients",
      title: "Clients",
    },
  ];

  switch (role) {
    case Role.ADMIN:
      return [...baseMenu, ...settlements_chargebacks, ...adminItems, ...userItems, ...commonItems, ...reports];
    case Role.TRANSACTIONS:
      return [...baseMenu, ...settlements_chargebacks, ...adminItems, ...commonItems, ...reports];
    case Role.OPERATIONS:
      return [...baseMenu, ...adminItems];
    case Role.VENDOR:
      return [...baseMenu, ...settlements_chargebacks, ...adminItems, ...userItems, ...commonItems, ...reports];
    case Role.SUB_VENDOR:
      return [...baseMenu, ...settlements_chargebacks, ...adminItems, ...userItems, ...commonItems, ...reports];
    case Role.VENDOR_ADMIN:
      return [...baseMenu, ...settlements_chargebacks, ...adminItems, ...userItems, ...commonItems, ...reports];
    case Role.MERCHANT:
      return [...baseMenu, ...settlements_chargebacks, ...userItems, ...commonItems, ...reports];
    case Role.SUB_MERCHANT:
      return [...baseMenu, ...userItems, ...commonItems, ...reports];
    case Role.MERCHANT_OPERATIONS:
      return [...baseMenu];
    case Role.VENDOR_OPERATIONS:
      return [...baseMenu, ...settlements_vendor_operations, ...adminItems];
    default:
      return baseMenu;
  }
};

const initialState: SideMenuState = {
  menu: generateMenuForRole(getUserRoleFromStorage()),
  activeMenu: null,
};

export const setActiveMenuWithReset = createAsyncThunk(
  "sideMenu/setActiveMenuWithReset",
  async (pathname: string, { dispatch }) => {
    dispatch(resetTabs());
    return pathname;
  }
);

export const sideMenuSlice = createSlice({
  name: "sideMenu",
  initialState,
  reducers: {
    updateMenu: (state, action: PayloadAction<keyof typeof Role>) => {
      state.menu = generateMenuForRole(action.payload);
    },
    initializeMenu: (state) => {
      const role = getUserRoleFromStorage();
      if (role) {
        state.menu = generateMenuForRole(role);
      }
    },
    setActiveMenu: (state, action: PayloadAction<string>) => {
      state.activeMenu = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(setActiveMenuWithReset.fulfilled, (state, action) => {
      state.activeMenu = action.payload;
    });
  },
});

export const { updateMenu, initializeMenu, setActiveMenu } = sideMenuSlice.actions;
export default sideMenuSlice.reducer;