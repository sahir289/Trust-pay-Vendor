/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';
import Lucide from '@/components/Base/Lucide';

// Interfaces (unchanged)
interface Assignment {
  countries: string[];
  regions: string[];
}

interface CountryRegionData {
  country: string;
  regions: string[];
}

interface AssignCountryModalProps {
  title: string;
  forOpen: boolean;
  handleModal: () => void;
  defaultAssignments: Assignment | CountryRegionData[] | null;
  onSubmit: (data: CountryRegionData[]) => void;
  onCancel: () => void;
  isLoading: boolean;
}

interface SelectOption {
  value: string;
  label: string;
}

const AssignCountryModal: React.FC<AssignCountryModalProps> = ({
  forOpen,
  handleModal,
  defaultAssignments,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  // State declarations
  const [tempCountry, setTempCountry] = useState<string>('');
  const [selectedRegions, setSelectedRegions] = useState<SelectOption[]>([]);
  const [defaultAssignedList, setDefaultAssignedList] = useState<
    CountryRegionData[]
  >([]);
  const [newlyAddedEntries, setNewlyAddedEntries] = useState<
    CountryRegionData[]
  >([]);
  const [removedEntries, setRemovedEntries] = useState<
    { type: 'country' | 'region'; value: string; country?: string }[]
  >([]);
  const [updateFlag, setUpdateFlag] = useState<boolean>(false);
  const isDarkMode = localStorage.getItem('darkMode') === 'true';

  // Disable background scrolling when modal is open
  useEffect(() => {
    if (forOpen) {
      document.body.style.overflow = 'hidden'; 
    } else {
      document.body.style.overflow = ''; 
    }
    return () => {
      document.body.style.overflow = ''; 
    };
  }, [forOpen]);
  // Initialize based on defaultAssignments
  useEffect(() => {
    setTempCountry('');
    setSelectedRegions([]);
    setNewlyAddedEntries([]);
    setRemovedEntries([]);
    setUpdateFlag(false);

    if (!defaultAssignments) {
      setDefaultAssignedList([]);
      return;
    }

    if (Array.isArray(defaultAssignments)) {
      if (defaultAssignments.length === 0) {
        setDefaultAssignedList([]);
        return;
      }

      const validData = defaultAssignments.filter(
        (item): item is CountryRegionData =>
          typeof item === 'object' &&
          item !== null &&
          typeof item.country === 'string' &&
          Array.isArray(item.regions) &&
          item.regions.every((region) => typeof region === 'string'),
      );

      if (validData.length === 0) {
        setDefaultAssignedList([]);
        return;
      }

      setDefaultAssignedList(validData);
      return;
    }

    if (
      typeof defaultAssignments === 'object' &&
      defaultAssignments !== null &&
      'countries' in defaultAssignments &&
      'regions' in defaultAssignments
    ) {
      const countries = Array.isArray(defaultAssignments.countries)
        ? defaultAssignments.countries.filter(
            (country) => typeof country === 'string',
          )
        : [];
      const regions = Array.isArray(defaultAssignments.regions)
        ? defaultAssignments.regions.filter(
            (region) => typeof region === 'string',
          )
        : [];

      if (countries.length === 0 && regions.length === 0) {
        setDefaultAssignedList([]);
        return;
      }

      const assignedData: CountryRegionData[] = countries.map((country) => ({
        country,
        regions: regions.filter((region) =>
          defaultAssignments.regions.some((r) => r === region),
        ),
      }));

      setDefaultAssignedList(assignedData);
      return;
    }

    setDefaultAssignedList([]);
  }, [defaultAssignments]);

  // Handle adding countries and regions
  const handleAdd = () => {
    if (!tempCountry) return;

    const newRegions = selectedRegions.map((option) => option.value);
    const newEntry: CountryRegionData = {
      country: tempCountry,
      regions: newRegions,
    };

    setNewlyAddedEntries((prev) => {
      const existing = prev.find((item) => item.country === tempCountry);
      if (existing) {
        existing.regions = Array.from(
          new Set([...newRegions, ...existing.regions]),
        );
        const updatedEntries = prev.filter(
          (item) => item.country !== tempCountry,
        );
        return [existing, ...updatedEntries];
      }
      return [newEntry, ...prev];
    });

    setTempCountry('');
    setSelectedRegions([]);
    setUpdateFlag(true);
  };

  // Handle removing countries or regions
  const handleRemove = (
    type: 'country' | 'region',
    value: string,
    country?: string,
    fromDefault: boolean = false,
  ) => {
    if (type === 'country') {
      if (fromDefault) {
        setDefaultAssignedList((prev) =>
          prev.filter((item) => item.country !== value),
        );
      } else {
        setNewlyAddedEntries((prev) =>
          prev.filter((item) => item.country !== value),
        );
      }
      setRemovedEntries((prev) => [...prev, { type: 'country', value }]);
    } else {
      if (fromDefault) {
        setDefaultAssignedList((prev) =>
          prev
            .map((item) =>
              item.country === country && item.regions.includes(value)
                ? { ...item, regions: item.regions.filter((r) => r !== value) }
                : item,
            )
            .filter(
              (item) => item.regions.length > 0 || item.country !== country,
            ),
        );
      } else {
        setNewlyAddedEntries((prev) =>
          prev
            .map((item) =>
              item.country === country && item.regions.includes(value)
                ? { ...item, regions: item.regions.filter((r) => r !== value) }
                : item,
            )
            .filter(
              (item) => item.regions.length > 0 || item.country !== country,
            ),
        );
      }
      setRemovedEntries((prev) => [
        ...prev,
        { type: 'region', value, country },
      ]);
    }
    setUpdateFlag(true);
  };

  // Handle restoring removed entries
  const handleRestoreEntry = (
    type: 'country' | 'region',
    value: string,
    country?: string,
  ) => {
    if (type === 'country') {
      setNewlyAddedEntries((prev) => [
        { country: value, regions: [] },
        ...prev,
      ]);
      setRemovedEntries((prev) =>
        prev.filter(
          (entry) => entry.value !== value || entry.type !== 'country',
        ),
      );
    } else {
      setNewlyAddedEntries((prev) => {
        const existing = prev.find((item) => item.country === country);
        if (existing) {
          existing.regions = [value, ...existing.regions];
          const updatedEntries = prev.filter(
            (item) => item.country !== country,
          );
          return [existing, ...updatedEntries];
        }
        return [{ country: country!, regions: [value] }, ...prev];
      });
      setRemovedEntries((prev) =>
        prev.filter(
          (entry) =>
            entry.value !== value ||
            entry.country !== country ||
            entry.type !== 'region',
        ),
      );
    }
    setUpdateFlag(true);
  };

  // Handle submit
  const handleSubmit = () => {
    const finalList: CountryRegionData[] = [
      ...defaultAssignedList,
      ...newlyAddedEntries,
    ]
      .reduce<CountryRegionData[]>((acc, curr) => {
        const existing = acc.find((item) => item.country === curr.country);
        if (existing) {
          existing.regions = Array.from(
            new Set([...existing.regions, ...curr.regions]),
          );
        } else {
          acc.push({ ...curr });
        }
        return acc;
      }, [])
      .filter(
        (item) =>
          !removedEntries.some(
            (entry) => entry.type === 'country' && entry.value === item.country,
          ),
      );

    onSubmit(finalList);
    setRemovedEntries([]);
    setNewlyAddedEntries([]);
    setTempCountry('');
    setSelectedRegions([]);
    setUpdateFlag(false);
    handleModal();
  };

  // Handle cancel
  const handleCancel = () => {
    onCancel();
    setTempCountry('');
    setSelectedRegions([]);
    setDefaultAssignedList([]);
    setNewlyAddedEntries([]);
    setRemovedEntries([]);
    setUpdateFlag(false);
    handleModal();
  };

  // Handle clearing selected regions
  const handleClearRegions = () => {
    setSelectedRegions([]);
  };
  const handleRegionChange = (val: string) => {
    if (val) {
      setSelectedRegions((prev) => {
        const newOption = { value: val, label: val };
        return prev.some((opt) => opt.value === val)
          ? prev
          : [newOption, ...prev]; 
      });
    }
  };

  if (!forOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-hidden">
      <div className="rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 border-2 bg-white dark:bg-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Unblock Countries & Regions
          </h2>
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 text-2xl font-bold"
            aria-label="Close modal"
            disabled={isLoading}
          >
            &times;
          </button>
        </div>

        <div className="space-y-4">
          {/* Default Assignments */}
          {defaultAssignedList.length > 0 && (
            <fieldset className="border-2 rounded-lg border-gray-200 dark:border-gray-400 p-4 mb-4">
              <legend className="text-sm font-medium px-2 text-gray-700 dark:text-gray-300">
                Default Unblocked Restriction
              </legend>
              <div className="space-y-4 max-h-60 overflow-y-auto">
                <div>
                  <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Countries
                  </h3>
                  <ul className="space-y-2">
                    {defaultAssignedList.map((item, index) => (
                      <li
                        key={`default-country-${item.country}-${index}`}
                        className="flex justify-between items-center rounded-lg p-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-400"
                      >
                        <span className="text-gray-800 dark:text-gray-300">
                          {item.country}
                        </span>
                        <button
                          className="text-red-500 hover:text-red-700 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
                          onClick={() =>
                            handleRemove(
                              'country',
                              item.country,
                              undefined,
                              true,
                            )
                          }
                          disabled={isLoading}
                        >
                          <Lucide icon="Trash" className="w-5 h-5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Regions
                  </h3>
                  <ul className="space-y-2">
                    {defaultAssignedList.every(
                      (item) => item.regions.length === 0,
                    ) ? (
                      <li className="text-gray-500 dark:text-gray-400 text-sm">
                        All regions assigned.
                      </li>
                    ) : (
                      defaultAssignedList.map((item, index) =>
                        item.regions.map((region, rIndex) => (
                          <li
                            key={`default-region-${region}-${index}-${rIndex}`}
                            className="flex justify-between items-center rounded-lg p-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-400"
                          >
                            <span className="text-gray-800 dark:text-gray-300">{`${region} (${item.country})`}</span>
                            <button
                              className="text-red-500 hover:text-red-700 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
                              onClick={() =>
                                handleRemove(
                                  'region',
                                  region,
                                  item.country,
                                  true,
                                )
                              }
                              disabled={isLoading}
                            >
                              <Lucide icon="Trash" className="w-5 h-5" />
                            </button>
                          </li>
                        )),
                      )
                    )}
                  </ul>
                </div>
              </div>
            </fieldset>
          )}
          {/* Removed Entries */}
          {removedEntries.length > 0 && (
            <fieldset className="border-2 rounded-lg border-red-200 dark:border-red-700 p-4 mb-4">
              <legend className="text-sm font-medium px-2 text-gray-700 dark:text-gray-300">
                Removed Entries
              </legend>
              <div className="space-y-4 max-h-60 overflow-y-auto">
                <div>
                  <h3 className="flex justify-between items-center text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Removed Items
                    <Lucide
                      onClick={() => setRemovedEntries([])}
                      icon="X"
                      className="w-5 h-5 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                    />
                  </h3>
                  <ul className="space-y-2">
                    {removedEntries.map((entry, index) => (
                      <li
                        key={`removed-${entry.type}-${entry.value}-${index}`}
                        className="flex justify-between items-center rounded-lg p-2 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700"
                      >
                        <span className="text-gray-800 dark:text-gray-300 line-through">
                          {entry.type === 'country'
                            ? entry.value
                            : `${entry.value} (${entry.country})`}
                        </span>
                        <button
                          className="text-green-500 hover:text-green-700 disabled:opacity-50 dark:text-green-400 dark:hover:text-green-300"
                          onClick={() =>
                            handleRestoreEntry(
                              entry.type,
                              entry.value,
                              entry.country,
                            )
                          }
                          disabled={isLoading}
                        >
                          <Lucide icon="RotateCcw" className="w-5 h-5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </fieldset>
          )}
          {/* Country & Region Selection */}
          <fieldset className="border-2 rounded-lg border-gray-200 dark:border-gray-400 p-4 mb-4">
            <legend className="text-sm font-medium px-2 text-gray-700 dark:text-gray-300">
              Add New Unblocked Restriction
            </legend>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 sm:col-span-6">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Country
                </label>
                <CountryDropdown
                  value={tempCountry}
                  onChange={(val) => {
                    setTempCountry(val);
                    setSelectedRegions([]);
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-400 text-gray-800 dark:text-white"
                />
              </div>
              <div className="col-span-12 sm:col-span-6">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Regions
                </label>
                <div className="relative">
                  <RegionDropdown
                    country={tempCountry}
                    value=""
                    onChange={handleRegionChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-400 text-gray-800 dark:text-white"
                    disableWhenEmpty
                    disabled={!tempCountry}
                  />
                  {selectedRegions.length > 0 && (
                    <button
                      onClick={handleClearRegions}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                      aria-label="Clear regions"
                    >
                      <Lucide icon="X" className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Display selected regions temporarily */}
            {selectedRegions.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Selected Regions
                </h4>
                <ul className="space-y-1 max-h-60 overflow-y-auto">
                  {selectedRegions.map((region, index) => (
                    <li
                      key={`temp-region-${region.value}-${index}`}
                      className="flex justify-between items-center rounded-lg p-2 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700"
                    >
                      <span className="text-gray-800 dark:text-gray-300">
                        {region.label}
                      </span>
                      <button
                        onClick={() =>
                          setSelectedRegions((prev) =>
                            prev.filter((opt) => opt.value !== region.value),
                          )
                        }
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Lucide icon="Trash" className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4">
              <button
                className={`px-4 py-2 rounded-md ${
                  !tempCountry
                    ? isDarkMode
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-400 text-white cursor-not-allowed'
                    : isDarkMode
                    ? 'bg-green-700 text-gray-100 hover:bg-green-800'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
                onClick={handleAdd}
                disabled={isLoading || !tempCountry}
              >
                Enable
              </button>
            </div>
          </fieldset>

          {/* Newly Added Assignments */}
          {newlyAddedEntries.length > 0 && (
            <fieldset className="border-2 rounded-lg border-green-200 dark:border-green-700 p-4 mb-4">
              <legend className="text-sm font-medium px-2 text-gray-700 dark:text-gray-300">
                Newly Added Unblocked Restriction
              </legend>
              <div className="space-y-4 max-h-60 overflow-y-auto">
                <div>
                  <h3 className="flex justify-between items-center text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Countries
                    <Lucide
                      onClick={() => setNewlyAddedEntries([])}
                      icon="X"
                      className="w-5 h-5 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                    />
                  </h3>
                  <ul className="space-y-2">
                    {newlyAddedEntries.map((item, index) => (
                      <li
                        key={`added-country-${item.country}-${index}`}
                        className="flex justify-between items-center rounded-lg p-2 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700"
                      >
                        <span className="text-gray-800 dark:text-gray-300">
                          {item.country}
                        </span>
                        <button
                          className="text-red-500 hover:text-red-700 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
                          onClick={() => handleRemove('country', item.country)}
                          disabled={isLoading}
                        >
                          <Lucide icon="Trash" className="w-5 h-5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="flex justify-between items-center text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Regions
                    {newlyAddedEntries.some(
                      (item) => item.regions.length > 0,
                    ) && (
                      <Lucide
                        onClick={() =>
                          setNewlyAddedEntries((prev) =>
                            prev.map((item) => ({ ...item, regions: [] })),
                          )
                        }
                        icon="X"
                        className="w-5 h-5 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                      />
                    )}
                  </h3>
                  <ul className="space-y-2">
                    {newlyAddedEntries.every(
                      (item) => item.regions.length === 0,
                    ) ? (
                      <li className="text-gray-500 dark:text-gray-400 text-sm">
                        All regions added.
                      </li>
                    ) : (
                      newlyAddedEntries.map((item, index) =>
                        item.regions.map((region, rIndex) => (
                          <li
                            key={`added-region-${region}-${index}-${rIndex}`}
                            className="flex justify-between items-center rounded-lg p-2 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700"
                          >
                            <span className="text-gray-800 dark:text-gray-300">{`${region} (${item.country})`}</span>
                            <button
                              className="text-red-500 hover:text-red-700 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
                              onClick={() =>
                                handleRemove('region', region, item.country)
                              }
                              disabled={isLoading}
                            >
                              <Lucide icon="Trash" className="w-5 h-5" />
                            </button>
                          </li>
                        )),
                      )
                    )}
                  </ul>
                </div>
              </div>
            </fieldset>
          )}
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={handleCancel}
            className="border border-gray-300 hover:border-gray-400 text-gray-800 px-4 py-2 rounded-lg disabled:opacity-50 dark:border-gray-400 dark:hover:border-gray-300 dark:text-white"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={`px-4 py-2 rounded-md ${
              !updateFlag
                ? isDarkMode
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-400 text-white cursor-not-allowed'
                : isDarkMode
                ? 'bg-blue-700 text-gray-100 hover:bg-blue-800'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
            disabled={isLoading || !updateFlag}
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-blue-500 dark:text-blue-300"
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
                Processing...
              </div>
            ) : (
              'Update'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignCountryModal;
