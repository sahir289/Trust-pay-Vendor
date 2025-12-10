
import _ from "lodash";
export interface reportAccount {
    date: string;
    vendorCode: string;
    payInCount: number;
    payInAmount: number;
    payInCommission: number;
    payOutCount: number;
    payOutAmount: number;
    payOutCommission: number;
    reversedPayOut: number;
    reversedPayOutAmount: number;
    reversedPayOutCommission: number;
    settlementCount: number;
    settlementAmount: number;
    lienAmount: number;
    lienCount: number;
    currentBalance: number;
    netBalance: number;
}

const fakeReportAccount = {
    fakeAccountReport(): Array<reportAccount> {
        const vendoraccount: reportAccount[] = [
            {
                date: "28/01/2025",
                vendorCode: "VND001",
                payInCount: 15,
                payInAmount: 50000,
                payInCommission: 500,
                payOutCount: 10,
                payOutAmount: 40000,
                payOutCommission: 400,
                reversedPayOut: 2,
                reversedPayOutAmount: 5000,
                reversedPayOutCommission: 50,
                settlementCount: 8,
                settlementAmount: 35000,
                lienAmount: 788,
                lienCount: 900,
                currentBalance: 15000,
                netBalance: 20000,
            },
            {
                date: "28/01/2025",
                vendorCode: "VND002",
                payInCount: 20,
                payInAmount: 75000,
                payInCommission: 750,
                payOutCount: 15,
                payOutAmount: 60000,
                payOutCommission: 600,
                reversedPayOut: 3,
                reversedPayOutAmount: 7000,
                reversedPayOutCommission: 70,
                settlementCount: 12,
                settlementAmount: 50000,
                lienAmount: 788,
                lienCount: 900,
                currentBalance: 25000,
                netBalance: 30000,
            },
            {
                date: "28/01/2025",
                vendorCode: "VND003",
                payInCount: 10,
                payInAmount: 30000,
                payInCommission: 300,
                payOutCount: 8,
                payOutAmount: 25000,
                payOutCommission: 250,
                reversedPayOut: 1,
                reversedPayOutAmount: 2000,
                reversedPayOutCommission: 20,
                settlementCount: 6,
                settlementAmount: 20000,
                lienAmount: 788,
                lienCount: 900,
                currentBalance: 10000,
                netBalance: 12000,
            },
        ];

        return _.shuffle(vendoraccount); // Randomize the order of payouts
    },
};

export default fakeReportAccount;
