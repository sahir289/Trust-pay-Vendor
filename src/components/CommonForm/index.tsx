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
  isLoading?: boolean; // New prop for loading state
  onFieldFocus?: () => void; // New prop for field focus tracking
  onFieldBlur?: () => void; // New prop for field blur tracking
  onFieldChange?: () => void; // New prop for field change tracking
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
  isLoading = false, // Default to false
  onFieldFocus,
  onFieldBlur,
  onFieldChange,
}) => {
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
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
  }, [defaultValues, reset]);

  useEffect(() => {}, [getValues, errors]);

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

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="max-h-[70vh] sm:max-h-none overflow-y-auto rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-6 border border-white/10 shadow-2xl backdrop-blur"
    >
      {Object.entries(sections)
        .filter(([_, fields]) => fields.length > 0)
        .map(([sectionName, fields]) => (
          <fieldset
            key={sectionName}
            className="border border-white/15 rounded-xl bg-white/5 dark:border-gray-700 p-4 sm:p-5 mb-4 shadow-inner"
          >
            <legend className="text-sm sm:text-base md:text-lg font-bold sm:font-semibold px-2 py-1 rounded-lg bg-white/10 text-white">
              {sectionName.replace(/_/g, ' ')}
            </legend>
            <div className="flex flex-col sm:grid sm:grid-cols-12 gap-3 sm:gap-4">
              {fields.map((field) => (
                <div
                  key={field.name}
                  className={`w-full sm:col-span-12 ${
                    field.width ? 'sm:col-span-12' : 'md:col-span-6'
                  } ${field.className || ''}`}
                >
                  <FormLabel htmlFor={field.name} className="text-xs sm:text-sm font-medium dark:text-slate-300 mb-1.5 block">{field.label}</FormLabel>
                  {field.type === 'text' ||
                  field.type === 'number' ||
                  field.type === 'password' ? (
                    <Controller
                      name={field.name}
                      control={control}
                      render={({ field: controllerField }) => (
                        <div className="relative flex items-center">
                          {field.prefix && (
                            <select
                              value={
                                controllerField.value?.startsWith('http://')
                                  ? 'http://'
                                  : 'https://'
                              }
                              onChange={(e) => {
                                const newPrefix = e.target.value;
                                const currentValue =
                                  controllerField.value || '';
                                const strippedValue = currentValue.replace(
                                  /^https?:\/\//,
                                  '',
                                );
                                controllerField.onChange(
                                  `${newPrefix}${strippedValue}`,
                                );
                              }}
                              className="w-[40%] bg-gray-200 text-gray-500 text-base font-small leading-tight py-2 pl-3 pr-8 border border-r-0 border-gray-300 rounded-l-lg appearance-none focus:outline-none focus:ring-2 focus:ring-gray-200"
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
                                ? showPassword
                                  ? 'text'
                                  : 'password'
                                : field.type
                            }
                            placeholder={field.placeholder}
                            disabled={field.disable || isLoading} // Disable input during loading
                            className={`w-full px-3 py-2.5 sm:py-2 border text-sm sm:text-base ${
                              field.prefix
                                ? 'rounded-l-none border-l-0'
                                : 'rounded-lg'
                            } ${
                              field.error || errors[field.name]
                                ? 'border-danger focus:ring-danger/20 focus:border-danger'
                                : 'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:focus:ring-primary/30'
                            } dark:bg-darkmode-700 dark:border-gray-600 dark:text-slate-200`}
                            onFocus={() => {
                              if (onFieldFocus) onFieldFocus();
                            }}
                            onBlur={() => {
                              if (onFieldBlur) onFieldBlur();
                            }}
                            onChange={(e) => {
                              if (onFieldChange) onFieldChange();

                              let value = e.target.value;

                              if (field.name === 'utr') {
                                // Only update if the value matches the allowed pattern
                                if (
                                  value === '' ||
                                  /^[a-zA-Z0-9./|]*$/.test(value)
                                ) {
                                  controllerField.onChange(value);
                                }
                                // If invalid character, don't update the field
                                return;
                              }

                              if (field.prefix) {
                                const currentPrefix =
                                  controllerField.value?.startsWith('http://')
                                    ? 'http://'
                                    : 'https://';
                                controllerField.onChange(
                                  `${currentPrefix}${value}`,
                                );
                              } else {
                                controllerField.onChange(value);
                              }

                              // Call custom onChange if provided
                              if (field.onChange) {
                                field.onChange(e);
                              }
                            }}
                            value={
                              field.prefix
                                ? controllerField.value?.replace(
                                    /^https?:\/\//,
                                    '',
                                  ) || ''
                                : controllerField.value || ''
                            }
                          />
                          {field.type === 'password' && (
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-2 flex items-center pr-3"
                            >
                              {showPassword ? (
                                <Eye size={14} />
                              ) : (
                                <EyeOff size={14} />
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    />
                  ) : field.type === 'datepicker' ? (
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
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isLoading} // Disable datepicker during loading
                        />
                      )}
                    />
                  ) : field.type === 'select' ? (
                    <Controller
                      name={field.name}
                      control={control}
                      defaultValue={
                        field.isMulti ? [] : defaultValues[field.name] || ''
                      }
                      render={({ field: controllerField }) => {
                        const selectedOption = field.isMulti
                          ? field.options?.filter((option) =>
                              controllerField.value?.includes(option.value),
                            ) || []
                          : field.options?.find(
                              (option) =>
                                option.value === controllerField.value,
                            ) || null;

                        return (
                          <Select
                            {...controllerField}
                            inputId={field.name}
                            isMulti={field.isMulti}
                            isDisabled={field?.disable || isLoading}
                            options={field.options}
                            closeMenuOnSelect={field.isMulti ? false : true}
                            onFocus={() => {
                              if (onFieldFocus) onFieldFocus();
                            }}
                            onBlur={() => {
                              if (onFieldBlur) onFieldBlur();
                            }}
                            onChange={(selectedOption) => {
                              if (onFieldChange) onFieldChange();

                              if (field.isMulti) {
                                const newValue = selectedOption
                                  ? (
                                      selectedOption as {
                                        value: string;
                                        label: string;
                                      }[]
                                    ).map((opt) => opt.value)
                                  : [];
                                controllerField.onChange(newValue);
                                if (field.onChange) {
                                  field.onChange({
                                    target: { value: newValue },
                                  } as unknown as React.ChangeEvent<HTMLSelectElement>);
                                }
                              } else {
                                const newValue = selectedOption
                                  ? (
                                      selectedOption as {
                                        value: string;
                                        label: string;
                                      }
                                    ).value
                                  : '';
                                controllerField.onChange(newValue);
                                if (field.onChange) {
                                  field.onChange({
                                    target: { value: newValue },
                                  } as React.ChangeEvent<HTMLSelectElement>);
                                }
                              }
                            }}
                            value={selectedOption}
                            isSearchable={field.isSearchable !== false}
                            menuPortalTarget={document.body} //rendered dropdown in dom
                            styles={{
                              control: (provided) => ({
                                ...provided,
                                backgroundColor: isDarkMode
                                  ? 'rgb(255 255 255 / 0)'
                                  : 'white',
                                color: isDarkMode ? '#cbd5e1' : '#111827',
                                borderColor: 'transparent',
                              }),
                              menu: (provided) => ({
                                ...provided,
                                backgroundColor: isDarkMode
                                  ? 'rgb(255 255 255 / 0)'
                                  : 'white',
                                zIndex: 9999, //for dropdown getting cropped fixed
                              }),
                              menuPortal: (base) => ({
                                ...base,
                                zIndex: 9999, //for dropdown getting cropped fixed
                              }),
                              option: (provided, state) => ({
                                ...provided,
                                backgroundColor: state.isSelected
                                  ? isDarkMode
                                    ? '#374151'
                                    : '#e5e7eb'
                                  : isDarkMode
                                  ? 'black'
                                  : 'white',
                                color: state.isSelected
                                  ? 'white'
                                  : isDarkMode
                                  ? '#cbd5e1'
                                  : '#111827',
                              }),
                            }}
                          />
                        );
                      }}
                    />
                  ) : field.type === 'switch' ? (
                    <Controller
                      name={field.name}
                      control={control}
                      render={({ field: controllerField }) => (
                        <FormSwitch>
                          <FormSwitch.Label htmlFor={field.name}>
                            <FormSwitch.Input
                              {...controllerField}
                              id={field.name}
                              type="checkbox"
                              checked={controllerField.value}
                              disabled={isLoading} // Disable switch during loading
                              onChange={(e) => {
                                controllerField.onChange(e.target.checked);
                                if (field.onChange) {
                                  field.onChange(e.target.checked, getValues());
                                }
                              }}
                            />
                          </FormSwitch.Label>
                        </FormSwitch>
                      )}
                    />
                  ) : null}
                  {/* Helper text display */}
                  {field.helperText && (
                    <p
                      className={`text-xs mt-1 ${
                        field.error
                          ? 'text-danger font-medium'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {field.helperText}
                    </p>
                  )}
                  {/* Form validation errors */}
                  {errors[field.name] &&
                  typeof errors[field.name]?.message === 'string' ? (
                    <p className="text-danger text-xs mt-1 font-medium">
                      {errors[field.name]?.message as string}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </fieldset>
        ))}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-3 sm:mt-4">
        <Button
          type="reset"
          variant="outline-secondary"
          onClick={() => (isEditMode ? handleReset() : handleCancel())}
          className="w-full sm:w-24 text-xs sm:text-sm"
          disabled={isLoading} // Disable cancel/reset during loading
        >
          {isEditMode ? 'Reset' : 'Cancel'}
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading || Object.keys(errors).length > 0}
          className="w-full sm:w-auto text-xs sm:text-sm"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2 text-white"
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
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                ></path>
              </svg>
              <span className="text-xs sm:text-sm">Loading...</span>
            </div>
          ) : isEditMode ? (
            'Update'
          ) : (
            'Add'
          )}
        </Button>
      </div>
    </form>
  );
};

export default DynamicForm;
