/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ReactNode, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Select from 'react-select';
import { FormLabel, FormInput, FormSwitch } from '@/components/Base/Form';
import Button from '@/components/Base/Button';
import Litepicker from '@/components/Base/Litepicker';
import { Eye, EyeOff } from 'lucide-react';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import { selectDarkMode } from '@/redux-toolkit/slices/common/darkMode/darkModeSlice';
import clsx from 'clsx';

interface Field {
  onChange?: any;
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  width?: string;
  options?: { value: string; label: string }[];
  validation: any;
  disable?: any;
  single?: boolean;
  isMulti?: boolean;
  isSearchable?: boolean;
  defaultValue?: string;
  value?: string;
  prefix?: boolean;
  icon?: string | { component: ReactNode; position: 'left' | 'right' };
  helperText?: string;
  error?: boolean;
  className?: string;
}

interface DynamicFormProps {
  sections: { [key: string]: Field[] };
  onSubmit: (data: any) => void;
  defaultValues: { [key: string]: any };
  isEditMode: boolean;
  handleCancel: () => void;
  isAddData?: boolean;
  isLoading?: boolean;
  onFieldFocus?: () => void;
  onFieldBlur?: () => void;
  onFieldChange?: () => void;
}

const getValidationSchema = (sections: {
  [key: string]: { name: string; validation: any }[];
}) => {
  const schema: { [key: string]: any } = {};
  Object.values(sections)
    .flat()
    .forEach((field) => {
      if (field.validation) {
        schema[field.name] = field.validation;
      }
    });
  return yup.object().shape(schema);
};

const DynamicForm: React.FC<DynamicFormProps> = ({
  sections,
  onSubmit,
  defaultValues,
  isEditMode,
  handleCancel,
  isAddData,
  isLoading = false,
  onFieldFocus,
  onFieldBlur,
  onFieldChange,
}) => {
  const darkMode = useAppSelector(selectDarkMode);
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
    getValues,
  } = useForm({
    resolver: yupResolver(getValidationSchema(sections)),
    defaultValues,
  });

  useEffect(() => {
    if (
      !isEditMode &&
      defaultValues &&
      typeof defaultValues === 'object' &&
      Object.keys(defaultValues).length > 0
    ) {
      reset(defaultValues);
    }
  }, [defaultValues, reset, isEditMode]);

  const handleReset = () => {
    if (isEditMode) {
      reset(defaultValues || {});
    } else {
      const emptyValues: { [key: string]: any } = {};
      Object.values(sections)
        .flat()
        .forEach((field) => {
          emptyValues[field.name] =
            field.type === 'switch' ? false : field.isMulti ? [] : '';
        });
      reset(emptyValues);
    }
  };

  const handleFormSubmit = (data: any) => {
    onSubmit(data);
    if (isAddData === true) {
      reset((formValues) => ({
        ...defaultValues,
        bank_acc_id: formValues.bank_acc_id,
      }));
    }
  };

  // Custom styles for react-select based on dark mode
  const getSelectStyles = () => ({
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: darkMode ? 'rgba(51, 65, 85, 0.5)' : 'white',
      borderColor: state.isFocused
        ? darkMode ? 'rgba(129, 140, 248, 0.5)' : '#818cf8'
        : darkMode ? 'rgba(255, 255, 255, 0.2)' : '#e2e8f0',
      borderRadius: '0.75rem',
      padding: '0.125rem',
      minHeight: '44px',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(99, 102, 241, 0.15)' : 'none',
      transition: 'all 0.2s ease',
      '&:hover': {
        borderColor: darkMode ? 'rgba(255, 255, 255, 0.3)' : '#cbd5e1',
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: darkMode ? '#1e293b' : 'white',
      borderRadius: '0.75rem',
      border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0',
      boxShadow: darkMode 
        ? '0 20px 40px rgba(0, 0, 0, 0.4)' 
        : '0 10px 40px rgba(0, 0, 0, 0.15)',
      zIndex: 9999,
      overflow: 'hidden',
    }),
    menuPortal: (base: any) => ({
      ...base,
      zIndex: 9999,
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? darkMode ? '#4f46e5' : '#6366f1'
        : state.isFocused
        ? darkMode ? 'rgba(255, 255, 255, 0.1)' : '#f1f5f9'
        : 'transparent',
      color: state.isSelected ? 'white' : darkMode ? '#e2e8f0' : '#334155',
      cursor: 'pointer',
      padding: '10px 14px',
      transition: 'all 0.15s ease',
      '&:active': {
        backgroundColor: darkMode ? '#4338ca' : '#4f46e5',
      },
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: darkMode ? '#e2e8f0' : '#334155',
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: darkMode ? 'rgba(99, 102, 241, 0.3)' : '#e0e7ff',
      borderRadius: '0.5rem',
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: darkMode ? '#e2e8f0' : '#4338ca',
      padding: '2px 6px',
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      color: darkMode ? '#e2e8f0' : '#4338ca',
      borderRadius: '0 0.5rem 0.5rem 0',
      '&:hover': {
        backgroundColor: darkMode ? 'rgba(239, 68, 68, 0.3)' : '#fecaca',
        color: darkMode ? '#fca5a5' : '#dc2626',
      },
    }),
    input: (provided: any) => ({
      ...provided,
      color: darkMode ? '#e2e8f0' : '#334155',
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: darkMode ? '#64748b' : '#94a3b8',
    }),
    indicatorSeparator: (provided: any) => ({
      ...provided,
      backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : '#e2e8f0',
    }),
    dropdownIndicator: (provided: any) => ({
      ...provided,
      color: darkMode ? '#64748b' : '#94a3b8',
      '&:hover': {
        color: darkMode ? '#e2e8f0' : '#64748b',
      },
    }),
  });

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className={clsx([
        'max-h-[70vh] sm:max-h-none overflow-y-auto rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl relative',
        darkMode
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-white/10'
          : 'bg-gradient-to-br from-white via-slate-50 to-white border border-slate-200',
      ])}
    >
      {/* Decorative gradient overlay */}
      <div className={clsx([
        'absolute inset-0 rounded-2xl pointer-events-none overflow-hidden',
        darkMode
          ? 'bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.1),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(14,165,233,0.08),transparent_40%)]'
          : 'bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.05),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(14,165,233,0.04),transparent_40%)]',
      ])} />

      <div className="relative z-10">
        {Object.entries(sections)
          .filter(([_, fields]) => fields.length > 0)
          .map(([sectionName, fields]) => (
            <fieldset
              key={sectionName}
              className={clsx([
                'rounded-xl p-4 sm:p-5 mb-4 transition-all duration-300',
                darkMode
                  ? 'bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/[0.07]'
                  : 'bg-slate-50/80 border border-slate-200 hover:border-slate-300 hover:bg-slate-100/80',
              ])}
            >
              <legend className={clsx([
                'text-sm sm:text-base font-semibold px-3 py-1.5 rounded-lg',
                darkMode
                  ? 'bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 text-white border border-white/10'
                  : 'bg-gradient-to-r from-indigo-100 to-cyan-100 text-slate-800 border border-slate-200',
              ])}>
                {sectionName.replace(/_/g, ' ')}
              </legend>

              <div className="flex flex-col sm:grid sm:grid-cols-12 gap-4 sm:gap-5 mt-4">
                {fields.map((field) => (
                  <div
                    key={field.name}
                    className={clsx([
                      'w-full sm:col-span-12',
                      field.width ? 'sm:col-span-12' : 'md:col-span-6',
                      field.className || '',
                    ])}
                  >
                    <FormLabel
                      htmlFor={field.name}
                      className={clsx([
                        'text-xs sm:text-sm font-medium mb-2 block',
                        darkMode ? 'text-slate-300' : 'text-slate-600',
                      ])}
                    >
                      {field.label}
                    </FormLabel>

                    {(field.type === 'text' || field.type === 'number' || field.type === 'password') && (
                      <Controller
                        name={field.name}
                        control={control}
                        render={({ field: controllerField }) => (
                          <div className="relative flex items-center group">
                            {field.prefix && (
                              <select
                                value={
                                  controllerField.value?.startsWith('http://')
                                    ? 'http://'
                                    : 'https://'
                                }
                                onChange={(e) => {
                                  const newPrefix = e.target.value;
                                  const currentValue = controllerField.value || '';
                                  const strippedValue = currentValue.replace(/^https?:\/\//, '');
                                  controllerField.onChange(`${newPrefix}${strippedValue}`);
                                }}
                                className={clsx([
                                  'w-[35%] text-sm font-medium py-3 pl-3 pr-6 border border-r-0 rounded-l-xl appearance-none transition-all duration-200',
                                  darkMode
                                    ? 'bg-slate-700 text-slate-300 border-white/20 focus:border-indigo-400/50'
                                    : 'bg-slate-100 text-slate-600 border-slate-200 focus:border-indigo-400',
                                  'focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
                                ])}
                              >
                                <option value="https://">https://</option>
                                <option value="http://">http://</option>
                              </select>
                            )}
                            <FormInput
                              {...controllerField}
                              id={field.name}
                              type={
                                field.type === 'password'
                                  ? showPassword ? 'text' : 'password'
                                  : field.type
                              }
                              placeholder={field.placeholder}
                              disabled={field.disable || isLoading}
                              className={clsx([
                                'w-full px-4 py-3 text-sm transition-all duration-200',
                                field.prefix ? 'rounded-l-none border-l-0 rounded-r-xl' : 'rounded-xl',
                                darkMode
                                  ? 'bg-slate-700/50 text-white placeholder:text-slate-400 border-white/20'
                                  : 'bg-white text-slate-800 placeholder:text-slate-400 border-slate-200',
                                field.error || errors[field.name]
                                  ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500'
                                  : darkMode
                                    ? 'focus:border-indigo-400/50 focus:ring-indigo-500/20 hover:border-white/30'
                                    : 'focus:border-indigo-400 focus:ring-indigo-500/20 hover:border-slate-300',
                                'focus:outline-none focus:ring-3',
                                (field.disable || isLoading) && 'opacity-60 cursor-not-allowed',
                              ])}
                              onFocus={() => onFieldFocus?.()}
                              onBlur={() => onFieldBlur?.()}
                              onChange={(e) => {
                                onFieldChange?.();
                                let value = e.target.value;

                                if (field.name === 'utr') {
                                  if (value === '' || /^[a-zA-Z0-9./|]*$/.test(value)) {
                                    controllerField.onChange(value);
                                  }
                                  return;
                                }

                                if (field.prefix) {
                                  const currentPrefix = controllerField.value?.startsWith('http://') ? 'http://' : 'https://';
                                  controllerField.onChange(`${currentPrefix}${value}`);
                                } else {
                                  controllerField.onChange(value);
                                }

                                field.onChange?.(e);
                              }}
                              value={
                                field.prefix
                                  ? controllerField.value?.replace(/^https?:\/\//, '') || ''
                                  : controllerField.value || ''
                              }
                            />
                            {field.type === 'password' && (
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className={clsx([
                                  'absolute inset-y-0 right-3 flex items-center transition-colors',
                                  darkMode
                                    ? 'text-slate-400 hover:text-white'
                                    : 'text-slate-400 hover:text-slate-600',
                                ])}
                              >
                                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                              </button>
                            )}
                          </div>
                        )}
                      />
                    )}

                    {field.type === 'datepicker' && (
                      <Controller
                        name={field.name}
                        control={control}
                        render={({ field: { value, onChange, onBlur } }) => (
                          <Litepicker
                            value={value}
                            onChange={onChange}
                            enforceRange={false}
                            onBlur={onBlur}
                            placeholder="dd/mm/yyyy"
                            options={{
                              autoApply: false,
                              singleMode: field.single ? field.single : false,
                              numberOfColumns: field.single ? 1 : 2,
                              numberOfMonths: field.single ? 1 : 2,
                              showWeekNumbers: true,
                              dropdowns: {
                                minYear: 1990,
                                maxYear: null,
                                months: true,
                                years: true,
                              },
                            }}
                            className={clsx([
                              'w-full px-4 py-3 rounded-xl text-sm transition-all duration-200',
                              darkMode
                                ? 'bg-slate-700/50 text-white border-white/20 focus:border-indigo-400/50'
                                : 'bg-white text-slate-800 border-slate-200 focus:border-indigo-400',
                              'focus:outline-none focus:ring-3 focus:ring-indigo-500/20',
                            ])}
                            disabled={isLoading}
                          />
                        )}
                      />
                    )}

                    {field.type === 'select' && (
                      <Controller
                        name={field.name}
                        control={control}
                        defaultValue={field.isMulti ? [] : defaultValues[field.name] || ''}
                        render={({ field: controllerField }) => {
                          const selectedOption = field.isMulti
                            ? field.options?.filter((option) =>
                                controllerField.value?.includes(option.value),
                              ) || []
                            : field.options?.find(
                                (option) => option.value === controllerField.value,
                              ) || null;

                          return (
                            <Select
                              {...controllerField}
                              inputId={field.name}
                              isMulti={field.isMulti}
                              isDisabled={field?.disable || isLoading}
                              options={field.options}
                              closeMenuOnSelect={field.isMulti ? false : true}
                              onFocus={() => onFieldFocus?.()}
                              onBlur={() => onFieldBlur?.()}
                              onChange={(selectedOption) => {
                                onFieldChange?.();

                                if (field.isMulti) {
                                  const newValue = selectedOption
                                    ? (selectedOption as { value: string; label: string }[]).map((opt) => opt.value)
                                    : [];
                                  controllerField.onChange(newValue);
                                  field.onChange?.({
                                    target: { value: newValue },
                                  } as unknown as React.ChangeEvent<HTMLSelectElement>);
                                } else {
                                  const newValue = selectedOption
                                    ? (selectedOption as { value: string; label: string }).value
                                    : '';
                                  controllerField.onChange(newValue);
                                  field.onChange?.({
                                    target: { value: newValue },
                                  } as React.ChangeEvent<HTMLSelectElement>);
                                }
                              }}
                              value={selectedOption}
                              isSearchable={field.isSearchable !== false}
                              menuPortalTarget={document.body}
                              styles={getSelectStyles()}
                            />
                          );
                        }}
                      />
                    )}

                    {field.type === 'switch' && (
                      <Controller
                        name={field.name}
                        control={control}
                        render={({ field: controllerField }) => (
                          <div className={clsx([
                            'flex items-center gap-3 p-3 rounded-xl transition-all duration-200',
                            darkMode
                              ? 'bg-slate-700/30 hover:bg-slate-700/50 border border-white/5'
                              : 'bg-slate-100 hover:bg-slate-200/70 border border-slate-200',
                          ])}>
                            <FormSwitch>
                              <FormSwitch.Label htmlFor={field.name}>
                                <FormSwitch.Input
                                  {...controllerField}
                                  id={field.name}
                                  type="checkbox"
                                  checked={controllerField.value}
                                  disabled={isLoading}
                                  onChange={(e) => {
                                    controllerField.onChange(e.target.checked);
                                    field.onChange?.(e.target.checked, getValues());
                                  }}
                                  className={clsx([
                                    'w-11 h-6 rounded-full transition-colors',
                                    darkMode
                                      ? 'bg-slate-600 checked:bg-indigo-500'
                                      : 'bg-slate-300 checked:bg-indigo-500',
                                  ])}
                                />
                              </FormSwitch.Label>
                            </FormSwitch>
                            <span className={clsx([
                              'text-sm font-medium',
                              darkMode ? 'text-slate-400' : 'text-slate-600',
                            ])}>
                              {controllerField.value ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                        )}
                      />
                    )}

                    {/* Helper text */}
                    {field.helperText && (
                      <p className={clsx([
                        'text-xs mt-2',
                        field.error
                          ? 'text-rose-500 font-medium'
                          : darkMode ? 'text-slate-400' : 'text-slate-500',
                      ])}>
                        {field.helperText}
                      </p>
                    )}

                    {/* Error message */}
                    {errors[field.name] && typeof errors[field.name]?.message === 'string' && (
                      <p className="text-rose-500 text-xs mt-2 font-medium flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                        {errors[field.name]?.message as string}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </fieldset>
          ))}

        {/* Action Buttons */}
        <div className={clsx([
          'flex flex-col-reverse sm:flex-row justify-end gap-3 mt-5 pt-5',
          darkMode ? 'border-t border-white/10' : 'border-t border-slate-200',
        ])}>
          <Button
            type="reset"
            variant="outline-secondary"
            onClick={() => (isEditMode ? handleReset() : handleCancel())}
            disabled={isLoading}
            className={clsx([
              'w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              darkMode
                ? 'bg-transparent border-white/20 text-white/80 hover:bg-white/10 hover:border-white/30 hover:text-white'
                : 'bg-transparent border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300 hover:text-slate-800',
              isLoading && 'opacity-50 cursor-not-allowed',
            ])}
          >
            {isEditMode ? 'Reset' : 'Cancel'}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || Object.keys(errors).length > 0}
            className={clsx([
              'w-full sm:w-auto px-8 py-2.5 rounded-xl text-sm font-medium transition-all duration-300',
              'bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500',
              'hover:from-indigo-600 hover:via-purple-600 hover:to-cyan-600',
              'shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/35',
              'hover:scale-[1.02] active:scale-[0.98]',
              'text-white border-0',
              (isLoading || Object.keys(errors).length > 0) && 'opacity-60 cursor-not-allowed hover:scale-100',
            ])}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                  />
                </svg>
                <span>Processing...</span>
              </div>
            ) : isEditMode ? (
              'Update'
            ) : (
              'Submit'
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default DynamicForm;
