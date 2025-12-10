/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import * as yup from 'yup';
import React from 'react';
import { debouncedValidateIfscCode } from '@/utils/ifscValidation';
// let role: string | undefined;
// const data = localStorage.getItem('userData');
// if (data) {
//   const parsedData = JSON.parse(data);
//   role = parsedData.role as string;
// }
export const Role = {
  ADMIN: 'ADMIN',
  TRANSACTIONS: 'TRANSACTIONS',
  OPERATIONS: 'OPERATIONS',
  MERCHANT_ADMIN: 'MERCHANT_ADMIN',
  MERCHANT: 'MERCHANT',
  SUB_MERCHANT: 'SUB_MERCHANT',
  MERCHANT_OPERATIONS: 'MERCHANT_OPERATIONS',
  VENDOR: 'VENDOR',
  SUB_VENDOR: 'SUB_VENDOR',
  VENDOR_ADMIN: 'VENDOR_ADMIN',
  VENDOR_OPERATIONS: 'VENDOR_OPERATIONS',
  SUPER_ADMIN: 'SUPER_ADMIN',
};

export const ChangePasswordFormFields = {
  Change_Password: [
    {
      name: 'password',
      label: 'Current Password',
      type: 'password',
      placeholder: 'Enter current password',
      width: '12',
      validation: yup.string().required('Current password is required'),
    },
    {
      name: 'newPassword',
      label: 'New Password',
      type: 'password',
      placeholder: 'Enter new password',
      width: '12',
      validation: yup
        .string()
        .required('New password is required')
        .min(8, 'Password must be at least 8 characters')
        .notOneOf(
          [yup.ref('password')],
          'New password cannot be same as current password',
        ),
      // .matches(
      //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      //   'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      // ),
    },
    {
      name: 'confirmPassword',
      label: 'Confirm New Password',
      type: 'password',
      placeholder: 'Confirm new password',
      width: '12',
      validation: yup
        .string()
        .required('Confirm password is required')
        .oneOf([yup.ref('newPassword')], 'Passwords must match'),
    },
  ],
};

export const Status = {
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
  PENDING: 'PENDING',
  DUPLICATE: 'DUPLICATE',
  DISPUTE: 'DISPUTE',
  BANK_MISMATCH: 'BANK_MISMATCH',
  IMAGE_PENDING: 'IMG_PENDING',
  ASSIGNED: 'ASSIGNED',
  INITIATED: 'INITIATED',
  DROPPED: 'DROPPED',
  FAILED: 'FAILED',
  REJECTED: 'REJECTED',
  REVERSED: 'REVERSED',
  APPROVED: 'APPROVED',
  BOT_SUCCESS: '/success',
  WARN: 'WARN',
};

export const PayInStatusOptions = [
  { label: 'Initiated', value: Status.INITIATED },
  { label: 'Assigned', value: Status.ASSIGNED },
  { label: 'Pending', value: Status.PENDING },
  { label: 'Image Pending', value: Status.IMAGE_PENDING },
  { label: 'Duplicate', value: Status.DUPLICATE },
  { label: 'Dispute', value: Status.DISPUTE },
  { label: 'Bank Mismatch', value: Status.BANK_MISMATCH },
  { label: 'Success', value: Status.SUCCESS },
  { label: 'Dropped', value: Status.DROPPED },
  { label: 'Failed', value: Status.FAILED },
];

export const PayOutStatusOptions = [
  { label: 'Initiated', value: Status.INITIATED },
  { label: 'Approved', value: Status.APPROVED },
  { label: 'Rejected', value: Status.REJECTED },
  { label: 'Reversed', value: Status.REVERSED },
  { label: 'Pending', value: Status.PENDING },
];

export const SettlementStatusOptions = [
  { label: 'Initiated', value: Status.INITIATED },
  { label: 'Success', value: Status.SUCCESS },
  { label: 'Rejected', value: Status.REJECTED },
  { label: 'Reversed', value: Status.REVERSED },
];

export const DataEntryOptions = [
  { label: 'Used', value: 'true' },
  { label: 'Unused', value: 'false' },
];

export const Columns = {
  PAYIN: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    {
      label: 'Merchant',
      key: 'merchant_details',
      type: 'object',
      objectKey: 'merchant_code' as const,
    },
    {
      label: 'Merchant Order Id',
      key: 'merchant_order_id',
      copy: true,
      type: 'text',
    },
    { label: 'User ID', key: 'user', copy: true, type: 'text' as const },
    {
      label: 'Status',
      key: 'status',
      type: 'status' as const,
    },
    {
      label: 'Requested Amount',
      key: 'amount',
      copy: true,
      type: 'amount' as const,
    },
    {
      label: 'Received Amount',
      key: 'bank_res_details',
      copy: true,
      type: 'object',
      objectKey: 'amount' as const,
      format: 'amount',
    },
    // { label: 'Vendor', key: 'vendor_code', type: 'text' as const },
    {
      label: 'User Submitted UTR',
      key: 'user_submitted_utr',
      copy: true,
      type: 'text' as const,
    },
    {
      label: 'Bank UTR',
      key: 'bank_res_details',
      copy: true,
      type: 'object',
      objectKey: 'utr' as const,
    },
    { label: 'Bank Name', copy: true, key: 'nick_name', type: 'text' as const },
    { label: 'Vendor', key: 'vendor_code', type: 'text' as const },
    { label: 'Image', key: 'user_submitted_image', type: 'image' as const },
    {
      label: 'Updated At',
      key: 'updated_at',
      copy: true,
      type: 'date' as const,
    },
    { label: 'Actions', key: 'actions', type: 'actions' as const },
  ],
  PAYIN_MERCHANT: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    {
      label: 'Merchant',
      key: 'merchant_details',
      type: 'object',
      objectKey: 'merchant_code' as const,
    },
    {
      label: 'Merchant Order ID',
      copy: true,
      key: 'merchant_order_id',
      type: 'text' as const,
    },
    //columns rearranged as required
    {
      label: 'Status',
      key: 'status',
      type: 'status' as const,
    },
    {
      label: 'User ID',
      copy: true,
      key: 'user',
      type: 'text' as const,
    },
    {
      label: 'Requested Amount',
      key: 'amount',
      copy: true,
      type: 'amount' as const,
    },
    {
      label: 'Received Amount',
      key: 'bank_res_details',
      copy: true,
      type: 'object',
      objectKey: 'amount' as const,
      format: 'amount',
    },
    {
      label: 'User Submitted UTR',
      key: 'user_submitted_utr',
      copy: true,
      type: 'text' as const,
    },
    {
      label: 'Bank UTR',
      key: 'bank_res_details',
      copy: true,
      type: 'object',
      objectKey: 'utr' as const,
    },
    { label: 'Image', key: 'user_submitted_image', type: 'image' as const },
    {
      label: 'Updated At',
      key: 'updated_at',
      copy: true,
      type: 'date' as const,
    },
  ],
  PAYIN_VENDOR: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    {
      label: 'Requested Amount',
      key: 'amount',
      copy: true,
      type: 'amount' as const,
    },
    {
      label: 'Received Amount',
      key: 'bank_res_details',
      copy: true,
      type: 'object',
      objectKey: 'amount',
      format: 'amount',
    },
    {
      label: 'User Submitted UTR',
      key: 'user_submitted_utr',
      copy: true,
      type: 'text' as const,
    },
    {
      label: 'Bank UTR',
      key: 'bank_res_details',
      copy: true,
      type: 'object',
      objectKey: 'utr' as const,
    },
    { label: 'Bank Name', copy: true, key: 'nick_name', type: 'text' as const },
    {
      label: 'Status',
      key: 'status',
      type: 'status' as const,
    },
    {
      label: 'Updated At',
      key: 'updated_at',
      copy: true,
      type: 'date' as const,
    },
  ],
  PAYIN_PROGRESS: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    {
      label: 'Merchant',
      key: 'merchant_details',
      type: 'object',
      objectKey: 'merchant_code' as const,
    },
    {
      label: 'Merchant Order Id',
      key: 'merchant_details',
      type: 'object',
      copy: true,
      objectKey: 'merchant_code' as const,
    },
    { label: 'User ID', key: 'user', copy: true, type: 'text' as const },
    {
      label: 'Status',
      key: 'status',
      type: 'status' as const,
    },
    {
      label: 'Requested Amount',
      key: 'amount',
      copy: true,
      type: 'amount' as const,
    },
    {
      label: 'Bank Name',
      copy: true,
      key: 'nick_name',
      type: 'text' as const,
    },
    {
      label: 'Updated At',
      key: 'updated_at',
      copy: true,
      type: 'date' as const,
    },
  ],
  PAYIN_PROGRESS_MERCHANT: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    {
      label: 'Merchant',
      key: 'merchant_details',
      type: 'object',
      objectKey: 'merchant_code' as const,
    },
    {
      label: 'Merchant Order ID',
      key: 'merchant_order_id',
      copy: true,
      type: 'text' as const,
    },
    {
      label: 'Status',
      key: 'status',
      type: 'status' as const,
    },
    {
      label: 'User ID',
      key: 'user',
      copy: true,
      type: 'text' as const,
    },
    {
      label: 'Requested Amount',
      key: 'amount',
      copy: true,
      type: 'amount' as const,
    },
    { label: 'Image', key: 'user_submitted_image', type: 'image' as const },
    {
      label: 'Updated At',
      key: 'updated_at',
      copy: true,
      type: 'date' as const,
    },
  ],
  PAYIN_PROGRESS_VENDOR: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    {
      label: 'Requested Amount',
      key: 'amount',
      copy: true,
      type: 'amount' as const,
    },
    { label: 'Bank Name', copy: true, key: 'nick_name', type: 'text' as const },
    {
      label: 'Status',
      key: 'status',
      type: 'status' as const,
    },
    {
      label: 'Updated At',
      key: 'updated_at',
      copy: true,
      type: 'date' as const,
    },
  ],
  PAYIN_COMPLETED: (update: boolean) =>
    [
      { label: ' ', key: 'more_details', type: 'more_details' },
      update && {
        label: 'history',
        key: 'history',
        type: 'expand',
      },
      {
        label: 'Merchant',
        key: 'merchant_details',
        type: 'object',
        objectKey: 'merchant_code' as const,
      },
      {
        label: 'Merchant Order Id',
        key: 'merchant_order_id',
        copy: true,
        type: 'text',
      },
      { label: 'User ID', key: 'user', copy: true, type: 'text' as const },
      { label: 'Status', key: 'status', type: 'status' as const },
      {
        label: 'Received Amount',
        key: 'bank_res_details',
        copy: true,
        type: 'object',
        objectKey: 'amount',
        format: 'amount',
      },
      {
        label: 'Bank UTR',
        key: 'bank_res_details',
        copy: true,
        type: 'object',
        objectKey: 'utr' as const,
      },
      {
        label: 'Merchant Commission',
        key: 'payin_merchant_commission',
        type: 'amount' as const,
      },
      {
        label: 'Vendor Commission',
        key: 'payin_vendor_commission',
        type: 'amount' as const,
      },
      {
        label: 'Bank Name',
        copy: true,
        key: 'nick_name',
        type: 'text' as const,
      },
      {
        label: 'Updated At',
        key: 'updated_at',
        copy: true,
        type: 'date' as const,
      },
      !update && { label: 'Actions', key: 'actions', type: 'actions' as const },
    ].filter(Boolean) as any[],
  PAYIN_COMPLETED_MERCHANT: (update: boolean) =>
    [
      { label: ' ', key: 'more_details', type: 'more_details' },
      update && {
        label: 'history',
        key: 'history',
        type: 'expand',
      },
      {
        label: 'Merchant',
        key: 'merchant_details',
        type: 'object',
        objectKey: 'merchant_code' as const,
      },
      {
        label: 'Merchant Order ID',
        key: 'merchant_order_id',
        copy: true,
        type: 'text' as const,
      },
      { label: 'Status', key: 'status', type: 'status' as const },
      {
        label: 'User ID',
        key: 'user',
        copy: true,
        type: 'text' as const,
      },
      {
        label: 'Received Amount',
        key: 'amount',
        copy: true,
        type: 'amount' as const,
      },
      {
        label: 'Merchant Commission',
        key: 'payin_merchant_commission',
        type: 'amount' as const,
      },
      {
        label: 'UTR',
        key: 'bank_res_details',
        copy: true,
        type: 'object' as const,
        objectKey: 'utr' as const,
      },
      {
        label: 'Updated At',
        key: 'updated_at',
        copy: true,
        type: 'date' as const,
      },
    ].filter(Boolean) as any[],
  PAYIN_COMPLETED_VENDOR: (update: boolean) =>
    [
      { label: ' ', key: 'more_details', type: 'more_details' },
      update && {
        label: 'history',
        key: 'history',
        type: 'expand',
      },
      {
        label: 'Received Amount',
        key: 'amount',
        copy: true,
        type: 'amount' as const,
      },
      {
        label: 'Commission',
        key: 'payin_vendor_commission',
        type: 'amount' as const,
      },
      {
        label: 'Bank Name',
        copy: true,
        key: 'nick_name',
        type: 'text' as const,
      },
      {
        label: 'Status',
        key: 'status',
        type: 'status' as const,
      },
      {
        label: 'Updated At',
        key: 'updated_at',
        copy: true,
        type: 'date' as const,
      },
    ].filter(Boolean) as any[],
  PAYIN_DROPPED_MERCHANT: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    {
      label: 'Merchant',
      key: 'merchant_details',
      type: 'object',
      objectKey: 'merchant_code' as const,
    },
    {
      label: 'Merchant Order ID',
      key: 'merchant_order_id',
      copy: true,
      type: 'text' as const,
    },
    { label: 'User ID', key: 'user', copy: true, type: 'text' as const },
    { label: 'Status', key: 'status', type: 'status' as const },
    // {
    //   label: 'User ID',
    //   key: 'user',
    //   copy: true,
    //   type: 'text' as const,
    // },
    {
      label: 'Requested Amount',
      key: 'amount',
      copy: true,
      type: 'amount' as const,
    },
    {
      label: 'Updated At',
      key: 'updated_at',
      copy: true,
      type: 'date' as const,
    },
  ],
  PAYIN_DROPPED_VENDOR: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    {
      label: 'Requested Amount',
      key: 'amount',
      copy: true,
      type: 'amount' as const,
    },
    { label: 'Bank Name', copy: true, key: 'nick_name', type: 'text' as const },
    {
      label: 'Status',
      key: 'status',
      type: 'status' as const,
    },
    {
      label: 'Updated At',
      key: 'updated_at',
      copy: true,
      type: 'date' as const,
    },
  ],
  BankDetails: (selectedMethod: string) => [
    { label: ' ', key: 'more_details', type: 'more_details' },
    { label: 'Bank Name', key: 'nick_name', copy: true, type: 'text' as const },
    {
      label: 'Bank Details',
      key: 'Bank_Details',
      type: 'Bank_details' as const,
    },
    { label: 'UPI', key: 'upi_id', type: 'text' as const },
    { label: 'Balance', key: 'today_balance', type: 'bank_balance' as const },
    // Only show QR and Bank toggles for PayIn
    ...(selectedMethod === 'PayIn'
      ? [
          { label: 'Allow QR?', key: 'is_qr', type: 'toggle' as const },
          { label: 'Show Bank', key: 'is_bank', type: 'toggle' as const },
        ]
      : []),
    { label: 'Status', key: 'is_enabled', type: 'toggle' as const },
    { label: 'Vendor', key: 'vendor', type: 'text' as const },
    { label: 'Actions', key: 'actions', type: 'actions' as const },
    { label: 'Daily Limit', key: 'max_limit', type: 'number' as const },
    { label: 'Freeze', key: 'freeze', type: 'button' as const },
  ],
  BankDetails_TXN_OP: (selectedMethod: string) => [
    { label: ' ', key: 'more_details', type: 'more_details' },
    { label: 'Bank Name', key: 'nick_name', copy: true, type: 'text' as const },
    {
      label: 'Bank Details',
      key: 'Bank_Details',
      type: 'Bank_details' as const,
    },
    { label: 'UPI', key: 'upi_id', type: 'text' as const },
    { label: 'Balance', key: 'today_balance', type: 'bank_balance' as const },
    { label: 'Vendors', key: 'vendor', type: 'text' as const },
    // Only show QR and Bank toggles for PayIn
    ...(selectedMethod === 'PayIn'
      ? [
          { label: 'Allow QR?', key: 'is_qr', type: 'toggle' as const },
          { label: 'Show Bank', key: 'is_bank', type: 'toggle' as const },
        ]
      : []),
    { label: 'Status', key: 'is_enabled', type: 'toggle' as const },
    { label: 'Actions', key: 'actions', type: 'actions' as const },
    { label: 'Daily Limit', key: 'max_limit', type: 'number' as const },
  ],
  BankDetails_VENDOR: (selectedMethod: string) => [
    { label: ' ', key: 'more_details', type: 'more_details' },
    { label: 'Bank Name', key: 'nick_name', copy: true, type: 'text' as const },
    {
      label: 'Bank Details',
      key: 'Bank_Details',
      type: 'Bank_details' as const,
    },
    // { label: 'Acc No', key: 'acc_no', type: 'text' as const },
    { label: 'UPI', key: 'upi_id', type: 'text' as const },
    // { label: 'Limits', key: 'limits', type: 'limits' as const },
    { label: 'Balance', key: 'today_balance', type: 'bank_balance' as const },
    // { label: 'Bank Used For', key: 'bank_used_for', type: 'text' as const },
    { label: 'Vendors', key: 'vendor', type: 'text' as const },
    // { label: 'Allow Intent?', key: 'is_intent', type: 'toggle' as const },
    ...(selectedMethod === 'PayIn'
      ? [
          // { label: 'Allow QR?', key: 'is_qr', type: 'toggle' as const },
          // // { label: 'Allow PhonePay', key: 'is_phonepay', type: 'toggle' as const },
          // { label: 'Show Bank', key: 'is_bank', type: 'toggle' as const },
        ]
      : []),
    // { label: 'Allow PhonePay', key: 'is_phonepay', type: 'toggle' as const },
    { label: 'Status', key: 'is_enabled', type: 'toggle' as const },
    { label: 'Actions', key: 'actions', type: 'actions' as const },
    //need to display as daily limit
    // { label: 'Daily Limit', key: 'max_limit', type: 'number' as const },
  ],
  BeneficiaryAccounts_Merchant: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    {
      label: 'Bank Name',
      key: 'bank_name',
      copy: true,
      type: 'text' as const,
    },
    {
      label: 'Account Holder',
      key: 'acc_holder_name',
      copy: true,
      type: 'text' as const,
    },
    {
      label: 'Account Number',
      key: 'acc_no',
      copy: true,
      type: 'text' as const,
    },
    {
      label: 'IFSC',
      key: 'ifsc',
      copy: true,
      type: 'text' as const,
    },
    {
      label: 'UPI',
      key: 'upi_id',
      copy: true,
      type: 'text' as const,
    },
  ],
  BeneficiaryAccounts_Merchant_Admin: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    {
      label: 'Bank Name',
      key: 'bank_name',
      copy: true,
      type: 'text' as const,
    },
    {
      label: 'Account Holder',
      key: 'acc_holder_name',
      copy: true,
      type: 'text' as const,
    },
    {
      label: 'Account Number',
      key: 'acc_no',
      copy: true,
      type: 'text' as const,
    },
    {
      label: 'IFSC',
      key: 'ifsc',
      copy: true,
      type: 'text' as const,
    },
    {
      label: 'UPI',
      key: 'upi_id',
      copy: true,
      type: 'text' as const,
    },
    { label: 'Merchant', key: 'merchant', type: 'text' as const },
    { label: 'Actions', key: 'actions', type: 'actions' as const },
  ],
  BeneficiaryAccounts_Vendor: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    {
      label: 'Bank Name',
      key: 'bank_name',
      copy: true,
      type: 'text' as const,
    },
    {
      label: 'Account Holder',
      key: 'acc_holder_name',
      copy: true,
      type: 'text' as const,
    },
    {
      label: 'Account Number',
      key: 'acc_no',
      copy: true,
      type: 'text' as const,
    },
    {
      label: 'IFSC',
      key: 'ifsc',
      copy: true,
      type: 'text' as const,
    },
    {
      label: 'UPI',
      key: 'upi_id',
      copy: true,
      type: 'text' as const,
    },
  ],
  BeneficiaryAccounts_Vendor_Admin: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    {
      label: 'Bank Name',
      key: 'bank_name',
      copy: true,
      type: 'text' as const,
    },
    {
      label: 'Bank Type',
      key: 'config_type',
      type: 'text',
      objectKey: 'type' as const,
    },
    {
      label: 'Account Holder',
      key: 'acc_holder_name',
      copy: true,
      type: 'text' as const,
    },
    {
      label: 'Account Number',
      key: 'acc_no',
      copy: true,
      type: 'text' as const,
    },
    {
      label: 'IFSC',
      key: 'ifsc',
      copy: true,
      type: 'text' as const,
    },
    {
      label: 'UPI',
      key: 'upi_id',
      copy: true,
      type: 'text' as const,
    },
    {
      label: 'Initial Balance',
      key: 'config_initial_balance',
      type: 'amount' as const,
    },
    {
      label: 'Closing Balance',
      key: 'config_closing_balance',
      type: 'amount' as const,
    },
    {
      label: 'Vendors',
      key: 'vendors',
      type: 'string',
    },
    { label: 'Status', key: 'is_enabled', type: 'toggle' as const },
    { label: 'Actions', key: 'actions', type: 'actions' as const },
  ],
  USERS: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    { label: 'Name', key: 'first_name', type: 'text' as const },
    { label: 'User Name', key: 'user_name', copy: true, type: 'text' as const },
    { label: 'Email', key: 'email', type: 'email' as const },
    { label: 'Designation', key: 'designation', type: 'text' as const },
    { label: 'Created At', key: 'created_at', type: 'date' as const },
    { label: 'Is Enable', key: 'is_enabled', type: 'toggle' as const },
    { label: 'Actions', key: 'actions', type: 'actions' as const },
  ],
  USERS_MERCHANT: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    { label: 'Name', key: 'first_name', type: 'text' as const },
    { label: 'User Name', key: 'user_name', copy: true, type: 'text' as const },
    { label: 'Designation', key: 'designation', type: 'text' as const },
    //merchant can disable its  users
    { label: 'Status', key: 'is_enabled', type: 'toggle' as const },
  ],
  USERS_VENDOR: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    { label: 'Name', key: 'first_name', type: 'text' as const },
    { label: 'User Name', key: 'user_name', copy: true, type: 'text' as const },
    { label: 'Designation', key: 'designation', type: 'text' as const },
  ],
  MERCHANTS_ALL: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    {
      label: 'Sub Merchants',
      key: 'subMerchants',
      type: 'expand' as const,
    },
    { label: 'Code', key: 'code', copy: true, type: 'text' as const },
    { label: 'Balance', key: 'balance', copy: true, type: 'amount' as const },
    { label: 'PayIn Range', key: 'payin_range', type: 'payin_range' as const },
    {
      label: 'PayIn Commission',
      key: 'payin_commission',
      type: 'range' as const,
    },
    {
      label: 'PayOut Range',
      key: 'payout_range',
      type: 'payout_range' as const,
    },
    {
      label: 'PayOut Commission',
      key: 'payout_commission',
      type: 'range' as const,
    },
    // { label: 'Test Mode', key: 'is_test_mode', type: 'toggle' as const },
    { label: 'Allow Intent', key: 'allow_intent', type: 'toggle' as const },
    {
      label: 'Clickrr Auto Payout',
      key: 'allow_clickrr',
      type: 'toggle' as const,
    },
    { label: 'Allow Payout', key: 'allow_payout', type: 'toggle' as const },
    { label: 'Allow Dispute', key: 'dispute_enabled', type: 'toggle' as const },
    { label: 'Enabled', key: 'is_enabled', type: 'toggle' as const },
    { label: 'Actions', key: 'actions', type: 'actions' as const },
  ],
  MERCHANTS: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    {
      label: 'Sub Merchants',
      key: 'subMerchants',
      type: 'expand' as const,
    },
    { label: 'Code', key: 'code', copy: true, type: 'text' as const },
    { label: 'Balance', key: 'balance', copy: true, type: 'amount' as const },
    { label: 'PayIn Range', key: 'payin_range', type: 'payin_range' as const },
    {
      label: 'PayIn Commission',
      key: 'payin_commission',
      type: 'range' as const,
    },
    {
      label: 'PayOut Range',
      key: 'payout_range',
      type: 'payout_range' as const,
    },
    {
      label: 'PayOut Commission',
      key: 'payout_commission',
      type: 'range' as const,
    },
  ],
  VENDOR_ALL: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    {
      label: 'Sub Vendors',
      key: 'subVendors',
      type: 'expand' as const,
    },
    { label: 'Code', key: 'code', copy: true, type: 'text' as const },
    { label: 'Name', key: 'full_name', type: 'text' as const },
    {
      label: 'Payin Commission',
      key: 'payin_commission',
      type: 'range' as const,
    },
    {
      label: 'Payout Commission',
      key: 'payout_commission',
      type: 'range' as const,
    },
    {
      label: 'Net Balance',
      key: 'balance',
      copy: true,
      type: 'amount' as const,
    },
    {
      label: 'Net Balance Limit',
      key: 'net_balance_limit',
      copy: true,
      type: 'amount' as const,
    },
    { label: 'Enabled', key: 'is_enabled', type: 'toggle' as const },
    { label: 'Actions', key: 'actions', type: 'actions' as const },
  ],
  VENDOR: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    {
      label: 'Sub Vendors',
      key: 'subVendors',
      type: 'expand' as const,
    },
    { label: 'Code', key: 'code', copy: true, type: 'text' as const },
    { label: 'Name', key: 'full_name', type: 'text' as const },
    {
      label: 'Payin Commission',
      key: 'payin_commission',
      type: 'range' as const,
    },
    {
      label: 'Payout Commission',
      key: 'payout_commission',
      type: 'range' as const,
    },
    {
      label: 'Net Balance',
      key: 'balance',
      copy: true,
      type: 'amount' as const,
    },
    {
      label: 'Net Balance Limit',
      key: 'net_balance_limit',
      copy: true,
      type: 'amount' as const,
    },
  ],
  SUB_VENDOR_ALL: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    { label: 'Code', key: 'code', copy: true, type: 'text' as const },
    { label: 'Name', key: 'full_name', type: 'text' as const },
    {
      label: 'Parent Vendor',
      key: 'parent_vendor_code',
      type: 'text' as const,
    },
    {
      label: 'Payin Commission',
      key: 'payin_commission',
      type: 'range' as const,
    },
    {
      label: 'Payout Commission',
      key: 'payout_commission',
      type: 'range' as const,
    },
    {
      label: 'Net Balance',
      key: 'balance',
      copy: true,
      type: 'amount' as const,
    },
    {
      label: 'Net Balance Limit',
      key: 'net_balance_limit',
      copy: true,
      type: 'amount' as const,
    },
    { label: 'Actions', key: 'actions', type: 'actions' as const },
  ],
  SUB_VENDOR: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    { label: 'Code', key: 'code', copy: true, type: 'text' as const },
    { label: 'Name', key: 'full_name', type: 'text' as const },
    {
      label: 'Parent Vendor',
      key: 'parent_vendor_code',
      type: 'text' as const,
    },
    {
      label: 'Payin Commission',
      key: 'payin_commission',
      type: 'range' as const,
    },
    {
      label: 'Payout Commission',
      key: 'payout_commission',
      type: 'range' as const,
    },
    {
      label: 'Net Balance',
      key: 'balance',
      copy: true,
      type: 'amount' as const,
    },
    {
      label: 'Net Balance Limit',
      key: 'net_balance_limit',
      copy: true,
      type: 'amount' as const,
    },
  ],
  PAYOUT: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    { label: '', key: '', type: 'checkbox' as const },
    {
      label: 'Merchant',
      key: 'merchant_details',
      type: 'object',
      objectKey: 'merchant_code' as const,
    },
    {
      label: 'Merchant Order id',
      key: 'merchant_order_id',
      copy: true,
      type: 'text' as const,
    },
    {
      label: 'Status',
      key: 'status',
      type: 'status' as const,
    },
    { label: 'Amount', key: 'amount', copy: true, type: 'amount' as const },
    { label: 'UTR ID', key: 'utr_id', type: 'text' as const },
    { label: 'FROM BANK', key: 'nick_name', type: 'text' as const },

    {
      label: 'Bank Details',
      key: 'user_bank_details',
      type: 'object',
      copy: true,
      objectKey: [
        'bank_name',
        'account_holder_name',
        'account_no',
        'ifsc_code',
      ],
    },
    { label: 'User ID', key: 'user', type: 'text' as const },
    {
      label: 'Vendor',
      key: 'vendor_code',
      format: 'vendor',
      type: 'text' as const,
    },
    { label: 'Date', key: 'updated_at', type: 'date' as const },
    { label: 'Actions', key: 'actions', type: 'actions' as const },
  ],
  PAYOUT_VENDOR: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    //payout id in vendor for uniquely identifying
    { label: 'ID', copy: true, key: 'id', type: 'text' as const },
    {
      label: 'Bank Details',
      key: 'user_bank_details',
      type: 'object',
      copy: true,
      objectKey: [
        'bank_name',
        'account_holder_name',
        'account_no',
        'ifsc_code',
      ],
    },
    {
      label: 'Status',
      key: 'status',
      type: 'status' as const,
    },
    { label: 'Amount', key: 'amount', copy: true, type: 'amount' as const },
    { label: 'Bank Name', copy: true, key: 'nick_name', type: 'text' as const },
    { label: 'UTR ID', key: 'utr_id', type: 'text' as const },
    {
      label: 'Vendor',
      key: 'vendor_code',
      type: 'text' as const,
    },
    { label: 'FROM BANK', key: 'nick_name', type: 'text' as const },
    { label: 'Actions', key: 'actions', type: 'actions' as const },
  ],
  PAYOUT_VENDOR_ADMIN: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    //payout id in vendor for uniquely identifying
    { label: 'ID', copy: true, key: 'id', type: 'text' as const },
    {
      label: 'Bank Details',
      key: 'user_bank_details',
      type: 'object',
      copy: true,
      objectKey: [
        'bank_name',
        'account_holder_name',
        'account_no',
        'ifsc_code',
      ],
    },
    {
      label: 'Status',
      key: 'status',
      type: 'status' as const,
    },
    { label: 'Amount', key: 'amount', copy: true, type: 'amount' as const },
    { label: 'Bank Name', copy: true, key: 'nick_name', type: 'text' as const },
    { label: 'UTR ID', key: 'utr_id', type: 'text' as const },
    {
      label: 'Vendor',
      key: 'vendor_code',
      type: 'text' as const,
    },
    { label: 'FROM BANK', key: 'nick_name', type: 'text' as const },
    // { label: 'Actions', key: 'actions', type: 'actions' as const },
  ],
  PAYOUT_PROGRESS_VENDOR: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    {
      label: 'Bank Details',
      key: 'user_bank_details',
      type: 'object',
      copy: true,
      objectKey: [
        'bank_name',
        'account_holder_name',
        'account_no',
        'ifsc_code',
      ],
    },
    {
      label: 'Status',
      key: 'status',
      type: 'status' as const,
    },
    { label: 'Amount', key: 'amount', copy: true, type: 'amount' as const },
    {
      label: 'Vendor',
      key: 'vendor_code',
      type: 'text' as const,
    },
    { label: 'Actions', key: 'actions', type: 'actions' as const },
  ],
  PAYOUT_COMPLETED_VENDOR: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    {
      label: 'Bank Details',
      key: 'user_bank_details',
      type: 'object',
      copy: true,
      objectKey: [
        'bank_name',
        'account_holder_name',
        'account_no',
        'ifsc_code',
      ],
    },
    { label: 'Amount', key: 'amount', copy: true, type: 'amount' as const },
    {
      label: 'Status',
      key: 'status',
      type: 'status' as const,
    },
    {
      label: 'Commission',
      key: 'payout_vendor_commission',
      type: 'amount' as const,
    },
    { label: 'Bank Name', copy: true, key: 'nick_name', type: 'text' as const },
    { label: 'UTR ID', key: 'utr_id', type: 'text' as const },
    {
      label: 'Vendor',
      key: 'vendor_code',
      type: 'text' as const,
    },
    { label: 'Actions', key: 'actions', type: 'actions' as const },
  ],
  PAYOUT_DROPPED_VENDOR: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    {
      label: 'Bank Details',
      key: 'user_bank_details',
      type: 'object',
      copy: true,
      objectKey: [
        'bank_name',
        'account_holder_name',
        'account_no',
        'ifsc_code',
      ],
    },
    {
      label: 'Status',
      key: 'status',
      type: 'status' as const,
    },
    { label: 'UTR ID', key: 'utr_id', type: 'text' as const },
    {
      label: 'Vendor',
      key: 'vendor_code',
      type: 'text' as const,
    },
    { label: 'Amount', key: 'amount', copy: true, type: 'amount' as const },
  ],
  PAYOUT_MERCHANT: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    {
      label: 'Merchant',
      key: 'merchant_details',
      copy: true,
      type: 'object',
      objectKey: 'merchant_code' as const,
    },
    {
      label: 'Merchant Order id',
      key: 'merchant_order_id',
      copy: true,
      type: 'text' as const,
    },
    {
      label: 'Status',
      key: 'status',
      type: 'status' as const,
    },
    {
      label: 'Amount',
      key: 'amount',
      copy: true,
      type: 'amount' as const,
    },
    {
      label: 'Bank Details',
      key: 'user_bank_details',
      type: 'object',
      copy: true,
      objectKey: [
        'bank_name',
        'account_holder_name',
        'account_no',
        'ifsc_code',
      ],
    },
    {
      label: 'User',
      key: 'user',
      type: 'text' as const,
      placeholder: 'Enter User',
      validation: yup.string().required('User is required'),
    },
  ],
  PAYOUT_COMPLETED: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    // { label: '', key: '', type: 'checkbox' as const },
    // { label: 'SNO.', key: 'sno', type: 'text' as const },
    {
      label: 'Merchant',
      key: 'merchant_details',
      type: 'object',
      objectKey: 'merchant_code' as const,
    },
    {
      label: 'Merchant Order id',
      key: 'merchant_order_id',
      copy: true,
      type: 'text' as const,
    },
    {
      label: 'Status',
      key: 'status',
      type: 'status' as const,
    },
    { label: 'Amount', key: 'amount', copy: true, type: 'amount' as const },
    {
      label: 'Merchant Commission',
      key: 'payout_merchant_commission',
      type: 'amount' as const,
    },
    {
      label: 'Vendor Commission',
      key: 'payout_vendor_commission',
      type: 'amount' as const,
    },
    {
      label: 'Reference Number',
      key: 'utr_id',
      type: 'text' as const,
    },
    {
      label: 'Bank Details',
      key: 'user_bank_details',
      type: 'object',
      copy: true,
      objectKey: [
        'bank_name',
        'account_holder_name',
        'account_no',
        'ifsc_code',
      ],
    },
    { label: 'User ID', key: 'user', type: 'text' as const },
    {
      label: 'Vendor',
      key: 'vendor_code',
      format: 'vendor',
      type: 'text' as const,
    },
    { label: 'Date', key: 'updated_at', type: 'date' as const },
    { label: 'Actions', key: 'actions', type: 'actions' as const },
  ],
  PAYOUT_REJECTED: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    {
      label: 'Merchant',
      key: 'merchant_details',
      type: 'object',
      objectKey: 'merchant_code' as const,
    },
    {
      label: 'Merchant Order id',
      key: 'merchant_order_id',
      copy: true,
      type: 'text' as const,
    },
    {
      label: 'Status',
      key: 'status',
      type: 'status' as const,
    },
    { label: 'Amount', key: 'amount', copy: true, type: 'amount' as const },
    { label: 'UTR ID', key: 'utr_id', type: 'text' as const },
    {
      label: 'Bank Details',
      key: 'user_bank_details',
      type: 'object',
      copy: true,
      objectKey: [
        'bank_name',
        'account_holder_name',
        'account_no',
        'ifsc_code',
      ],
    },
    { label: 'User ID', key: 'user', type: 'text' as const },
    {
      label: 'Vendor',
      key: 'vendor_code',
      format: 'vendor',
      type: 'text' as const,
    },
    { label: 'Date', key: 'updated_at', type: 'date' as const },
    { label: 'Actions', key: 'actions', type: 'actions' as const },
  ],
  REPORT_MERCHANT_MASTER: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    { label: 'Created At', key: 'created_at', type: 'dateReport' as const },
    { label: 'Code', key: 'code', type: 'text' as const },
    { label: 'Net Balance', key: 'net_balance', type: 'amount' as const },
    {
      label: 'Current Balance',
      key: 'current_balance',
      type: 'amount' as const,
    },
    {
      label: 'Total Payin Amount',
      key: 'total_payin_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Payin Commission',
      key: 'total_payin_commission',
      type: 'amount' as const,
    },
    {
      label: 'Total Payin Count',
      key: 'total_payin_count',
      type: 'text' as const,
    },
    {
      label: 'Total Payout Amount',
      key: 'total_payout_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Payout Commission',
      key: 'total_payout_commission',
      type: 'amount' as const,
    },
    {
      label: 'Total Payout Count',
      key: 'total_payout_count',
      type: 'text' as const,
    },
    {
      label: 'Total Reverse Payout Amount',
      key: 'total_reverse_payout_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Reverse Reverse Payout Commission',
      key: 'total_reverse_payout_commission',
      type: 'amount' as const,
    },
    {
      label: 'Total Reverse Payout Count',
      key: 'total_reverse_payout_count',
      type: 'text' as const,
    },
    {
      label: 'Total Settlement Amount',
      key: 'total_settlement_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total AED Sent Settlement',
      key: 'total_aed_sent_settlement_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Bank Sent Settlement',
      key: 'total_bank_sent_settlement_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Cash Sent Settlement',
      key: 'total_cash_sent_settlement_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Crypto Sent Settlement',
      key: 'total_crypto_sent_settlement_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total AED Received Settlement',
      key: 'total_aed_received_settlement_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Bank Received Settlement',
      key: 'total_bank_received_settlement_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Cash Received Settlement',
      key: 'total_cash_received_settlement_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Crypto Received Settlement',
      key: 'total_crypto_received_settlement_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Chargeback Amount',
      key: 'total_chargeback_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Adjustment Amount',
      key: 'adjustment_amount_combined',
      type: 'amount' as const,
    },
    // { label: 'Actions', key: 'actions', type: 'actions' as const },
  ],
  REPORT_MERCHANT: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    { label: 'Created At', key: 'created_at', type: 'dateReport' as const },
    { label: 'Code', key: 'code', type: 'text' as const },
    { label: 'Net Balance', key: 'net_balance', type: 'amount' as const },
    {
      label: 'Current Balance',
      key: 'current_balance',
      type: 'amount' as const,
    },
    {
      label: 'Total Payin Amount',
      key: 'total_payin_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Payin Commission',
      key: 'total_payin_commission',
      type: 'amount' as const,
    },
    {
      label: 'Total Payin Count',
      key: 'total_payin_count',
      type: 'text' as const,
    },
    {
      label: 'Total Payout Amount',
      key: 'total_payout_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Payout Commission',
      key: 'total_payout_commission',
      type: 'amount' as const,
    },
    {
      label: 'Total Payout Count',
      key: 'total_payout_count',
      type: 'text' as const,
    },
    {
      label: 'Total Reverse Payout Amount',
      key: 'total_reverse_payout_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Reverse Reverse Payout Commission',
      key: 'total_reverse_payout_commission',
      type: 'amount' as const,
    },
    {
      label: 'Total Reverse Payout Count',
      key: 'total_reverse_payout_count',
      type: 'text' as const,
    },
    {
      label: 'Total Settlement Amount',
      key: 'total_settlement_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total AED Sent Settlement',
      key: 'total_aed_sent_settlement_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Bank Sent Settlement',
      key: 'total_bank_sent_settlement_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Cash Sent Settlement',
      key: 'total_cash_sent_settlement_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Crypto Sent Settlement',
      key: 'total_crypto_sent_settlement_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total AED Received Settlement',
      key: 'total_aed_received_settlement_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Bank Received Settlement',
      key: 'total_bank_received_settlement_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Cash Received Settlement',
      key: 'total_cash_received_settlement_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Crypto Received Settlement',
      key: 'total_crypto_received_settlement_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Chargeback Amount',
      key: 'total_chargeback_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Adjustment Amount',
      key: 'adjustment_amount_combined',
      type: 'amount' as const,
    },
  ],
  REPORT_VENDOR_MASTER: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    { label: 'Created At', key: 'created_at', type: 'dateReport' as const },
    { label: 'Code', key: 'code', type: 'text' as const },
    { label: 'Net Balance', key: 'net_balance', type: 'amount' as const },
    {
      label: 'Current Balance',
      key: 'current_balance',
      type: 'amount' as const,
    },

    {
      label: 'Total Payin Amount',
      key: 'total_payin_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Payin Commission',
      key: 'total_payin_commission',
      type: 'amount' as const,
    },
    {
      label: 'Total Payin Count',
      key: 'total_payin_count',
      type: 'text' as const,
    },
    {
      label: 'Total Payout Amount',
      key: 'total_payout_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Payout Commission',
      key: 'total_payout_commission',
      type: 'amount' as const,
    },
    {
      label: 'Total Payout Count',
      key: 'total_payout_count',
      type: 'text' as const,
    },
    {
      label: 'Total Reverse Payout Amount',
      key: 'total_reverse_payout_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Reverse Reverse Payout Commission',
      key: 'total_reverse_payout_commission',
      type: 'amount' as const,
    },
    {
      label: 'Total Reverse Payout Count',
      key: 'total_reverse_payout_count',
      type: 'text' as const,
    },
    {
      label: 'Total Settlement Amount',
      key: 'total_settlement_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total AED Sent Settlement',
      key: 'total_aed_sent_settlement_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Bank Sent Settlement',
      key: 'total_bank_sent_settlement_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Cash Sent Settlement',
      key: 'total_cash_sent_settlement_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Crypto Sent Settlement',
      key: 'total_crypto_sent_settlement_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total AED Received Settlement',
      key: 'total_aed_received_settlement_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Bank Received Settlement',
      key: 'total_bank_received_settlement_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Cash Received Settlement',
      key: 'total_cash_received_settlement_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Crypto Received Settlement',
      key: 'total_crypto_received_settlement_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Internal Qr Settlement',
      key: 'total_internal_settlement_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Internal Bank Settlement',
      key: 'total_internal_bank_settlement_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Internal Settlement Amount',
      key: 'internal_settlement_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Chargeback Amount',
      key: 'total_chargeback_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Adjustment Amount',
      key: 'adjustment_amount_combined',
      type: 'amount' as const,
    },
    // { label: 'Actions', key: 'actions', type: 'actions' as const },
  ],
  REPORT_VENDOR: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    { label: 'Created At', key: 'created_at', type: 'dateReport' as const },
    { label: 'Code', key: 'code', type: 'text' as const },
    { label: 'Net Balance', key: 'net_balance', type: 'amount' as const },
    {
      label: 'Current Balance',
      key: 'current_balance',
      type: 'amount' as const,
    },
    {
      label: 'Total Payin Amount',
      key: 'total_payin_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Payin Commission',
      key: 'total_payin_commission',
      type: 'amount' as const,
    },
    {
      label: 'Total Payin Count',
      key: 'total_payin_count',
      type: 'text' as const,
    },
    {
      label: 'Total Payout Amount',
      key: 'total_payout_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Payout Commission',
      key: 'total_payout_commission',
      type: 'amount' as const,
    },
    {
      label: 'Total Payout Count',
      key: 'total_payout_count',
      type: 'text' as const,
    },
    {
      label: 'Total Reverse Payout Amount',
      key: 'total_reverse_payout_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Reverse Reverse Payout Commission',
      key: 'total_reverse_payout_commission',
      type: 'amount' as const,
    },
    {
      label: 'Total Reverse Payout Count',
      key: 'total_reverse_payout_count',
      type: 'text' as const,
    },
    {
      label: 'Total Settlement Amount',
      key: 'total_settlement_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total AED Sent Settlement',
      key: 'total_aed_sent_settlement_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Bank Sent Settlement',
      key: 'total_bank_sent_settlement_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Cash Sent Settlement',
      key: 'total_cash_sent_settlement_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Crypto Sent Settlement',
      key: 'total_crypto_sent_settlement_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total AED Received Settlement',
      key: 'total_aed_received_settlement_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Bank Received Settlement',
      key: 'total_bank_received_settlement_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Cash Received Settlement',
      key: 'total_cash_received_settlement_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Crypto Received Settlement',
      key: 'total_crypto_received_settlement_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Internal Qr Settlement',
      key: 'total_internal_settlement_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Internal Bank Settlement',
      key: 'total_internal_bank_settlement_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Internal Settlement Amount',
      key: 'internal_settlement_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Chargeback Amount',
      key: 'total_chargeback_amount',
      type: 'amount' as const,
    },
    {
      label: 'Total Adjustment Amount',
      key: 'adjustment_amount_combined',
      type: 'amount' as const,
    },
  ],
  BANK_RESPONSE: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    { label: 'SNO.', key: 'sno', type: 'text' as const },
    { label: 'Status', key: 'status', type: 'text' as const },
    { label: 'Amount', key: 'amount', type: 'amount_hover' as const },
    { label: 'Amount Code', key: 'upi_short_code', type: 'text' as const },
    { label: 'UTR', key: 'utr', copy: true, type: 'utr_hover' as const },
    {
      label: 'Bank Name',
      key: 'nick_name',
      copy: true,
      type: 'bank_hover' as const,
    },
    {
      label: 'Vendor',
      key: 'vendor_code',
      copy: true,
      type: 'text' as const,
    },
    { label: 'Is Used', key: 'is_used', type: 'toggle' as const },
    {
      label: 'Updated Date',
      key: 'updated_at',
      copy: true,
      type: 'date' as const,
    },
    { label: 'Updated By', key: 'updated_by', type: 'text' as const },
    { label: 'Actions', key: 'actions', type: 'actions' as const },
  ],
  BANK_RESPONSE_TRANSACTIONS: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    { label: 'SNO.', key: 'sno', type: 'text' as const },
    { label: 'Status', key: 'status', type: 'text' as const },
    { label: 'Amount', key: 'amount', type: 'amount_hover' as const },
    { label: 'Amount Code', key: 'upi_short_code', type: 'text' as const },
    { label: 'UTR', key: 'utr', copy: true, type: 'text' as const },
    { label: 'Bank Name', key: 'nick_name', copy: true, type: 'text' as const },
    {
      label: 'Vendor',
      key: 'vendor_code',
      copy: true,
      type: 'text' as const,
    },
    { label: 'Is Used', key: 'is_used', type: 'toggle' as const },
    {
      label: 'Updated Date',
      key: 'updated_at',
      copy: true,
      type: 'date' as const,
    },
    { label: 'Updated By', key: 'updated_by', type: 'text' as const },
  ],
  BANK_RESPONSE_VENDOR: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    { label: 'Status', key: 'status', type: 'text' as const },
    { label: 'Amount', key: 'amount', type: 'amount_hover' as const },
    { label: 'UTR', key: 'utr', copy: true, type: 'text' as const },
    { label: 'Bank Name', key: 'nick_name', copy: true, type: 'text' as const },
    {
      label: 'Vendor',
      key: 'vendor_code',
      copy: true,
      type: 'text' as const,
    },
    {
      label: 'Created Date',
      key: 'created_at',
      copy: true,
      type: 'date' as const,
    },
  ],
  CHECK_UTR_HISTORY: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    { label: 'SNO.', key: 'sno', type: 'text' as const },
    {
      label: 'Merchant Order ID',
      key: 'merchant_order_id',
      copy: true,
      type: 'text' as const,
    },
    { label: 'UTR', key: 'utr', copy: true, type: 'text' as const },
    {
      label: 'Created Date',
      key: 'created_at',
      copy: true,
      type: 'date' as const,
    },
  ],
  ADMIN_CHARGEBACK: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    { label: 'SNO.', key: 'sno', type: 'text' as const },
    { label: 'Merchant', key: 'merchant_name', type: 'text' as const },
    {
      label: 'Merchant Order ID',
      key: 'merchant_order_id',
      copy: true,
      type: 'text' as const,
    },
    { label: 'User', key: 'user', type: 'text' as const },
    { label: 'Amount', key: 'amount', type: 'amount' as const },
    { label: 'UTR', key: 'utr', copy: true, type: 'text' as const },
    { label: 'Bank Name', key: 'bank_name', type: 'text' as const },
    { label: 'Vendor', key: 'vendor_name', type: 'text' as const },
    { label: 'Reference Date', key: 'reference_date', type: 'date' as const },
    {
      label: 'Created Date',
      key: 'created_at',
      copy: true,
      type: 'date' as const,
    },
    { label: 'Block User', key: 'button', type: 'button' as const },
    { label: 'Actions', key: 'actions', type: 'actions' as const },
  ],
  CHARGEBACK: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    { label: 'SNO.', key: 'sno', type: 'text' as const },
    { label: 'Bank Name', key: 'bank_name', type: 'text' as const },
    { label: 'Amount', key: 'amount', type: 'amount' as const },
    { label: 'UTR', key: 'utr', copy: true, type: 'text' as const },
    { label: 'Reference Date', key: 'reference_date', type: 'date' as const },
    {
      label: 'Created Date',
      key: 'created_at',
      copy: true,
      type: 'date' as const,
    },
  ],
  CHARGEBACK_MERCHANT: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    { label: 'SNO.', key: 'sno', type: 'text' as const },
    { label: 'Merchant', key: 'merchant_name', type: 'text' as const },
    {
      label: 'Merchant Order ID',
      key: 'merchant_order_id',
      copy: true,
      type: 'text' as const,
    },
    { label: 'User', key: 'user', type: 'text' as const },
    { label: 'Amount', key: 'amount', type: 'amount' as const },
    { label: 'UTR', key: 'utr', copy: true, type: 'text' as const },
    {
      label: 'Created Date',
      key: 'created_at',
      copy: true,
      type: 'date' as const,
    },
  ],
  MERCHANT_SETTLEMENT: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    { label: '', key: '', type: 'checkbox' as const },
    { label: 'Sno.', key: 'sno', type: 'text' },
    { label: 'Code.', key: 'code', type: 'text' }, //--add merchant codes
    {
      label: 'Bank Details',
      key: 'config',
      type: 'object',
      objectKey: [
        'beneficiary_bank_name',
        'bank_name',
        'acc_holder_name',
        'acc_no',
        'ifsc',
        'description',
        'wallet_balance',
        'utr',
      ],
    },
    {
      label: 'UTR',
      key: 'config',
      copy: true,
      type: 'object',
      objectKey: 'reference_id' as const,
    },
    { label: 'Amount', key: 'amount', type: 'amount' },
    { label: 'Method', key: 'method', type: 'text' },
    { label: 'Status', key: 'status', type: 'status' },
    {
      label: 'Updated At',
      key: 'updated_at',
      copy: true,
      type: 'date' as const,
    },
  ],
  VENDOR_SETTLEMENT: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    { label: '', key: '', type: 'checkbox' as const },
    { label: 'Sno.', key: 'sno', type: 'text' },
    { label: 'Code', key: 'code', type: 'text' }, //-- show codes in vendor login too
    {
      label: 'Bank Details',
      key: 'config',
      type: 'object',
      objectKey: [
        'beneficiary_bank_name',
        'bank_name',
        'acc_holder_name',
        'acc_no',
        'ifsc',
        'description',
        'wallet_balance',
        'utr',
      ], //--added utr to show in column
      // --vendor settlement bank account visible
    },
    {
      label: 'UTR',
      key: 'config',
      copy: true,
      type: 'object',
      objectKey: 'reference_id' as const,
    },
    {
      label: 'Debit/Credit',
      key: 'config',
      type: 'object',
      objectKey: 'debit_credit' as const,
    },
    { label: 'Amount', key: 'amount', type: 'amount' },
    { label: 'Method', key: 'method', type: 'text' },
    { label: 'Status', key: 'status', type: 'status' },
    {
      label: 'Updated At',
      key: 'updated_at',
      copy: true,
      type: 'date' as const,
    },
  ],
  SETTLEMENT: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    { label: '', key: '', type: 'checkbox' as const },
    // { label: 'Sno.', key: 'sno', type: 'text' },
    { label: 'Code', key: 'code', type: 'text' }, //--add merchant codes
    {
      label: 'Bank Details',
      key: 'config',
      type: 'object',
      objectKey: [
        'beneficiary_bank_name',
        'bank_name',
        'acc_holder_name',
        'acc_no',
        'ifsc',
        'description',
        'wallet_balance',
        'utr',
      ], //--added utr to show in column
    },
    {
      label: 'UTR',
      key: 'config',
      copy: true,
      type: 'object',
      objectKey: 'reference_id' as const,
    },
    {
      label: 'Debit/Credit',
      key: 'config',
      type: 'object',
      objectKey: 'debit_credit' as const,
    },
    { label: 'Amount', key: 'amount', type: 'amount' },
    { label: 'Method', key: 'method', type: 'text' },
    { label: 'Status', key: 'status', type: 'status' },
    {
      label: 'Updated At',
      key: 'updated_at',
      copy: true,
      type: 'date' as const,
    },
    { label: 'Actions', key: 'actions', type: 'actions' as const },
  ],
  RESETHISTORY: [
    { label: ' ', key: 'more_details', type: 'more_details' },
    { label: 'Sno.', key: 'sno', type: 'text' },
    {
      label: 'Merchant Order ID',
      key: 'merchant_order_id',
      copy: true,
      type: 'text',
    },

    {
      label: 'Previous Details',
      key: 'previous_details',
      type: 'object',
      copy: true,
      objectKey: ['amount', 'previous_status', 'utr'],
    },
    {
      label: 'Reset Details',
      key: 'new_details',
      type: 'object',
      copy: true,
      objectKey: ['status', 'user_submitted_utr', 'confirmed'],
    },
  ],
};

interface EditRowFormFieldsOptions {
  isUpdating?: boolean;
  editingField?:
    | 'amount'
    | 'bank_res_details'
    | 'bank_acc_id'
    | 'status'
    | null;
  isFieldBeingEdited?: boolean;
}

export const EditRowFormFields = (
  bankOptions?: Option[],
  options: EditRowFormFieldsOptions = {},
) => {
  const {
    isUpdating = false,
    editingField = null,
    isFieldBeingEdited = false,
  } = options;

  // For single-field editing, require editingField to be specified
  // This prevents accidental multi-field editing
  if (!editingField) {
    return { Edit_Row: [] }; // Return empty to force field selection
  }

  // Only return the field that's being edited
  const getFieldConfig = (
    fieldName: 'amount' | 'bank_res_details' | 'bank_acc_id' | 'status',
  ) => {
    const baseConfig = {
      width: '12',
      disabled: isUpdating || isFieldBeingEdited, // Disable during API calls OR when any field is being edited
    };

    switch (fieldName) {
      case 'amount':
        return {
          ...baseConfig,
          name: 'amount',
          label: 'Amount',
          type: 'number',
          placeholder: 'Enter amount',
          validation: yup.number().min(1),
        };
      case 'bank_res_details':
        return {
          ...baseConfig,
          name: 'bank_res_details',
          label: 'UTR',
          type: 'text',
          placeholder: 'Enter UTR',
          validation: yup.string(),
        };
      case 'bank_acc_id':
        return {
          ...baseConfig,
          name: 'bank_acc_id',
          label: 'Bank',
          type: 'select',
          options: bankOptions,
          validation: yup.string(),
        };
      case 'status':
        return {
          ...baseConfig,
          name: 'status',
          label: 'Status',
          type: 'select',
          options: [
            { value: 'PENDING', label: 'Pending' },
            { value: 'SUCCESS', label: 'Success' },
            { value: 'FAILED', label: 'Failed' },
          ],
          validation: yup.string(),
        };
      default:
        return null;
    }
  };

  const fieldConfig = getFieldConfig(editingField);

  return {
    Edit_Row: fieldConfig ? [fieldConfig] : [],
  };
};

export const getClaimFilterFields = (bankOptions: Option[]) => ({
  Claim_Filter: [
    {
      name: 'bank_id',
      label: 'Bank',
      type: 'select',
      options: bankOptions,
      validation: yup.string(),
      width: '12',
    },
    {
      name: 'date',
      label: 'Date',
      type: 'datepicker',
      single: true,
      validation: yup.string().required('Date is required'),
      width: '12',
    },
  ],
});

interface Option {
  value: string;
  label: string;
}
export const getSettlementsFormFields = (
  bankOptions: Option[],
  methodsOptions: Option[],
  updated: boolean,
  handleMethodChange: (event: React.ChangeEvent<HTMLSelectElement>) => void,
  handleBeneficiaryChange: (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => void,
  handleCodeChange: (event: React.ChangeEvent<HTMLSelectElement>) => void,
  handleAmountChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
  handleDebitCredit: (event: React.ChangeEvent<HTMLSelectElement>) => void,
  handleBankNameChange: (event: React.ChangeEvent<HTMLSelectElement>) => void,
  accountNumberOptions: Option[],
) => ({
  Add_Settlement: [
    {
      name: 'code',
      label: 'Code',
      type: 'select',
      placeholder: 'Enter your Code',
      options: bankOptions,
      onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
        handleCodeChange(e),
      validation: yup.mixed(),
      width: '12',
    },
    {
      name: 'amount',
      label: 'Amount',
      type: 'number',
      placeholder: 'Enter your Amount',
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        handleAmountChange(e),
      validation: yup.number().min(1).required('Amount is required'),
      width: '12',
    },
    {
      name: 'method',
      label: 'Method',
      type: 'select', // Use 'select' instead of 'text' if it's a dropdown
      placeholder: 'Enter your Method',
      onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
        handleMethodChange(e),
      options: methodsOptions,
      validation: yup.string().required('Method is required'),
      width: '12',
    },
    !updated && {
      name: 'debit_credit',
      label: 'Sent / Received',
      type: 'select',
      onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
        handleDebitCredit(e),
      placeholder: 'Select Sent or Received',
      options: [
        { value: 'SENT', label: 'Sent By Admin' },
        { value: 'RECEIVED', label: 'Received By Admin' },
      ],
      validation: yup.string().required('Sent / Received is required'),
      width: '12',
    },
  ].filter(Boolean),
  Bank_Details: (
    method: string,
    beneficiaryOptions: Option[],
    selectedBeneficiary: any,
    // title: string,
  ) =>
    method === 'BANK'
      ? [
          {
            name: 'bank_name',
            label: 'Bank Name',
            type: 'select',
            options: beneficiaryOptions,
            value: selectedBeneficiary?.bank_name || '',
            onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
              handleBankNameChange(e),
            placeholder: 'Select Bank Name',
            validation: yup.string().required('Bank Name is required'),
          },
          {
            name: 'acc_no',
            label: 'Account Number',
            type: 'select',
            options: accountNumberOptions,
            value: selectedBeneficiary?.acc_no || '',
            onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
              handleBeneficiaryChange(e),
            placeholder: 'Select Account Number',
            validation: yup.string().required('Account Number is required'),
            disabled: accountNumberOptions.length === 0,
          },
          {
            name: 'acc_holder_name',
            label: 'Holder Name',
            type: 'text',
            value: selectedBeneficiary?.acc_holder_name,
            placeholder: 'Acc Holder Name',
            validation: yup
              .string()
              .required('Account Holder Name is required'),
            disabled: true,
          },
          {
            name: 'ifsc',
            label: 'IFSC',
            type: 'text',
            placeholder: 'Enter IFSC Code',
            value: selectedBeneficiary?.ifsc,
            validation: yup
              .string()
              .required('IFSC Code is required')
              .test('valid-ifsc', 'Invalid IFSC Code', async function (value) {
                if (!value) return false;
                const isValid = await debouncedValidateIfscCode(value);
                return isValid ?? false;
              }),
            disabled: true,
          },
        ]
      : [],
  Crypto_Details: (method: string) => {
    return method === 'CRYPTO'
      ? [
          {
            name: 'wallet_balance',
            label: 'Wallet Balance',
            type: 'text',
            placeholder: 'Enter Wallet Balance',
            validation: yup.string().required('Wallet Balance is required'),
          },
          {
            name: 'description',
            label: 'Description',
            type: 'text',
            placeholder: 'Enter Description',
            validation: yup.string().optional(),
          },
        ]
      : [];
  },
  Description: (method: string) => {
    return method === 'AED' || method === 'CASH'
      ? [
          {
            name: 'description',
            label: 'Description',
            type: 'text',
            placeholder: 'Enter Description',
            validation: yup.string().optional(),
            width: '12',
          },
        ]
      : [];
  },
  Internal_transfer: (method: string) => {
    return method === 'INTERNAL_QR_TRANSFER' ||
      method === 'INTERNAL_BANK_TRANSFER'
      ? [
          {
            name: 'utr',
            label: 'UTR',
            type: 'text',
            placeholder: 'Enter UTR',
            validation: yup.string().required('Wallet UTR is required'),
            width: '12', //full width
          },
        ]
      : [];
  },
});

export const getTransactionFormFields = (
  merchantOptions: Option[],
  role: string,
  oneTime: boolean = false,
  onOneTimeChange?: (value: boolean, currentFormValues?: any) => void,
) => ({
  PAYIN: {
    Payin_Request: [
      {
        name: 'code',
        label: 'Merchant',
        type: 'select',
        options: merchantOptions,
        validation: yup.string().required('Merchant is required'),
      },
      {
        name: 'user_id',
        label: 'User',
        type: 'text',
        placeholder: 'Enter User',
        validation: yup.string().required('User is required'),
      },
      ...(role && (role === Role.MERCHANT || role === Role.ADMIN) && oneTime
        ? [
            {
              name: 'merchant_order_id',
              label: 'Merchant Order ID',
              type: 'text',
              width: '12',
              copy: true,
              placeholder: 'Enter Merchant Order ID',
              validation: yup
                .string()
                .max(40, 'Merchant Order ID must be at most 40 characters')
                .optional(),
            },
          ]
        : []),
      {
        name: 'amount',
        label: 'Amount',
        type: 'text',
        placeholder: 'Enter Amount',
        validation: yup
          .string()
          .matches(/^\d+$/, 'Amount must be a valid number')
          .test(
            'min',
            'Amount must be at least 1',
            (val) => Number(val) >= 1 || val === undefined,
          )
          .test(
            'max',
            'Amount cannot exceed 500,000',
            (val) => Number(val) <= 500000 || val === undefined,
          )
          .transform((value, originalValue) =>
            originalValue === '' ? undefined : value,
          )
          .nullable(),
      },
      {
        name: 'ot',
        label: 'One Time',
        type: 'switch',
        defaultValue: oneTime ? 'true' : 'false',
        onChange: onOneTimeChange,
        validation: yup.boolean(),
      },
    ],
  },
  PAYOUT: {
    Payout_Request: [
      {
        name: 'code',
        label: 'Merchant',
        type: 'select',
        options: merchantOptions,
        validation: yup.string().required('Merchant is required'),
      },
      {
        name: 'user',
        label: 'User',
        type: 'text',
        placeholder: 'Enter User',
        validation: yup.string().required('User is required'),
      },
      ...(role && (role === Role.MERCHANT || role === Role.ADMIN)
        ? [
            {
              name: 'merchant_order_id',
              label: 'Merchant Order ID',
              type: 'text',
              width: '12',
              copy: true,
              placeholder: 'Enter Merchant Order ID',
              validation: yup
                .string()
                .max(40, 'Merchant Order ID must be at most 40 characters')
                .optional(),
            },
          ]
        : []),
      {
        name: 'amount',
        label: 'Amount',
        type: 'number',
        placeholder: 'Enter Amount',
        validation: yup.number().min(1).required('Amount is required'),
      },
      {
        name: 'bank_name',
        label: 'Bank Name',
        type: 'text',
        placeholder: 'Enter Bank Name',
        validation: yup.string().required('Bank Name is required'),
      },
      {
        name: 'acc_no',
        label: 'Number',
        type: 'text',
        width: '12',
        placeholder: 'Enter Account Number',
        validation: yup
          .string()
          .matches(
            /^[a-zA-Z0-9]+$/,
            'Account Number must contain only letters and numbers',
          )
          .required('Account Number is required'),
      },
      {
        name: 'acc_holder_name',
        label: 'Account Holder Name',
        type: 'text',
        placeholder: 'Enter Account Holder Name',
        validation: yup.string().required('Account Holder Name is required'),
      },
      {
        name: 'ifsc_code',
        label: 'IFSC Code',
        type: 'text',
        placeholder: 'Enter IFSC Code',
        validation: yup
          .string()
          .required('IFSC Code is required')
          .test('valid-ifsc', 'Invalid IFSC Code', async function (value) {
            if (!value) return false;
            const isValid = await debouncedValidateIfscCode(value);
            return isValid ?? false;
          }),
      },
    ],
  },
});

export const emailFormFields = {
  '': [
    {
      name: 'email',
      label: '',
      type: 'text',
      width: '12',
      placeholder: 'Enter Email',
      validation: yup
        .string()
        .email('Invalid Email')
        .required('Email is required'),
    },
    {
      name: 'contact_no',
      label: '',
      type: 'text',
      width: '12',
      placeholder: 'Enter Contact_No',
      validation: yup.string().required('Contact_No is required'),
    },
  ],
};

export const resetPayInFormFields = (
  bankOptions?: Option[],
  isDispute?: boolean,
) => ({
  RESET_BANK: {
    Reset_Bank: [
      {
        name: 'bank_id',
        label: 'Bank',
        type: 'select',
        width: '12',
        options: bankOptions,
        validation: yup.string().required('Bank is required'),
      },
    ],
  },
  RESET_DISPUTE: {
    Reset_Dispute: [
      {
        name: 'amount',
        label: 'Amount',
        type: 'number',
        width: '12',
        disable: true,
        placeholder: 'Enter Amount',
        validation: yup.number().min(1).required('Amount is required'),
      },
      ...(isDispute
        ? []
        : [
            {
              name: 'merchant_order_id',
              label: 'Merchant Order ID',
              type: 'text',
              width: '12',
              copy: true,
              placeholder: 'Enter Merchant Order ID',
              validation: yup.string().required('merchant order id'),
            },
          ]),
    ],
  },
});

export const approvePayOutFormFields = (
  bankOptions?: Option[],
  handleMethod?: (value: string) => void,
  selectedMethod?: string,
  availableBalance?: string,
  handleReason?: (value: string) => void,
  selectedReason?: string,
  payoutAmount?: number,
  allowPayAssist?: boolean,
  allowTataPay?: boolean,
  vendor_id?: string | null,
  allowClickrr?: boolean,
) => {
  const effectiveAllowPayAssist = vendor_id ? false : allowPayAssist;
  const effectiveAllowTataPay = vendor_id ? false : allowTataPay;
  const effectiveAllowClickrr = vendor_id ? false : allowClickrr;
  return {
    APPROVE_PAYOUT: {
      APPROVE_PAYOUT: [
        {
          name: 'method',
          value: selectedMethod || 'manual', // Fallback to default
          label: 'Method',
          width: '12',
          type: 'select',
          options: [
            { value: 'manual', label: 'Manual' },
            ...(effectiveAllowPayAssist
              ? [{ value: 'payassist', label: 'PayAssist' }]
              : []),
            ...(effectiveAllowTataPay
              ? [{ value: 'tatapay', label: 'TataPay' }]
              : []),
            ...(effectiveAllowClickrr
              ? [{ value: 'clickrr', label: 'Clickrr' }]
              : []),
          ],
          validation: yup.string().required('Method is required'),
          defaultValue: 'manual',
          onChange: (e: { target: { value: string } }) => {
            if (handleMethod) handleMethod(e.target.value);
          },
        },
        ...(selectedMethod === 'eko' ||
        selectedMethod === 'payassist' ||
        selectedMethod === 'tatapay' ||
        selectedMethod === 'clickrr'
          ? [
              {
                name: 'amount',
                label: 'Available Balance',
                type: 'number',
                disable: true,
                width: '12',
                placeholder: availableBalance,
                validation:
                  Number(availableBalance) >= Number(payoutAmount)
                    ? yup.string()
                    : yup
                        .string()
                        .test(
                          'sufficient-balance',
                          'Cannot approve this payout due to insufficient wallet balance.',
                          () => false,
                        ),
                ...(Number(availableBalance) < Number(payoutAmount) && {
                  helperText:
                    'Cannot approve this payout due to insufficient wallet balance.',
                  error: true,
                }),
              },
            ]
          : [
              {
                name: 'bank_acc_id',
                label: 'Bank',
                width: '12',
                type: 'select',
                options: bankOptions || [],
                validation: yup.string().required('Bank is required'),
              },
              {
                name: 'utr_id',
                label: 'UTR',
                type: 'text',
                width: '12',
                copy: true,
                placeholder: 'Enter UTR',
                validation: yup.string().required('UTR is required'),
              },
            ]),
      ],
    },
    REJECT_PAYOUT: {
      REJECT_PAYOUT: [
        {
          name: 'rejected_reason',
          value: selectedReason,
          label: 'Reason',
          width: '12',
          type: 'select',
          options: [
            {
              value: 'Invalid account details',
              label: 'Invalid account details',
            },
            { value: 'Insufficient funds', label: 'Insufficient funds' },
            { value: 'Amount reversal', label: 'Amount reversal' },
            { value: 'Server Unreachable', label: 'Server Unreachable' },
            { value: 'other', label: 'Other' },
          ],
          validation: yup.string().required('Reason is required'),
          defaultValue: 'Invalid account details',
          onChange: (e: { target: { value: string } }) => {
            if (handleReason) handleReason(e.target.value);
          },
        },
        ...(selectedReason === 'other'
          ? [
              //reason field getting empty when selecting reason details
              {
                name: 'reason_details',
                label: 'Reason Details',
                type: 'text',
                width: '12',
                placeholder: 'Enter Reason for rejection',
                validation: yup
                  .string()
                  .required('Reason details are required'),
              },
            ]
          : []),
      ],
    },
  };
};

export const getDataEntriesFormFields = (
  bankOptions?: Option[],
  disabled?: boolean,
  role?: string,
) => ({
  BANK_RESPONSE: {
    Add_Data: [
      {
        name: 'status',
        label: 'Status',
        type: 'text',
        value: 'Success',
        placeholder: 'SUCCESS',
        disable: disabled,
        validation: yup.string().optional(),
        width: '12',
      },
      {
        name: 'bank_acc_id',
        label: 'Bank',
        type: 'select',
        options: bankOptions,
        validation: yup.string().required('Bank is required'),
        width: '12',
      },
      {
        name: 'amount',
        label: 'Amount',
        type: 'text',
        placeholder: 'Enter Amount',
        validation: yup
          .string()
          .matches(/^\d+$/, 'Amount must be a valid number')
          .required('Amount is required')
          .test('min', 'Amount must be at least 1', (val) => Number(val) >= 1)
          .test(
            'max',
            'Amount cannot exceed 500,000',
            (val) => Number(val) <= 500000,
          ),
        width: '12',
      },
      ...(role && role === Role.ADMIN
        ? [
            {
              name: 'upi_short_code',
              label: 'Amount Code',
              type: 'text',
              placeholder: 'Enter Amount Code',
              validation: yup.string(),
            },
          ]
        : []),
      ...(role && role === Role.ADMIN
        ? [
            {
              name: 'utr',
              label: 'UTR',
              type: 'text',
              copy: true,
              placeholder: 'Enter UTR',
              validation: yup.string().required('UTR is required'),
            },
          ]
        : [
            {
              name: 'utr',
              label: 'UTR',
              type: 'text',
              copy: true,
              width: '12',
              placeholder: 'Enter UTR',
              validation: yup.string().required('UTR is required'),
            },
          ]),
    ],
  },
  RESET_ENTRY: {
    Reset_Data: [
      {
        name: 'merchant_order_id',
        label: 'Merchant Order ID',
        type: 'text',
        copy: true,
        placeholder: 'Enter Merchant Order ID',
        validation: yup.string().required('Merchant Order ID is required'),
        width: '12',
      },
    ],
  },
  CHECK_UTR: {
    Check_Utr: [
      {
        name: 'merchant_order_id',
        label: 'Merchant Order ID',
        type: 'text',
        copy: true,
        placeholder: 'Enter Merchant Order ID',
        validation: yup.string().required('Merchant Order ID is required'),
        width: '12',
      },
      {
        name: 'utr',
        label: 'UTR',
        type: 'text',
        copy: true,
        placeholder: 'Enter UTR',
        width: '12',
        validation: yup.string().required('UTR is required'),
      },
    ],
  },
});

export const ChargeBacksFormFields = {
  Details: [
    {
      name: 'merchant_order_id',
      label: 'Merchant Order ID',
      type: 'text',
      width: '12',
      copy: true,
      placeholder: 'Enter Merchant Order ID',
      validation: yup.string().required('Merchant Order ID is required'),
    },
    {
      name: 'reference_date',
      label: 'Date',
      type: 'datepicker',
      single: true,
      placeholder: 'Select Date',
      validation: yup.date().required('Date is required'),
    },
    {
      name: 'amount',
      label: 'Amount',
      type: 'number',
      placeholder: 'Enter Amount',
      validation: yup
        .number()
        .typeError('Amount must be a number')
        .positive('Amount must be positive')
        .required('Amount is required'),
    },
  ],
};

export const EditChargeBacksFields = {
  '': [
    {
      name: 'amount',
      label: 'Amount',
      type: 'number',
      width: '12',
      placeholder: 'Enter amount',
      validation: yup.number().min(1),
    },
  ],
};

export const addMerchantsForBank = (userOptions: Option[]) => ({
  Assign_Merchant: [
    {
      name: 'merchant_user_id',
      label: '',
      type: 'select',
      width: '12',
      options: userOptions,
      validation: yup.string().required('User selection is required'),
    },
  ],
});

interface ResetAddDataOptions {
  isUpdating?: boolean;
  editingField?: 'utr' | 'amount' | 'bank_id' | null;
  isFieldBeingEdited?: boolean;
}

export const resetAddData = (
  bankOptions: Option[],
  options: ResetAddDataOptions = {},
) => {
  const {
    isUpdating = false,
    editingField = null,
    isFieldBeingEdited = false,
  } = options;

  // If no field is specified, return empty
  if (!editingField) {
    return { UTR_Reset: [] };
  }

  // Only return the field that's being edited
  const getFieldConfig = (fieldName: 'utr' | 'amount' | 'bank_id') => {
    const baseConfig = {
      width: '12',
      disabled: isUpdating || isFieldBeingEdited, // Disable during API calls OR when any field is being edited
    };

    switch (fieldName) {
      case 'utr':
        return {
          ...baseConfig,
          name: 'utr',
          label: 'UTR',
          type: 'text',
          validation: yup.string().required('UTR is required'),
        };
      case 'amount':
        return {
          ...baseConfig,
          name: 'amount',
          label: 'Amount',
          type: 'number',
          validation: yup.number().min(1).nullable(),
        };
      case 'bank_id':
        return {
          ...baseConfig,
          name: 'bank_id',
          label: 'Bank',
          type: 'select',
          options: bankOptions,
          validation: yup.string().required('Bank selection is required'),
        };
      default:
        return null;
    }
  };

  const fieldConfig = getFieldConfig(editingField);

  return {
    UTR_Reset: fieldConfig ? [fieldConfig] : [],
  };
};

export const addVendorForBank = (vendorOptions: Option[]) => ({
  Add_Vendors: [
    {
      name: 'verdor_user_id',
      label: 'Vendor Code',
      type: 'select',
      width: '12',
      options: vendorOptions,
      validation: yup.string().required('User selection is required'),
    },
  ],
});

export const addBatchVendors = {
  Withdraw: [
    {
      name: 'amount',
      label: 'Amount',
      type: 'number',
      placeholder: 'Enter Amount',
      disable: true,
      width: '12',
      validation: yup.string().required('amount is required'),
    },
    {
      name: 'TransactionType',
      label: 'Transaction Type',
      type: 'select',
      width: '12',
      options: [
        { value: 'IMPS', label: 'IMPS' },
        { value: 'NEFT', label: 'NEFT' },
      ],
      validation: yup.string().required('Transaction Type is required'),
    },
  ],
};

interface EditAmountOrUTROptions {
  isUpdating?: boolean;
  editingField?: 'amount' | 'utr' | 'utr_id' | 'bank_acc_id' | null;
  isFieldBeingEdited?: boolean;
  bankOptions?: Option[];
}

export const EditAmountOrUTR = (
  type: string,
  options: EditAmountOrUTROptions = {},
) => {
  const {
    isUpdating = false,
    editingField = null,
    isFieldBeingEdited = false,
    bankOptions = [],
  } = options;

  // If no field is specified for multi-field editing, return original single-field behavior
  if (!editingField) {
    if (type === 'amount') {
      return {
        Edit_Amount: [
          {
            name: 'amount',
            label: 'Amount',
            type: 'number',
            width: '12',
            disabled: isUpdating || isFieldBeingEdited,
            validation: yup
              .number()
              .nullable()
              .when('amount', {
                is: (value: any) =>
                  value !== undefined && value !== null && value !== '',
                then: (schema) =>
                  schema
                    .min(0, 'Amount must be positive')
                    .max(50000000, 'Amount cannot exceed 5 crore'),
                otherwise: (schema) => schema.nullable(),
              }),
          },
        ],
      };
    } else if (type === 'utr_id') {
      return {
        Edit_UTR: [
          {
            name: 'utr_id',
            label: 'UTR',
            type: 'text',
            width: '12',
            disabled: isUpdating || isFieldBeingEdited,
            validation: yup.string().required('UTR is required'),
          },
        ],
      };
    } else {
      return {
        Edit_UTR: [
          {
            name: 'utr',
            label: 'UTR',
            type: 'text',
            width: '12',
            disabled: isUpdating || isFieldBeingEdited,
            validation: yup.string().required('UTR is required'),
          },
        ],
      };
    }
  }

  // Multi-field editing logic - only return the field being edited
  const getFieldConfig = (
    fieldName: 'amount' | 'utr' | 'utr_id' | 'bank_acc_id',
  ) => {
    const baseConfig = {
      width: '12',
      disabled: isUpdating || isFieldBeingEdited, // Disable during API calls OR when any field is being edited
    };

    switch (fieldName) {
      case 'amount':
        return {
          ...baseConfig,
          name: 'amount',
          label: 'Amount',
          type: 'number',
          validation: yup
            .number()
            .nullable()
            .when('amount', {
              is: (value: any) =>
                value !== undefined && value !== null && value !== '',
              then: (schema) =>
                schema
                  .min(0, 'Amount must be positive')
                  .max(50000000, 'Amount cannot exceed 5 crore'),
              otherwise: (schema) => schema.nullable(),
            }),
        };
      case 'utr':
        return {
          ...baseConfig,
          name: 'utr',
          label: 'UTR',
          type: 'text',
          validation: yup.string().required('UTR is required'),
        };
      case 'utr_id':
        return {
          ...baseConfig,
          name: 'utr_id',
          label: 'UTR',
          type: 'text',
          validation: yup.string().required('UTR is required'),
        };
      case 'bank_acc_id':
        return {
          ...baseConfig,
          name: 'bank_acc_id',
          label: 'Bank',
          type: 'select',
          options: bankOptions,
          validation: yup.string().required('Bank is required'),
        };
      default:
        return null;
    }
  };

  const fieldConfig = getFieldConfig(editingField);
  const sectionName =
    editingField === 'amount'
      ? 'Edit_Amount'
      : editingField === 'bank_acc_id'
      ? 'Edit_Bank'
      : 'Edit_UTR';

  return {
    [sectionName]: fieldConfig ? [fieldConfig] : [],
  };
};

export const SettlementFormFields = (userOptions: Option[]) => ({
  'Add Settlement': [
    {
      name: 'code',
      label: 'Code',
      type: 'select',
      placeholder: 'Enter your Code',
      options: userOptions,
      validation: yup.mixed(),
      width: '12',
    },
    {
      name: 'amount',
      label: 'Amount',
      type: 'number',
      placeholder: 'Enter your Amount',
      validation: yup.number().min(1).required('Amount is required'),
      width: '12',
    },
    {
      name: 'method',
      label: 'Method',
      type: 'text',
      placeholder: 'Enter your Method',
      validation: yup.string().required('Method is required'),
      width: '12',
    },
  ],
});

export const BankDetailsFormFields = (
  userOptions: Option[],
  selectedMethod?: string,
  role?: string,
  designation?: string,
  isEditMode?: boolean,
  disabled = false,
) => ({
  ...(() => {
    let details = [];
    if (
      [Role.TRANSACTIONS, Role.OPERATIONS].includes(designation || '') &&
      isEditMode
    ) {
      details.push(
        {
          name: 'upi_id',
          label: 'UPI ID',
          type: 'text',
          placeholder: 'Enter UPI ID',
          validation: yup.string().optional(),
        },
        {
          name: 'nick_name',
          label: 'Nick Name',
          type: 'text',
          placeholder: 'Enter Bank Nickname',
          validation: yup.string().required('Nickname is required'),
        },
        {
          name: 'bank_name',
          label: 'Name',
          type: 'text',
          placeholder: 'Enter Bank Name',
          validation: yup.string().required('Bank Name is required'),
        },
        {
          name: 'acc_holder_name',
          label: 'Holder Name',
          type: 'text',
          placeholder: 'Acc Holder Name',
          validation: yup.string().required('Account Holder Name is required'),
        },
      );
    } else {
      details = [
        {
          name: 'nick_name',
          label: 'Nick Name',
          type: 'text',
          placeholder: 'Enter Bank Nickname',
          validation: yup.string().required('Nickname is required'),
        },
        {
          name: 'bank_name',
          label: 'Name',
          type: 'text',
          placeholder: 'Enter Bank Name',
          validation: yup.string().required('Bank Name is required'),
        },
        {
          name: 'acc_holder_name',
          label: 'Holder Name',
          type: 'text',
          placeholder: 'Acc Holder Name',
          validation: yup.string().required('Account Holder Name is required'),
        },
        {
          name: 'upi_id',
          label: 'UPI ID',
          type: 'text',
          placeholder: 'Enter UPI ID',
          validation: yup.string().optional(),
        },
        {
          name: 'acc_no',
          label: 'Account Number',
          type: 'text',
          width: '12',
          placeholder: 'Enter Account Number',
          validation: yup
            .string()
            .matches(
              /^[a-zA-Z0-9]+$/,
              'Account Number must contain only letters and numbers',
            )
            .required('Account Number is required'),
        },
        ...(role && role !== Role.SUB_VENDOR
          ? [
              {
                name: 'ifsc',
                label: 'IFSC',
                type: 'text',
                placeholder: 'Enter IFSC Code',
                validation: yup
                  .string()
                  .required('IFSC Code is required')
                  .test(
                    'valid-ifsc',
                    'Invalid IFSC Code',
                    async function (value) {
                      if (!value) return false;
                      const isValid = await debouncedValidateIfscCode(value);
                      return isValid ?? false;
                    },
                  ),
              },
              ...(userOptions && userOptions.length > 0
                ? [
                    {
                      name: 'user_id',
                      label: 'User',
                      type: 'select',
                      options: userOptions,
                      validation: yup
                        .string()
                        .required('User selection is required'),
                      disabled: disabled,
                    },
                  ]
                : []),
            ]
          : []),
        ...(role === Role.VENDOR
          ? [
              {
                name: 'min',
                label: 'Min',
                type: 'number',
                placeholder: 'Enter Min limit',
                validation: yup
                  .number()
                  .min(1)
                  .required('Min PayIn is required'),
              },
              {
                name: 'max',
                label: 'Max',
                type: 'number',
                placeholder: 'Enter Max limit',
                validation: yup
                  .number()
                  .min(1)
                  .required('Max PayIn is required'),
              },
            ]
          : []),
        ...(role === Role.SUB_VENDOR
          ? [
              {
                name: 'ifsc',
                label: 'IFSC',
                type: 'text',
                placeholder: 'Enter IFSC Code',
                width: '12',
                validation: yup
                  .string()
                  .required('IFSC Code is required')
                  .test(
                    'valid-ifsc',
                    'Invalid IFSC Code',
                    async function (value) {
                      if (!value) return false;
                      const isValid = await debouncedValidateIfscCode(value);
                      return isValid ?? false;
                    },
                  ),
              },
              {
                name: 'min',
                label: 'Min',
                type: 'number',
                placeholder: 'Enter Min limit',
                validation: yup
                  .number()
                  .min(1)
                  .required('Min PayIn is required'),
              },
              {
                name: 'max',
                label: 'Max',
                type: 'number',
                placeholder: 'Enter Max limit',
                validation: yup
                  .number()
                  .min(1)
                  .required('Max PayIn is required'),
              },
            ]
          : []),
      ];
    }

    const result: Record<string, any> = {
      Details: details,
    };

    if (
      designation === Role.ADMIN ||
      ([Role.TRANSACTIONS, Role.OPERATIONS].includes(designation || '') &&
        !isEditMode)
    ) {
      result.Limits = [
        {
          name: 'min',
          label: 'Min',
          type: 'number',
          placeholder: 'Enter Min limit',
          validation: yup.number().min(1).required('Min PayIn is required'),
        },
        {
          name: 'max',
          label: 'Max',
          type: 'number',
          placeholder: 'Enter Max limit',
          validation: yup.number().min(1).required('Max PayIn is required'),
        },
      ];
    }

    if (
      selectedMethod === 'PayIn' &&
      (designation === Role.ADMIN ||
        ([Role.TRANSACTIONS, Role.OPERATIONS].includes(designation || '') &&
          !isEditMode))
    ) {
      result.Options = [
        {
          name: 'is_intent',
          label: 'Intent',
          type: 'switch',
          validation: yup.boolean(),
        },
        {
          name: 'is_qr',
          label: 'QR?',
          type: 'switch',
          validation: yup.boolean(),
        },
        {
          name: 'is_bank',
          label: 'Bank?',
          type: 'switch',
          validation: yup.boolean(),
        },
        {
          name: 'is_phonepay',
          label: 'PhonePay?',
          type: 'switch',
          validation: yup.boolean(),
        },
        {
          name: 'is_staticQR',
          label: 'Static QR?',
          type: 'switch',
          validation: yup.boolean(),
        },
      ];
    }

    return result;
  })(),
});

export const BeneficiaryAccountsFormFields = (
  userOptions: Option[],
  role: string,
  typeOptions: Option[],
  isEditMode = false,
  handleUserChange: (event: string) => void,
  user: any,
) => ({
  MERCHANT_BENEF: {
    MERCHANT_BENEFICIARY: [
      {
        name: 'bank_name',
        label: 'Name',
        type: 'text',
        placeholder: 'Enter Bank Name',
        validation: yup.string().required('Bank Name is required'),
      },
      {
        name: 'acc_holder_name',
        label: 'Account Holder Name',
        type: 'text',
        placeholder: 'Acc Holder Name',
        validation: yup.string().required('Account Holder Name is required'),
      },
      {
        name: 'acc_no',
        label: 'Account Number',
        type: 'text',
        width: '12',
        placeholder: 'Enter Account Number',
        validation: yup
          .string()
          .matches(
            /^[a-zA-Z0-9]+$/,
            'Account Number must contain only letters and numbers',
          )
          .required('Account Number is required'),
      },
      {
        name: 'upi_id',
        label: 'UPI ID',
        type: 'text',
        placeholder: 'Enter UPI ID',
        validation: yup.string().optional(),
      },
      {
        name: 'ifsc',
        label: 'IFSC',
        type: 'text',
        placeholder: 'Enter IFSC Code',
        validation: yup
          .string()
          .required('IFSC Code is required')
          .test('valid-ifsc', 'Invalid IFSC Code', async (value) => {
            if (!value) return false;
            const isValid = await debouncedValidateIfscCode(value);
            return isValid ?? false;
          }),
      },
      ...(role !== Role.MERCHANT && !isEditMode
        ? [
            {
              name: 'user_id',
              label: 'User',
              type: 'select',
              options: userOptions,
              validation: yup.string().required('User is required'),
            },
          ]
        : []),
    ],
  },
  VENDOR_BENEF: {
    VENDOR_BENEFICIARY: [
      {
        name: 'bank_name',
        label: 'Name',
        type: 'text',
        placeholder: 'Enter Bank Name',
        validation: yup.string().required('Bank Name is required'),
      },
      {
        name: 'acc_holder_name',
        label: 'Account Holder Name',
        type: 'text',
        placeholder: 'Acc Holder Name',
        validation: yup.string().required('Account Holder Name is required'),
      },
      {
        name: 'acc_no',
        label: 'Account Number',
        type: 'text',
        width: '12',
        placeholder: 'Enter Account Number',
        validation: yup
          .string()
          .matches(
            /^[a-zA-Z0-9]+$/,
            'Account Number must contain only letters and numbers',
          )
          .required('Account Number is required'),
      },
      {
        name: 'upi_id',
        label: 'UPI ID',
        type: 'text',
        placeholder: 'Enter UPI ID',
        validation: yup.string().optional(),
      },
      {
        name: 'ifsc',
        label: 'IFSC',
        type: 'text',
        placeholder: 'Enter IFSC Code',
        validation: yup
          .string()
          .required('IFSC Code is required')
          .test('valid-ifsc', 'Invalid IFSC Code', async (value) => {
            if (!value) return false;
            const isValid = await debouncedValidateIfscCode(value);
            return isValid ?? false;
          }),
      },
      ...(!isEditMode
        ? [
            {
              name: 'user_id',
              label: 'User',
              type: 'select',
              options: userOptions,
              onChange: (e: string) => handleUserChange(e),
              validation: yup.string(),
            },
          ]
        : []),
      ...(user === null && role !== Role.VENDOR && !isEditMode
        ? [
            {
              name: isEditMode ? 'config_type' : 'type',
              label: 'Type',
              type: 'select',
              options: typeOptions,
              placeholder: 'Enter Bank Type',
              validation: yup.string().optional(),
            },
            {
              name: isEditMode ? 'config_initial_balance' : 'initial_balance',
              label: 'Initial Balance',
              type: 'number',
              disable: isEditMode,
              placeholder: 'Enter Initial Balance',
              validation: yup.number(),
            },
          ]
        : []),
    ],
  },
});

export const getUserFormFields = (
  designationOptions: Option[],
  roleOptions: Option[],
  VendorOptions: Option[],
  merchantOptions: Option[],
  handleRoleChange: (event: string) => void,
  handleDesignationChange: (event: string) => void,
  handleParentChange: (event: string) => void,
) => ({
  User_Details: [
    {
      name: 'first_name',
      label: 'First Name',
      type: 'text',
      placeholder: 'Enter First Name',
      validation: yup.string().required('First Name is required'),
    },
    {
      name: 'last_name',
      label: 'Last Name',
      type: 'text',
      placeholder: 'Enter Last Name',
      validation: yup.string().required('Last Name is required'),
    },
    {
      name: 'user_name',
      label: 'Username',
      type: 'text',
      placeholder: 'Enter Username',
      validation: yup.string().required('Username is required'),
    },
    {
      name: 'email',
      label: 'Email',
      type: 'text',
      placeholder: 'Enter Email',
      validation: yup
        .string()
        .email('Invalid Email')
        .required('Email is required'),
    },
    {
      name: 'contact_no',
      label: 'Contact Number',
      type: 'text',
      placeholder: 'Enter Contact Number',
      validation: yup
        .string()
        .matches(/^\d{10}$|^\d{12}$/, 'Number must be exactly 10 or 15 digits')
        .required('Contact number is required'),
    },
  ],
  User_Info: (role: string) => [
    {
      name: 'role_id',
      label: 'Role',
      type: 'select',
      options: roleOptions,
      placeholder: 'Enter Role',
      onChange: (e: string) => handleRoleChange(e),
      validation: yup.string().required('Role is required'),
    },
    {
      name: 'designation_id',
      label: 'Designation',
      type: 'select',
      options: designationOptions,
      placeholder: 'Enter Designation',
      onChange: (e: string) => handleDesignationChange(e),
      validation: yup.string().required('Designation is required'),
    },
    // {
    //   name: 'password',
    //   label: 'Password',
    //   type: 'password',
    //   placeholder: 'Enter Password',
    //   validation: yup
    //     .string()
    //     .min(5, 'Password must be at least 5 characters')
    //     .required('Password is required'),
    // },
    ...(role &&
    [
      Role.MERCHANT,
      Role.SUB_MERCHANT,
      Role.VENDOR,
      Role.SUB_VENDOR,
      Role.VENDOR_ADMIN,
    ].includes(role)
      ? [
          ...(role && [Role.VENDOR, Role.SUB_VENDOR].includes(role)
            ? [
                {
                  name: 'net_balance',
                  label: 'Net Balance',
                  type: 'text',
                  validation: yup
                    .string()
                    .nullable()
                    .transform((value) => {
                      // Transform '0' and empty strings to null
                      if (value === '0' || value === '') {
                        return null;
                      }
                      return value;
                    })
                    .test(
                      'is-positive-when-present',
                      'Net Balance must be positive',
                      function (value) {
                        // If null (transformed from '0' or ''), pass validation
                        if (value === null || value === undefined) {
                          return true;
                        }
                        // Otherwise, must be a positive number
                        const num = Number(value);
                        return !isNaN(num) && num > 0;
                      },
                    )
                    .optional(),
                },
              ]
            : []),
          {
            name: 'code',
            label: 'Code',
            type: 'text',
            placeholder: 'Enter Code',
            validation: yup.string().required('Code is required'),
          },
        ]
      : []),
  ],
  More_Details: (
    role: string,
    loggedInRole: string,
    maxPayInCommission: number,
    maxPayOutCommission: number,
  ) =>
    role && [Role.MERCHANT, Role.SUB_MERCHANT].includes(role)
      ? [
          ...(role !== Role.MERCHANT && loggedInRole !== Role.MERCHANT
            ? [
                {
                  name: 'parent_id',
                  label: 'Assign To',
                  type: 'select',
                  options: merchantOptions,
                  placeholder: 'Enter Merchant',
                  onChange: (e: string) => handleParentChange(e),
                  validation: yup.string().required('Merchant is required'),
                  width: '12',
                },
              ]
            : []),
          {
            name: 'min_payin',
            label: 'Min PayIn',
            type: 'number',
            placeholder: 'Enter Min PayIn',
            //type error
            validation: yup
              .number()
              .min(1)
              .typeError('Min PayIn must be a valid number')
              .required('Max PayIn is required'),
          },
          {
            name: 'max_payin',
            label: 'Max PayIn',
            type: 'number',
            placeholder: 'Enter Max PayIn',
            validation: yup
              .number()
              .min(1)
              .typeError('Max PayIn must be a valid number')
              .required('Max PayIn is required'),
          },
          {
            name: 'payin_commission',
            label: 'payIn Commission',
            type: 'number',
            placeholder: 'Enter payIn Commission',
            validation: yup
              .number()
              .min(maxPayInCommission)
              .max(100, 'Commission cannot exceed 100')
              .typeError('PayIn Commission must be a valid number')
              .required('payIn Commission is required'),
          },
          {
            name: 'payout_commission',
            label: 'Payout Commission',
            type: 'number',
            placeholder: 'Enter Payout Commission',
            validation: yup
              .number()
              .min(maxPayOutCommission)
              .max(100, 'Commission cannot exceed 100')
              .typeError('PayOut Commission must be a valid number')
              .required('Payout Commission is required'),
          },
          {
            name: 'min_payout',
            label: 'Min Payout',
            type: 'number',
            placeholder: 'Enter Min Payout',
            validation: yup
              .number()
              .min(1)
              .typeError('Min PayOut must be a valid number')
              .required('Min Payout is required'),
          },
          {
            name: 'max_payout',
            label: 'Max Payout',
            type: 'number',
            placeholder: 'Enter Max Payout',
            validation: yup
              .number()
              .min(1)
              .typeError('Max PayOut must be a valid number')
              .required('Max payout number is required'),
          },
          {
            name: 'whitelist_ips',
            label: 'Whitelist IPs',
            type: 'text',
            // width: '12',
            placeholder:
              'Enter IP addresses (comma separated) for whitelisting',
            validation: yup.string(),
          },
          ...(role === Role.MERCHANT
            ? [
                {
                  name: 'is_h2h',
                  label: 'Host To Host',
                  type: 'switch',
                  validation: yup.boolean(),
                },
              ]
            : []),
          {
            name: 'site',
            label: 'Site',
            type: 'text',
            width: '12',
            prefix: true,
            placeholder: 'example.com',
            validation: yup
              .string()
              .url('Invalid URL')
              .required('Site URL is required'),
          },
          {
            name: 'return',
            label: 'Return',
            type: 'text',
            width: '12',
            prefix: true,
            placeholder: 'example.com',
            validation: yup
              .string()
              .url('Invalid URL')
              .required('Return URL is required'),
          },
          {
            name: 'payin_notify',
            label: 'Callback',
            type: 'text',
            width: '12',
            prefix: true,
            placeholder: 'example.com',
            validation: yup
              .string()
              .url('Invalid URL')
              .required('Callback URL is required'),
          },
          {
            name: 'payout_notify',
            label: 'PayOut Callback',
            type: 'text',
            width: '12',
            prefix: true,
            placeholder: 'example.com',
            validation: yup
              .string()
              .url('Invalid URL')
              .required('PayOut Callback URL is required'),
          },
        ]
      : role && [Role.VENDOR, Role.SUB_VENDOR].includes(role)
      ? [
          ...(role !== Role.VENDOR && loggedInRole !== Role.VENDOR
            ? [
                {
                  name: 'parent_id',
                  label: 'Assign To',
                  type: 'select',
                  options: VendorOptions,
                  placeholder: 'Enter Vendor',
                  onChange: (e: string) => handleParentChange(e),
                  validation: yup.string().required('Vendor is required'),
                },
              ]
            : []),
          ...(role === Role.SUB_VENDOR
            ? [
                {
                  name: 'is_owned',
                  label: 'Own',
                  type: 'switch',
                  validation: yup.boolean(),
                },
              ]
            : []),
          {
            name: 'payin_commission',
            label: 'payIn Commission',
            type: 'number',
            placeholder: 'Enter payIn Commission',
            validation: yup
              .number()
              .min(0)
              .max(100)
              .typeError('PayIn Commission must be a valid number')
              .test(
                'is-decimal',
                'PayIn Commission can include decimal values',
                (value) => value === undefined || !isNaN(value),
              )
              .required('payIn Commission is required'),
          },
          {
            name: 'payout_commission',
            label: 'Payout Commission',
            type: 'number',
            placeholder: 'Enter Payout Commission',
            validation: yup
              .number()
              .min(0)
              .max(100)
              .typeError('Payout Commission must be a valid number')
              .test(
                'is-decimal',
                'Payout Commission can include decimal values',
                (value) => value === undefined || !isNaN(value),
              )
              .required('Payout Commission is required'),
          },
          ...(role && [Role.SUB_VENDOR].includes(role)
            ? [
                {
                  name: 'mediator_payin_commission',
                  label: 'Mediator PayIn Commission',
                  type: 'number',
                  placeholder: 'Enter PayIn Commission (0 - 5)',
                  validation: yup
                    .number()
                    .min(0, 'Commission cannot be negative')
                    .max(5, 'Commission cannot exceed 5')
                    .typeError('PayIn Commission must be a valid number')
                    .required('PayIn Commission is required'),
                },
                {
                  name: 'mediator_payout_commission',
                  label: 'Mediator Payout Commission',
                  type: 'number',
                  placeholder: 'Enter Payout Commission (0 - 5)',
                  validation: yup
                    .number()
                    .min(0, 'Commission cannot be negative')
                    .max(5, 'Commission cannot exceed 5')
                    .typeError('Payout Commission must be a valid number')
                    .required('Payout Commission is required'),
                },
              ]
            : []),
        ]
      : role && [Role.MERCHANT_OPERATIONS].includes(role)
      ? [
          {
            name: 'parent_id',
            label: 'Assign To',
            type: 'select',
            options: merchantOptions,
            placeholder: 'Enter Merchant',
            validation: yup.string().required('Merchant is required'),
            width: '12',
          },
        ]
      : role &&
        [Role.VENDOR_OPERATIONS].includes(role) &&
        loggedInRole !== Role.VENDOR
      ? [
          {
            name: 'parent_id',
            label: 'Assign To',
            type: 'select',
            options: VendorOptions,
            placeholder: 'Enter Vendor',
            validation: yup.string().required('Vendor is required'),
            width: '12',
          },
        ]
      : [],
  // : role === Role.VENDOR_ADMIN
  // ? [
  //     {
  //       name: 'payin_commission',
  //       label: 'PayIn Commission',
  //       type: 'number',
  //       placeholder: 'Enter PayIn Commission (0 - 5)',
  //       validation: yup
  //         .number()
  //         .min(0, 'Commission cannot be negative')
  //         .max(5, 'Commission cannot exceed 5')
  //         .typeError('PayIn Commission must be a valid number')
  //         .required('PayIn Commission is required'),
  //     },
  //     {
  //       name: 'payout_commission',
  //       label: 'Payout Commission',
  //       type: 'number',
  //       placeholder: 'Enter Payout Commission (0 - 5)',
  //       validation: yup
  //         .number()
  //         .min(0, 'Commission cannot be negative')
  //         .max(5, 'Commission cannot exceed 5')
  //         .typeError('Payout Commission must be a valid number')
  //         .required('Payout Commission is required'),
  //     },
  //   ]
  // : [],
});

export const MerchantformFields = (disabled: boolean) => ({
  Code: [
    {
      name: 'code',
      label: '',
      type: 'text',
      placeholder: 'Enter Merchant Code',
      validation: yup.string().required('Code is required'),
      width: '12',
      disable: disabled,
    },
  ],
  URLs: [
    {
      name: 'site',
      label: 'Site',
      type: 'text',
      placeholder: 'Enter Site URL',
      validation: yup
        .string()
        .url('Invalid URL')
        .required('Site URL is required'),
    },
    {
      name: 'return',
      label: 'Return',
      type: 'text',
      placeholder: 'Enter Return URL',
      validation: yup
        .string()
        .url('Invalid URL')
        .required('Return URL is required'),
    },
    {
      name: 'payin_notify',
      label: 'Callback',
      type: 'text',
      placeholder: 'Enter Callback URL',
      validation: yup
        .string()
        .url('Invalid URL')
        .required('Callback URL is required'),
    },
    {
      name: 'payout_notify',
      label: 'PayOut Callback',
      type: 'text',
      placeholder: 'Enter PayOut Callback URL',
      validation: yup
        .string()
        .url('Invalid URL')
        .required('PayOut Callback URL is required'),
    },
    {
      name: 'whitelist_ips',
      label: 'Whitelist IPs',
      type: 'text',
      width: '12',
      placeholder: 'Enter IP addresses (comma separated) for whitelisting',
      validation: yup.string(),
    },
  ],
  PayIn: [
    {
      name: 'min_payin',
      label: 'Min',
      type: 'number',
      placeholder: 'Enter Min PayIn',
      validation: yup
        .number()
        .min(0, 'Must be a positive number')
        .required('Min PayIn is required'),
    },
    {
      name: 'max_payin',
      label: 'Max',
      type: 'number',
      placeholder: 'Enter Max PayIn',
      validation: yup
        .number()
        .min(0, 'Must be a positive number')
        .required('Max PayIn is required'),
    },
    {
      name: 'payin_commission',
      label: 'Commission',
      type: 'number',
      placeholder: 'Enter PayIn Commission',
      validation: yup
        .number()
        .min(0, 'Must be a positive number')
        .max(100, 'Commissiion cannot exceed 100')
        .required('PayIn Commission is required'),
      width: '12',
    },
  ],
  PayOut: [
    {
      name: 'min_payout',
      label: 'Min',
      type: 'number',
      placeholder: 'Enter Min PayOut',
      validation: yup
        .number()
        .min(0, 'Must be a positive number')
        .required('Min PayOut is required'),
    },
    {
      name: 'max_payout',
      label: 'Max',
      type: 'number',
      placeholder: 'Enter Max PayOut',
      validation: yup
        .number()
        .min(0, 'Must be a positive number')
        .required('Max PayOut is required'),
    },
    {
      name: 'payout_commission',
      label: 'Commission',
      type: 'number',
      placeholder: 'Enter PayOut Commission',
      validation: yup
        .number()
        .min(0, 'Must be a positive number')
        .max(100, 'Commissiion cannot exceed 100')
        .required('Payout Commission is required'),
      width: '12',
    },
    {
      name: 'clickrr_auto_approval_limit',
      label: 'Clickkr auto approval limit',
      type: 'number',
      placeholder: 'Enter Clickkr Limit',
      validation: yup.number().optional(),
      width: '12',
    },
  ],
  '': [
    {
      name: 'is_enabled',
      label: 'Enabled',
      type: 'switch',
      validation: yup.boolean(),
    },
    {
      name: 'allow_intent',
      label: 'Allow Intent',
      type: 'switch',
      validation: yup.boolean(),
    },
    {
      name: 'allow_clickrr',
      label: 'Clickrr Auto Payout',
      type: 'switch',
      validation: yup.boolean(),
    },
    {
      name: 'allow_payout',
      label: 'Allow PayOut',
      type: 'switch',
      validation: yup.boolean(),
    },
    {
      name: 'dispute_enabled',
      label: 'Allow Dispute',
      type: 'switch',
      validation: yup.boolean(),
    },
  ],
});

export const VendorformFields = (
  disabled: boolean,
  role?: string,
  isEditFromExpandedRow?: boolean,
  loggedInRole?: string,
) => ({
  Personal: [
    {
      name: 'full_name',
      label: 'Full Name',
      type: 'text',
      placeholder: 'Enter your last name',
      validation: yup.string().required('Last Name is required'),
      disable: disabled,
    },
    {
      name: 'code',
      label: 'Code',
      type: 'text',
      placeholder: 'Enter Code',
      validation: yup.string().required('Code is required'),
      disable: disabled,
    },
    ...(disabled
      ? [
          ...(role !== Role.VENDOR_ADMIN || loggedInRole !== Role.ADMIN
            ? [
                {
                  name: 'net_balance',
                  label: 'Net Balance Limit',
                  type: 'text',
                  validation: yup
                    .string()
                    .nullable()
                    .transform((value) => {
                      // Transform '0' and empty strings to null
                      if (value === '0' || value === '') {
                        return null;
                      }
                      return value;
                    })
                    .test(
                      'is-positive-when-present',
                      'Net Balance must be positive',
                      function (value) {
                        // If null (transformed from '0' or ''), pass validation
                        if (value === null || value === undefined) {
                          return true;
                        }
                        // Otherwise, must be a positive number
                        const num = Number(value);
                        return !isNaN(num) && num > 0;
                      },
                    )
                    .optional(),
                },
              ]
            : []),
          {
            name: 'bank_response_access',
            label: 'Allow Bank Response',
            type: 'switch',
            validation: yup.boolean(),
          },
        {
          name: 'is_enabled',
          label: 'Enabled',
          type: 'switch',
          validation: yup.boolean(),
        },
          ...(role === Role.SUB_VENDOR && isEditFromExpandedRow
            ? [
                {
                  name: 'is_owned',
                  label: 'Own',
                  type: 'switch',
                  validation: yup.boolean().nullable().optional(),
                },
              ]
            : []),
        ]
      : []),
  ],
  ...(role === Role.VENDOR || role === Role.SUB_VENDOR
    ? {
        Commissions: [
          {
            name: 'payin_commission',
            label: 'Pay in Commission',
            type: 'number',
            placeholder: 'Pay in Commission',
            validation: yup
              .number()
              .min(0)
              .max(100, 'commission cannot exceed 100')
              .required('Payin com. is required'),
          },
          {
            name: 'payout_commission',
            label: 'Pay out Commission',
            type: 'number',
            placeholder: 'Pay out Commission',
            validation: yup
              .number()
              .min(0)
              .max(100, 'commission cannot exceed 100')
              .required('Payout com. is required'),
          },
          ...(role === Role.SUB_VENDOR && isEditFromExpandedRow
            ? [
                {
                  name: 'mediator_payin_commission',
                  label: 'Mediator PayIn Commission',
                  type: 'number',
                  placeholder: 'Enter PayIn Commission (0 - 5)',
                  validation: yup
                    .number()
                    .min(0, 'Commission cannot be negative')
                    .max(5, 'Commission cannot exceed 5')
                    .typeError('PayIn Commission must be a valid number')
                    .required('PayIn Commission is required'),
                },
                {
                  name: 'mediator_payout_commission',
                  label: 'Mediator Payout Commission',
                  type: 'number',
                  placeholder: 'Enter Payout Commission (0 - 5)',
                  validation: yup
                    .number()
                    .min(0, 'Commission cannot be negative')
                    .max(5, 'Commission cannot exceed 5')
                    .typeError('Payout Commission must be a valid number')
                    .required('Payout Commission is required'),
                },
              ]
            : []),
        ],
      }
    : {}),
});

export const VerificationformFields = (showPassword: boolean) => ({
  'Add Password': [
    {
      name: 'password',
      label: 'Enter Password',
      type: showPassword ? 'text' : 'password',
      placeholder: 'Enter your password',
      validation: yup.string().required('Password is required'),
      width: '12',
    },
  ],
});

export const resetSettlementFormFields = () => ({
  'Reset Settlement': [
    {
      name: 'reference_id',
      label: 'Reset Entry',
      type: 'label',
      validation: yup.string().notRequired(),
    },
  ],
});

export const editSettlementFormFields = (internalUTR: any) => ({
  'Update Settlement': [
    {
      name: 'reference_id',
      label: 'UTR Number',
      type: 'text',
      placeholder: 'Enter your UTR',
      validation: yup.string().required('UTR is required'),
      width: '12',
      disable: internalUTR ? true : false,
    },
  ],
});

export const deleteSettlementFormFields = () => ({
  'Reject Settlement': [
    {
      name: 'rejected_reason',
      label: '',
      type: 'select',
      placeholder: 'Select Rejecting Reason',
      validation: yup.string().required('Reject Reason is required'),
      options: [
        // { value: ' ', label: 'Select Reason' },
        { value: 'Insufficient Funds', label: 'Insufficient Funds' },
        { value: 'Invalid Bank Details', label: 'Invalid Bank Details' },
        { value: 'Other', label: 'Other' },
      ],
      width: '12',
    },
  ],
});

export const SettlementOptions = {
  merchantSettlement: [
    // { value: '', label: 'Select Method' },
    { value: 'BANK', label: 'Bank' },
    { value: 'CASH', label: 'Cash' },
    { value: 'AED', label: 'AED' },
    { value: 'CRYPTO', label: 'Crypto' },
  ],
  vendorSettlement: [
    // { value: '', label: 'Select Method' },
    { value: 'BANK', label: 'Bank' },
    { value: 'CASH', label: 'Cash' },
    { value: 'AED', label: 'AED' },
    { value: 'CRYPTO', label: 'Crypto' },
    { value: 'INTERNAL_QR_TRANSFER', label: 'Internal QR Transfer' },
    { value: 'INTERNAL_BANK_TRANSFER', label: 'Internal Bank Transfer' },
  ],
};

export const MAX_AMOUNT = 50000000; // 5 Crore

export const getBatchWithdrawalForm = (
  totalAmount: number,
  availableBalance: string,
  handleMethodChange?: (value: string) => void,
  // allowPayAssist?: boolean,
  allowTataPay?: boolean,
) => ({
  BatchWithdrawal: [
    {
      name: 'method',
      label: 'Method',
      width: '12',
      type: 'select',
      options: [
        // ...(allowPayAssist
        //   ? [{ value: 'payassist', label: 'PayAssist' }]
        //   : []),
        ...(allowTataPay ? [{ value: 'tatapay', label: 'TataPay' }] : []),
      ],
      validation: yup.string().required('Method is required'),
      onChange: (e: { target: { value: string } }) => {
        if (handleMethodChange) handleMethodChange(e.target.value);
      },
    },
    {
      name: 'availableBalance',
      label: 'Available Balance',
      type: 'number',
      disable: true,
      width: '12',
      placeholder: availableBalance,
      validation:
        Number(availableBalance) >= Number(totalAmount)
          ? yup.string()
          : yup
              .string()
              .test(
                'sufficient-balance',
                'Cannot approve this payout due to insufficient wallet balance.',
                () => false,
              ),
      ...(Number(availableBalance) < Number(totalAmount) && {
        helperText:
          'Cannot approve this payout due to insufficient wallet balance.',
        error: true,
      }),
    },
  ],
});

export const LinkformFields = (availableVendors: Option[]) => ({
  Link_Vendor: [
    {
      name: 'target_vendor_id',
      label: 'Select Parent Vendor',
      type: 'select',
      placeholder: 'Select a vendor to link as parent',
      options: availableVendors,
      validation: yup.string().required('Parent vendor selection is required'),
      width: '12',
    },
    {
      name: 'mediator_payin_commission',
      label: 'Mediator PayIn Commission',
      type: 'number',
      placeholder: 'Enter PayIn Commission (0 - 5)',
      validation: yup
        .number()
        .min(0, 'Commission cannot be negative')
        .max(5, 'Commission cannot exceed 5')
        .typeError('PayIn Commission must be a valid number')
        .required('PayIn Commission is required'),
      width: '6',
    },
    {
      name: 'mediator_payout_commission',
      label: 'Mediator Payout Commission',
      type: 'number',
      placeholder: 'Enter Payout Commission (0 - 5)',
      validation: yup
        .number()
        .min(0, 'Commission cannot be negative')
        .max(5, 'Commission cannot exceed 5')
        .typeError('Payout Commission must be a valid number')
        .required('Payout Commission is required'),
      width: '6',
    },
  ],
});

export const TransferformFields = (
  currentSubVendors: any[],
  availableParentVendors: Option[],
) => ({
  Transfer_Vendor: [
    {
      name: 'subvendor_id',
      label: 'Select Subvendor to Transfer',
      type: 'select',
      placeholder: 'Select subvendor to transfer',
      options: currentSubVendors.map((subVendor: any) => ({
        value: subVendor.user_id,
        label: subVendor.label
          ? subVendor.label
          : subVendor.code
          ? subVendor.code
          : subVendor.user_id
          ? subVendor.user_id
          : '',
      })),
      validation: yup.string().required('Subvendor selection is required'),
      width: '12',
    },
    {
      name: 'new_parent_vendor_id',
      label: 'Select New Parent Vendor',
      type: 'select',
      placeholder: 'Select new parent vendor',
      options: availableParentVendors,
      validation: yup
        .string()
        .required('New parent vendor selection is required'),
      width: '12',
    },
  ],
});

export const UnlinkformFields = (currentSubVendors: any[]) => ({
  Unlink_Vendor: [
    {
      name: 'subvendor_id',
      label: 'Select Subvendor to Unlink',
      type: 'select',
      placeholder: 'Select subvendor to unlink',
      options: currentSubVendors.map((subVendor: any) => ({
        value: subVendor.user_id,
        label: subVendor.label
          ? subVendor.label
          : subVendor.code
          ? subVendor.code
          : subVendor.user_id
          ? subVendor.user_id
          : '',
      })),
      validation: yup.string().required('Subvendor selection is required'),
      width: '12',
    },
  ],
});
