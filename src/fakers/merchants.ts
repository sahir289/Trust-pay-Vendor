export interface subMerchant {
  name: string;
  code: string;
  site: string;
  apikey: string;
  public_api_key: string;
  balance: number;
  payin_range: string;
  payin_commission: string;
  payout_range: string;
  payout_commission: string;
  test_mode: boolean;
  allow_intent: boolean;
  created_at: string;
  actions: string;
}
export interface Merchant {
  name: string;
  code: string;
  site: string;
  apikey: string;
  public_api_key: string;
  balance: number;
  payin_range: string;
  payin_commission: string;
  payout_range: string;
  payout_commission: string;
  test_mode: boolean;
  allow_intent: boolean;
  created_at: string;
  actions: string;
  submerchant: subMerchant[];
}


const fakersMerchant = {
  fakeMerchants(): Array<Merchant> {
    const merchants: Array<Merchant> = [
      {
        name: "Noah Centineo",
        code: "tom",
        site: "https://NoahCentineo@gmail.com",
        apikey: "1d54f8a4-7040-4e65-9254-ef55aa72efdc",
        public_api_key: "1d54f8a4-7040-4e65-9254-ef55aa72efdc",
        balance: 0,
        payin_range: "₹1 - ₹10",
        payin_commission: "5%",
        payout_range: "₹1 - ₹10",
        payout_commission: "5%",
        test_mode: false,
        allow_intent: false,
        created_at: "28/01/2025 at 05:01:23 PM",
        actions: "",
        submerchant: [
          {
            name: "Noah Centineo",
            code: "tom",
            site: "https://heav@gmail.com",
            apikey: "1d54f8a4-7040-4e65-9254-ef55aa72efdc",
            public_api_key: "1d54f8a4-7040-4e65-9254-ef55aa72efdc",
            balance: 0,
            payin_range: "$1 - $10",
            payin_commission: "$1 - $10",
            payout_range: "$1 - $10",
            payout_commission: "$1 - $10",
            test_mode: false,
            allow_intent: false,
            created_at: "28/01/2025 at 05:01:23 PM",
            actions: "",
          },
          {
            name: "Noah Centineo",
            code: "tom",
            site: "https://heav@gmail.com",
            apikey: "1d54f8a4-7040-4e65-9254-ef55aa72efdc",
            public_api_key: "1d54f8a4-7040-4e65-9254-ef55aa72efdc",
            balance: 0,
            payin_range: "$1 - $10",
            payin_commission: "$1 - $10",
            payout_range: "$1 - $10",
            payout_commission: "$1 - $10",
            test_mode: false,
            allow_intent: false,
            created_at: "28/01/2025 at 05:01:23 PM",
            actions: "",
          }

        ]
      },
      {
        name: "Meryl Streep",
        code: "tom",
        site: "https://heav@gmail.com",
        apikey: "1d54f8a4-7040-4e65-9254-ef55aa72efdc",
        public_api_key: "1d54f8a4-7040-4e65-9254-ef55aa72efdc",
        balance: 0,
        payin_range: "₹1 - ₹10",
        payin_commission: "5%",
        payout_range: "₹1 - ₹10",
        payout_commission: "5%",
        test_mode: false,
        allow_intent: false,
        created_at: "28/01/2025 at 05:01:23 PM",
        actions: "",
        submerchant: []
      },
      {
        name: "Leonardo DiCaprio",
        code: "tom",
        site: "https://heav@gmail.com",
        apikey: "1d54f8a4-7040-4e65-9254-ef55aa72efdc",
        public_api_key: "1d54f8a4-7040-4e65-9254-ef55aa72efdc",
        balance: 0,
        payin_range: "₹1 - ₹10",
        payin_commission: "5%",
        payout_range: "₹1 - ₹10",
        payout_commission: "5%",
        test_mode: false,
        allow_intent: false,
        created_at: "28/01/2025 at 05:01:23 PM",
        actions: "",
        submerchant: []
      },
      {
        name: "Angelina Jolie",
        code: "tom",
        site: "https://heav@gmail.com",
        apikey: "1d54f8a4-7040-4e65-9254-ef55aa72efdc",
        public_api_key: "1d54f8a4-7040-4e65-9254-ef55aa72efdc",
        balance: 0,
        payin_range: "₹1 - ₹10",
        payin_commission: "5%",
        payout_range: "₹1 - ₹10",
        payout_commission: "5%",
        test_mode: false,
        allow_intent: false,
        created_at: "28/01/2025 at 05:01:23 PM",
        actions: "",
        submerchant: []
      },
      {
        name: "Brad Pitt",
        code: "tom",
        site: "https://heav@gmail.com",
        apikey: "1d54f8a4-7040-4e65-9254-ef55aa72efdc",
        public_api_key: "1d54f8a4-7040-4e65-9254-ef55aa72efdc",
        balance: 0,
        payin_range: "₹1 - ₹10",
        payin_commission: "5%",
        payout_range: "₹1 - ₹10",
        payout_commission: "5%",
        test_mode: false,
        allow_intent: false,
        created_at: "28/01/2025 at 05:01:23 PM",
        actions: "",
        submerchant: []
      },
      {
        name: "Jennifer Lawrence",
        code: "tom",
        site: "https://heav@gmail.com",
        apikey: "1d54f8a4-7040-4e65-9254-ef55aa72efdc",
        public_api_key: "1d54f8a4-7040-4e65-9254-ef55aa72efdc",
        balance: 0,
        payin_range: "₹1 - ₹10",
        payin_commission: "5%",
        payout_range: "₹1 - ₹10",
        payout_commission: "5%",
        test_mode: false,
        allow_intent: false,
        created_at: "28/01/2025 at 05:01:23 PM",
        actions: "",
        submerchant: []
      },
      {
        name: "Johnny Depp",
        code: "tom",
        site: "https://heav@gmail.com",
        apikey: "1d54f8a4-7040-4e65-9254-ef55aa72efdc",
        public_api_key: "1d54f8a4-7040-4e65-9254-ef55aa72efdc",
        balance: 0,
        payin_range: "₹1 - ₹10",
        payin_commission: "5%",
        payout_range: "₹1 - ₹10",
        payout_commission: "5%",
        test_mode: false,
        allow_intent: false,
        created_at: "28/01/2025 at 05:01:23 PM",
        actions: "",
        submerchant: []
      },
      {
        name: "Cate Blanchett",
        code: "tom",
        site: "https://heav@gmail.com",
        apikey: "1d54f8a4-7040-4e65-9254-ef55aa72efdc",
        public_api_key: "1d54f8a4-7040-4e65-9254-ef55aa72efdc",
        balance: 0,
        payin_range: "₹1 - ₹10",
        payin_commission: "5%",
        payout_range: "₹1 - ₹10",
        payout_commission: "5%",
        test_mode: false,
        allow_intent: false,
        created_at: "28/01/2025 at 05:01:23 PM",
        actions: "",
        submerchant: []
      },
      {
        name: "Denzel Washington",
        code: "tom",
        site: "https://heav@gmail.com",
        apikey: "1d54f8a4-7040-4e65-9254-ef55aa72efdc",
        public_api_key: "1d54f8a4-7040-4e65-9254-ef55aa72efdc",
        balance: 0,
        payin_range: "₹1 - ₹10",
        payin_commission: "5%",
        payout_range: "₹1 - ₹10",
        payout_commission: "5%",
        test_mode: false,
        allow_intent: false,
        created_at: "28/01/2025 at 05:01:23 PM",
        actions: "",
        submerchant: []
      },
      {
        name: "Julia Roberts",
        code: "tom",
        site: "https://heav@gmail.com",
        apikey: "1d54f8a4-7040-4e65-9254-ef55aa72efdc",
        public_api_key: "1d54f8a4-7040-4e65-9254-ef55aa72efdc",
        balance: 0,
        payin_range: "₹1 - ₹10",
        payin_commission: "5%",
        payout_range: "₹1 - ₹10",
        payout_commission: "5%",
        test_mode: false,
        allow_intent: false,
        created_at: "28/01/2025 at 05:01:23 PM",
        actions: "",
        submerchant: []
      },
    ];

    return (merchants);
  },
};

export default fakersMerchant;
