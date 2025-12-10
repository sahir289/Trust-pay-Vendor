import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../slices/auth/authSlice";
import userReducer from "../slices/user/userSlice";
import themeReducer from "../slices/theme/themeSlice";
import payInReducer from "../slices/payin/payinSlice";
import payOutReducer from "../slices/payout/payoutSlice";
import settlementReducer from "../slices/settlement/settlementSlice";
import calculationsReducer from "../slices/calculations/calculationsSlice";
import dataEntriesReducer from "../slices/dataEntries/dataEntrySlice";
import roleReducer from "../slices/roles/roleSlice";
import designationReducer from '../slices/designations/designationSlice';
import paramsReducer from "../slices/common/params/paramsSlice";
import tabReducer from "../slices/common/tabs/tabSlice";
import buttonTabReducer from "../slices/common/tabs/tabSlice"
import darkModeReducer from "../slices/common/darkMode/darkModeSlice";
import colorSchemeReducer from "../slices/common/colorScheme/colorSchemeSlice";
import sideMenuReducer from "../slices/common/sideMenu/sideMenuSlice";
import compactMenuReducer from "../slices/common/compactMenu/compactMenuSlice";
import pageLoaderReducer from "../slices/common/pageLoader/pageLoaderSlice";
import merchantReducer from "../slices/merchants/merchantSlice"
import reportReducer from "../slices/reports/reportSlice";
import vendorReducer from "../slices/vendor/vendorSlice"
import bankDetailsReducer from '../slices/bankDetails/bankDetailsSlice';
import beneficiaryAccount from '../slices/beneficiaryAccounts/beneficiaryAccountsSlice';
import chargebackReducer from "../slices/chargebacks/chargebackSlice";
import countReducer from "../slices/common/apis/commonSlice"
import notificationReducer from "../slices/notification/notificationSlice"
import allNotificationReducer from "../slices/AllNoti/allNotifications";
//This file configures the Redux store.

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  report : reportReducer,
  vendors : vendorReducer ,
  payin: payInReducer,
  payout: payOutReducer,
  settlement: settlementReducer,
  calculations: calculationsReducer,
  dataEntries: dataEntriesReducer,
  role: roleReducer,
  designation: designationReducer,
  params: paramsReducer,
  tab: tabReducer,
  buttonTab: buttonTabReducer,
  chargeback : chargebackReducer,
  theme: themeReducer,
  merchants: merchantReducer,
  bankDetails: bankDetailsReducer,
  beneficiaryAccount: beneficiaryAccount,
  darkMode: darkModeReducer,
  colorScheme: colorSchemeReducer,
  sideMenu: sideMenuReducer,
  compactMenu: compactMenuReducer,
  pageLoader: pageLoaderReducer,
  count: countReducer,
  notification: notificationReducer,
  allNotification: allNotificationReducer, 
});

export default rootReducer;
