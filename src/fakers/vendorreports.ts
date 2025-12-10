import _ from "lodash";

export interface vendorAccount {
  sno: number;
  code: string;
  vendor_commission: number;
  created_date: string;
  created_by: string;
  status: string;
  action: string;
  confirmed: boolean;
  amount: number;
  merchant_order_id: string;
  merchant_code: string;
  photo: string;
  name: string;
  user_submitted_utr: string;
  utr: string;
  position?: string;
  method: string;
  id: string;
  updated_at: string;
}

const fakeVendorAccount = {
  fakeVendorReport(): Array<vendorAccount> {
    const vendorAccounts: vendorAccount[] = [
      {
        sno: 1,
        code: "VND001",
        vendor_commission: 500,
        created_date: "28/01/2025",
        created_by: "Admin",
        status: "Active",
        action: "Approved",
        confirmed: true,
        amount: 50000,
        merchant_order_id: "ORD12345",
        merchant_code: "MRC001",
        photo: "https://example.com/photo1.jpg",
        name: "Vendor One",
        user_submitted_utr: "UTR001",
        utr: "UTR001",
        method: "Bank Transfer",
        id: "ID001",
        updated_at: "28/01/2025",
      },
      {
        sno: 2,
        code: "VND002",
        vendor_commission: 750,
        created_date: "28/01/2025",
        created_by: "Admin",
        status: "Pending",
        action: "Review",
        confirmed: false,
        amount: 75000,
        merchant_order_id: "ORD12346",
        merchant_code: "MRC002",
        photo: "https://example.com/photo2.jpg",
        name: "Vendor Two",
        user_submitted_utr: "UTR002",
        utr: "UTR002",
        method: "UPI",
        id: "ID002",
        updated_at: "28/01/2025",
      },
      {
        sno: 3,
        code: "VND003",
        vendor_commission: 300,
        created_date: "28/01/2025",
        created_by: "Admin",
        status: "Inactive",
        action: "Rejected",
        confirmed: false,
        amount: 30000,
        merchant_order_id: "ORD12347",
        merchant_code: "MRC003",
        photo: "https://example.com/photo3.jpg",
        name: "Vendor Three",
        user_submitted_utr: "UTR003",
        utr: "UTR003",
        method: "NEFT",
        id: "ID003",
        updated_at: "28/01/2025",
      },
    ];

    return _.shuffle(vendorAccounts); // Randomize the order of vendor accounts
  },
};

export default fakeVendorAccount;
