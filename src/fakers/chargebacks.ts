import _ from "lodash";

export interface ChargeBack {
  name: string;
  photo: string;
  sno: number;
  code: string;
  merchant_order_id: string;
  amount: string;
  referance_date: string;
  createdAt: string;
  actions: string;
}

const imageAssets = import.meta.glob<{
  default: string;
}>("/src/assets/images/users/*.{jpg,jpeg,png,svg}", { eager: true });

const fakersChargeBacks = {
    fakeChargeBacks(): Array<ChargeBack> {
    const chargebacks: Array<ChargeBack> = [
      {
        name: "Tom Hanks",
        photo: imageAssets["/src/assets/images/users/user1-50x50.jpg"]?.default || "",
        code: "tom",
        sno: 1,
        merchant_order_id: "1d54f8a4-7040-4e65-9254-ef55aa72efdc",
        amount: "₹0",
        referance_date: "28/01/2025 at 05:01:23 PM",
        createdAt: "28/01/2025 at 05:01:23 PM",
        actions: "",
      },
      {
        name: "Meryl Streep",
        photo: imageAssets["/src/assets/images/users/user2-50x50.jpg"]?.default || "",
        code: "tom",
        sno: 2,
        merchant_order_id: "1d54f8a4-7040-4e65-9254-ef55aa72efdc",
        amount: "₹0",
        referance_date: "28/01/2025 at 05:01:23 PM",
        createdAt: "28/01/2025 at 05:01:23 PM",
        actions: "",
      },
      {
        name: "Leonardo DiCaprio",
        photo: imageAssets["/src/assets/images/users/user3-50x50.jpg"]?.default || "",
        code: "tom",
        sno: 3,
        merchant_order_id: "1d54f8a4-7040-4e65-9254-ef55aa72efdc",
        amount: "₹0",
        referance_date: "28/01/2025 at 05:01:23 PM",
        createdAt: "28/01/2025 at 05:01:23 PM",
        actions: "",
      },
      {
        name: "Angelina Jolie",
        photo: imageAssets["/src/assets/images/users/user4-50x50.jpg"]?.default || "",
        code: "tom",
        sno: 4,
        merchant_order_id: "1d54f8a4-7040-4e65-9254-ef55aa72efdc",
        amount: "₹0",
        referance_date: "28/01/2025 at 05:01:23 PM",
        createdAt: "28/01/2025 at 05:01:23 PM",
        actions: "",
      },
      {
        name: "Brad Pitt",
        photo: imageAssets["/src/assets/images/users/user5-50x50.jpg"]?.default || "",
        code: "tom",
        sno: 5,
        merchant_order_id: "1d54f8a4-7040-4e65-9254-ef55aa72efdc",
        amount: "₹0",
        referance_date: "28/01/2025 at 05:01:23 PM",
        createdAt: "28/01/2025 at 05:01:23 PM",
        actions: "",
      },
      {
        name: "Jennifer Lawrence",
        photo: imageAssets["/src/assets/images/users/user6-50x50.jpg"]?.default || "",
        code: "tom",
        sno: 6,
        merchant_order_id: "1d54f8a4-7040-4e65-9254-ef55aa72efdc",
        amount: "₹0",
        referance_date: "28/01/2025 at 05:01:23 PM",
        createdAt: "28/01/2025 at 05:01:23 PM",
        actions: "",
      },
      {
        name: "Johnny Depp",
        photo: imageAssets["/src/assets/images/users/user7-50x50.jpg"]?.default || "",
        code: "tom",
        sno: 7,
        merchant_order_id: "1d54f8a4-7040-4e65-9254-ef55aa72efdc",
        amount: "₹0",
        referance_date: "28/01/2025 at 05:01:23 PM",
        createdAt: "28/01/2025 at 05:01:23 PM",
        actions: "",
      },
      {
        name: "Cate Blanchett",
        photo: imageAssets["/src/assets/images/users/user8-50x50.jpg"]?.default || "",
        code: "tom",
        sno: 8,
        merchant_order_id: "1d54f8a4-7040-4e65-9254-ef55aa72efdc",
        amount: "₹0",
        referance_date: "28/01/2025 at 05:01:23 PM",
        createdAt: "28/01/2025 at 05:01:23 PM",
        actions: "",
      },
      {
        name: "Denzel Washington",
        photo: imageAssets["/src/assets/images/users/user9-50x50.jpg"]?.default || "",
        code: "tom",
        sno: 9,
        merchant_order_id: "1d54f8a4-7040-4e65-9254-ef55aa72efdc",
        amount: "₹0",
        referance_date: "28/01/2025 at 05:01:23 PM",
        createdAt: "28/01/2025 at 05:01:23 PM",
        actions: "",
      },
      {
        name: "Julia Roberts",
        photo: imageAssets["/src/assets/images/users/user10-50x50.jpg"]?.default || "",
        code: "tom",
        sno: 10,
        merchant_order_id: "1d54f8a4-7040-4e65-9254-ef55aa72efdc",
        amount: "₹0",
        referance_date: "28/01/2025 at 05:01:23 PM",
        createdAt: "28/01/2025 at 05:01:23 PM",
        actions: "",
      },
    ];

    return _.shuffle(chargebacks);
  },
};

export default fakersChargeBacks;
