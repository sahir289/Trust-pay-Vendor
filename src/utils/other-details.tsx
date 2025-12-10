/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
import React, { memo, useState } from 'react';
import { Clipboard, ChevronDown, ChevronRight } from 'lucide-react';

type DataType = Record<string, unknown> | unknown[];

const isLongField = (key: string, value: unknown): boolean => {
  if (value == null || value === '') return false;
  return (
    key.toLowerCase().includes('id') ||
    (typeof value === 'string' && value.length > 20)
  );
};

const formatDisplayValue = (value: unknown): string =>
  value == null || value === '' ? '—' : String(value);

const FieldRenderer: React.FC<{
  keyName: string;
  value: string;
  isLong: boolean;
}> = memo(({ keyName, value, isLong }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className={`group relative transition-all duration-200 hover:shadow-md rounded-lg sm:rounded-xl p-2 sm:p-4 
        bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700
        ${isLong ? 'col-span-12 sm:col-span-6' : 'col-span-6'}
        `}
    >
      <span className="block text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 sm:mb-1.5 tracking-wide uppercase">
        {keyName}
      </span>
      <div className="relative flex items-center">
        <span className="flex-1 text-xs sm:text-sm text-gray-900 dark:text-gray-100 
          bg-white dark:bg-gray-950 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg border 
          border-gray-200 dark:border-gray-800 font-mono break-all overflow-hidden">
          {value}
        </span>
        <button
          onClick={handleCopy}
          className="absolute right-1 sm:right-2 opacity-0 group-hover:opacity-100 transition-opacity 
            p-1 sm:p-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 
            bg-gray-100 hover:bg-gray-200 dark:bg-gray-900/90 dark:hover:bg-gray-800 rounded shadow-sm"
          title="Copy to clipboard"
        >
          <Clipboard size={14} className="sm:w-4 sm:h-4" />
          {copied && (
            <span className="absolute -top-7 sm:-top-8 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-800 text-white 
              text-[10px] sm:text-xs py-0.5 sm:py-1 px-1.5 sm:px-2 rounded whitespace-nowrap shadow-lg">Copied!</span>
          )}
        </button>
      </div>
    </div>
  );
});

const NestedObjectRenderer: React.FC<{
  keyName: string;
  value: DataType;
  parentKey: string;
}> = memo(({ keyName, value, parentKey }) => {
  const [isOpen, setIsOpen] = useState(false);
  const displayKey = parentKey ? `${parentKey}.${keyName}` : keyName;

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-xl 
      bg-white dark:bg-gray-900 overflow-hidden mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 
          bg-gray-50 dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-900 
          transition-colors duration-200"
      >
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {keyName}
        </span>
        {isOpen ? (
          <ChevronDown size={18} className="text-gray-500" />
        ) : (
          <ChevronRight size={18} className="text-gray-500" />
        )}
      </button>
      <div 
        className={`transition-all duration-300 ${isOpen ? 'p-4' : 'h-0 p-0 overflow-hidden'}`}
      >
        <div className="space-y-4">{renderObjectData(value, displayKey)}</div>
      </div>
    </div>
  );
});


const ArrayRenderer: React.FC<{
  keyName: string;
  value: unknown[];
  parentKey: string;
}> = memo(({ keyName, value, parentKey }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openRegions, setOpenRegions] = useState<boolean[]>(new Array(value.length).fill(false));
  const displayKey = parentKey ? `${parentKey}.${keyName}` : keyName;

  const toggleRegion = (index: number) => {
    setOpenRegions((prev) =>
      prev.map((isOpen, i) => (i === index ? !isOpen : isOpen))
    );
  };

  interface CountryItem {
    country?: string;
    regions?: string[];
  }
  const sortedCountries = [...value]
  .filter((item): item is CountryItem => !!item && typeof item === 'object' && 'country' in item && !!item.country)
  .sort((a: CountryItem, b: CountryItem) => 
    (a.country || '').localeCompare(b.country || '')
  );

  return (
    <>
  {displayKey === 'More Details.unblocked_countries' && ( <div className="border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 overflow-hidden mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors duration-200"
      >
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {keyName} ({value.length} items)
        </span>
        {isOpen ? (
          <ChevronDown size={18} className="text-gray-500" />
        ) : (
          <ChevronRight size={18} className="text-gray-500" />
        )}
      </button>
      <div
        className={`transition-all duration-300 ${isOpen ? 'p-4' : 'h-0 p-0 overflow-hidden'}`}
      >
        <div className="space-y-8">
          {/* Countries Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Countries</h3>
            <div className="">
              {sortedCountries.length > 0 ? (
                sortedCountries.map((item: any, index) => {
                  const itemKey = `${displayKey}.countries[${index}]`;
                  const country = item.country;
                  const regions = item.regions || [];
                  const displayValue = formatDisplayValue(country);
                  const isLong = isLongField(itemKey, country);
                  return (
                    <div key={itemKey} className={`col-span-4 ${isLong ? 'col-span-12' : ''}`}>
                      <button
                        onClick={() => toggleRegion(index)}
                        className="w-full text-left flex items-center justify-between px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                      >
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 break-words">{displayValue}</div>
                        </div>
                        {regions.length > 0 && (
                          openRegions[index] ? (
                            <ChevronDown size={16} className="text-gray-500" />
                          ) : (
                            <ChevronRight size={16} className="text-gray-500" />
                          )
                        )}
                      </button>
                      <div
                        className={`transition-all duration-300 ${openRegions[index] ? 'mt-2' : 'h-0 overflow-hidden'}`}
                      >
                        <div className="grid grid-cols-12 gap-4 pl-4">
                          {regions.length > 0 ? (
                            regions.map((region: string, regionIndex: number) => {
                              const regionKey = `${itemKey}.regions[${regionIndex}]`;
                              const regionValue = formatDisplayValue(region);
                              const isRegionLong = isLongField(regionKey, region);
                              return (
                                <FieldRenderer
                                  key={regionKey}
                                  keyName={``}
                                  value={regionValue}
                                  isLong={isRegionLong}
                                />
                              );
                            })
                          ) : (
                            <div className="col-span-12 text-gray-500 dark:text-gray-400 text-sm p-2">
                              All regions
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-12 text-gray-500 dark:text-gray-400 text-sm p-4">
                  No countries
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>)}</>
  );
});


const safeKey = (key: string | undefined): string => key ?? 'unknown';

const renderObjectData = (
  data: DataType | [string, unknown][],
  parentKey: string = ''
): JSX.Element[] => {
  const rows: JSX.Element[] = [];

  if (Array.isArray(data)) {
    let i = 0;
    while (i < data.length) {
      const entry = data[i];
      if (!Array.isArray(entry) || entry.length < 2) {
        i++;
        continue;
      }

      const [keyRaw, value] = entry;
      const key = safeKey(keyRaw);
      if (!key) {
        i++;
        continue;
      }

      const isObject =
        typeof value === 'object' &&
        value !== null &&
        !React.isValidElement(value);
      const isArray = Array.isArray(value);

      if (isArray) {
        rows.push(
          <ArrayRenderer
            key={key}
            keyName={key}
            value={value as unknown[]}
            parentKey={parentKey}
          />
        );
        i++;
      } else if (isObject) {
        rows.push(
          <NestedObjectRenderer
            key={key}
            keyName={key}
            value={value as DataType}
            parentKey={parentKey}
          />
        );
        i++;
      } else if (React.isValidElement(value)) {
        rows.push(
          <div key={`row-${i}`} className="grid grid-cols-12 gap-2 sm:gap-4 mb-2 sm:mb-4">
            <div className="col-span-12 sm:col-span-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg sm:rounded-xl p-2 sm:p-4">
              <span className="block text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 sm:mb-1.5 tracking-wide">
                {key}
              </span>
              <div className="flex items-center text-xs sm:text-sm">{value}</div>
            </div>
          </div>
        );
        i++;
      } else {
        const displayValue = formatDisplayValue(value);
        const isLong = isLongField(key, value);

        if ((!isLong || isLong) && i + 1 < data.length) {
          const nextEntry = data[i + 1];
          if (
            Array.isArray(nextEntry) &&
            nextEntry.length >= 2 &&
            typeof nextEntry[0] === 'string'
          ) {
            const [nextKeyRaw, nextValue] = nextEntry;
            const nextKey = safeKey(nextKeyRaw);
            const isNextObject =
              typeof nextValue === 'object' &&
              nextValue !== null &&
              !React.isValidElement(nextValue);

              const isNextArray = Array.isArray(nextValue);
              if ( !isNextObject && !isNextArray) {
              const nextDisplayValue = formatDisplayValue(nextValue);
              rows.push(
                <div key={`row-${i}`} className="grid grid-cols-12 gap-2 sm:gap-4 mb-2 sm:mb-4">
                  <FieldRenderer keyName={key} value={displayValue} isLong={false} />
                  <FieldRenderer keyName={nextKey} value={nextDisplayValue} isLong={false} />
                </div>
              );
              i += 2;
              continue;
            }
          }
        }

        rows.push(
          <div key={`row-${i}`} className="grid grid-cols-12 gap-2 sm:gap-4 mb-2 sm:mb-4">
            <FieldRenderer keyName={key} value={displayValue} isLong={isLong} />
          </div>
        );
        i++;
      }
    }
  } else {
    const keys = Object.keys(data);

    if (parentKey === '' && keys.length === 1 && keys[0]?.toLowerCase() === 'config') {
      const configKey = keys[0];
      return renderObjectData(data[configKey] as DataType, '');
    }

    let i = 0;
    while (i < keys.length) {
      const key = safeKey(keys[i]);
      const value = data[key];
      const isObject = typeof value === 'object' && value !== null && !Array.isArray(value);

      if (key.toLowerCase() === 'config' && isObject) {
        rows.push(...renderObjectData(value as DataType, parentKey));
        i++;
        continue;
      }

      if (key.toLowerCase() === 'submerchants' && isObject) {
        i++;
        continue;
      }

      if (Array.isArray(value)) {
        rows.push(
          <ArrayRenderer
            key={key}
            keyName={key}
            value={value}
            parentKey={parentKey}
          />
        );
      } else if (typeof value === 'object' && value !== null) {
        rows.push(
          <NestedObjectRenderer
            key={key}
            keyName={key}
            value={value as DataType}
            parentKey={parentKey}
          />
        );
      } else {
        const displayValue = formatDisplayValue(value);
        const isLong = isLongField(key, value);

        if ((!isLong || isLong) && i + 1 < keys.length) {
          const nextKey = safeKey(keys[i + 1]);
          const nextValue = data[nextKey];
          const isNextObject =
            typeof nextValue === 'object' && nextValue !== null && !Array.isArray(nextValue);
          const isNextArray = Array.isArray(nextValue);

          if (!isLongField(nextKey, nextValue) && !isNextObject && !isNextArray) {
            const nextDisplayValue = formatDisplayValue(nextValue);
            rows.push(
              <div key={`row-${i}`} className="grid grid-cols-12 gap-2 sm:gap-4 mb-2 sm:mb-4">
                <FieldRenderer keyName={key} value={displayValue} isLong={false} />
                <FieldRenderer keyName={nextKey} value={nextDisplayValue} isLong={false} />
              </div>
            );
            i += 2;
            continue;
          }
        }

        rows.push(
          <div key={`row-${i}`} className="grid grid-cols-12 gap-2 sm:gap-4 mb-2 sm:mb-4">
            <FieldRenderer keyName={key} value={displayValue} isLong={isLong} />
          </div>
        );
      }
      i++;
      
    }
  }

  return rows;
};

export default renderObjectData;