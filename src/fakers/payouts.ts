import _ from "lodash";

export interface PayOuts {
  id: string;
  sno: number;
  merchant_order_id: string;
  merchant_code: string;
  bankDetails: string;
  amount: string;
  status: string;
  utr: string;
  name: string;
  photo: string;
  method: string;
  vendor: string;
  fromBank: string;
  payoutUuid: string;
  updated_at: string;
  action: "";
}

const imageAssets = import.meta.glob<{
  default: string;
}>("/src/assets/images/users/*.{jpg,jpeg,png,svg}", { eager: true });

const fakersPayOuts = {
  fakePayOuts(): Array<PayOuts> {
    const payouts: PayOuts[] = [
      {
        id: "1d54f8a4-7040-4e65-9254-ef55aa72efdc",
        sno: 1,
        merchant_order_id: "MO123456",
        merchant_code: "Tom",
        bankDetails: "HDFC Bank - 1234567890",
        amount: "₹5,000",
        status: "Success",
        utr: "UTR121212121212",
        name: "Tom Hanks",
        photo: imageAssets["/src/assets/images/users/user1-50x50.jpg"]?.default || "/src/assets/images/default-user.jpg",
        method: "Bank Transfer",
        vendor: "Razorpay",
        fromBank: "ICICI Bank",
        payoutUuid: "PUUID123456",
        updated_at: "28/01/2025 at 05:01:23 PM",
        action: "",
      },
      {
        id: "2a34b5c6-1234-4bcd-9876-abcdef123456",
        sno: 2,
        merchant_order_id: "MO987654",
        merchant_code: "Tom",
        bankDetails: "SBI - 9876543210",
        amount: "₹10,000",
        status: "Initiated",
        utr: "UTR987654321012",
        name: "Meryl Streep",
        photo: imageAssets["/src/assets/images/users/user1-50x50.jpg"]?.default || "/src/assets/images/default-user.jpg",
        method: "Cash",
        vendor: "PayU",
        fromBank: "HDFC Bank",
        payoutUuid: "PUUID987654",
        updated_at: "28/01/2025 at 06:15:00 PM",
        action: "",
      },
      {
        id: "3f45g6h7-5678-4efg-5432-bca987654321",
        sno: 3,
        merchant_order_id: "MO654321",
        merchant_code: "Tom",
        bankDetails: "Axis Bank - 1122334455",
        amount: "₹3,500",
        status: "Rejected",
        utr: "UTR543212345678",
        name: "Leonardo DiCaprio",
        photo: imageAssets["/src/assets/images/users/user3-50x50.jpg"]?.default || "/src/assets/images/default-user.jpg",
        method: "AED",
        vendor: "Paytm",
        fromBank: "Kotak Bank",
        payoutUuid: "PUUID654321",
        updated_at: "28/01/2025 at 07:20:45 PM",
        action: "",
      },
    ];

    return _.shuffle(payouts); // Randomize the order of payouts
  },
};

export default fakersPayOuts;
