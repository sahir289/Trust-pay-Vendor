import { RootState } from "../../store/store";
import { Chargeback ,ChargebackState} from "./chargebackType";
export const selectChargeback = (state: RootState): ChargebackState=> state.chargeback;
export const selectChargebackById = (id: string) => (state: RootState): Chargeback | undefined =>
  state.chargeback.chargeback.find((p: { id: string; }) => p.id === id);
export const getRefreshChargeBacks = (state: RootState) => state.chargeback.refreshChargeBacks;
