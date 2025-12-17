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
      className={`group relative transition-all duration-300 hover:shadow-2xl rounded-2xl overflow-hidden
      ${isLong ? 'col-span-12' : 'col-span-12 sm:col-span-6'}
      `}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 via-slate-900/50 to-slate-800/50 
      opacity-100"></div>
      
      {/* Decorative corner glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-theme-1/20 to-theme-2/20 
      rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
      
      <div className="relative p-5 sm:p-6 border border-white/10 
      rounded-2xl bg-slate-900/80 backdrop-blur-md
      hover:border-theme-1/50 hover:bg-slate-900/90 transition-all duration-300
      shadow-lg shadow-black/20">
      
      {/* Single row layout with key, value, and copy button */}
      <div className="flex items-center justify-between gap-3">
      {/* Key label */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-1 h-6 rounded-full bg-gradient-to-b from-theme-1 to-theme-2"></div>
        <span className="text-xs sm:text-sm font-bold text-white/70 tracking-wider uppercase whitespace-nowrap">
        {keyName}
        </span>
      </div>
      
      {/* Value with glow effect */}
      <div className="relative flex-1 min-w-0">
        <div className="absolute -inset-1 bg-gradient-to-r from-theme-1/30 via-theme-2/30 to-theme-1/30 
        rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <span className="relative block text-sm sm:text-base text-white/90 
        bg-white/5 backdrop-blur-sm
        px-4 py-2.5 rounded-xl
        border-l-4 border-theme-1
        font-semibold truncate
        shadow-inner hover:bg-white/10 transition-all duration-300">
        {value}
        </span>
      </div>
      
      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300
        p-2.5 text-white/70 hover:text-white
        bg-white/5 hover:bg-white/10
        rounded-xl shadow-sm hover:shadow-lg border border-white/10 hover:border-white/20
        hover:scale-110 active:scale-95 transform"
        title="Copy to clipboard"
      >
        <Clipboard size={16} className="sm:w-[18px] sm:h-[18px]" />
      </button>
      </div>
      
      {copied && (
      <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-50
      bg-gradient-to-r from-theme-1 to-theme-2 text-white 
      text-xs font-bold py-2.5 px-6 
      rounded-full shadow-2xl shadow-theme-1/50 whitespace-nowrap
      animate-bounce flex items-center gap-2 border border-white/20">
        <span className="text-base">✓</span> Copied!
      </div>
      )}
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
        className={`transition-all duration-300 ${isOpen ? 'p-4 max-h-[60vh] overflow-y-auto' : 'h-0 p-0 overflow-hidden'}`}
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
        className={`transition-all duration-300 ${isOpen ? 'p-4 max-h-[60vh] overflow-y-auto' : 'h-0 p-0 overflow-hidden'}`}
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
          <div key={`row-${i}`} className="grid grid-cols-12 gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="col-span-12 sm:col-span-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-sm border border-indigo-500/20 rounded-2xl p-4 sm:p-5 hover:border-indigo-400/40 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 group">
              <span className="block text-[10px] sm:text-xs font-semibold text-indigo-400/80 mb-2 sm:mb-2.5 tracking-widest uppercase">
          {key}
              </span>
                <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 animate-pulse"></div>
                <div className="relative flex items-center justify-between p-3 sm:p-4 bg-gray-900/40 dark:bg-gray-950/60 backdrop-blur-md rounded-xl border border-indigo-500/30 dark:border-indigo-400/20 shadow-lg shadow-indigo-500/5">
                  <div className="flex-1 text-sm sm:text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 group-hover:from-indigo-300 group-hover:via-purple-300 group-hover:to-pink-300 transition-all duration-300">
                  {value}
                  </div>
                  <div className="ml-3 w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse shadow-lg shadow-indigo-500/50"></div>
                </div>
                </div>
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
          <div key={`row-${i}`} className="grid grid-cols-12 gap-4 sm:gap-5 mb-4 sm:mb-5">
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
          <div key={`row-${i}`} className="grid grid-cols-12 gap-4 sm:gap-5 mb-4 sm:mb-5">
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
              <div key={`row-${i}`} className="grid grid-cols-12 gap-4 sm:gap-5 mb-4 sm:mb-5">
          <FieldRenderer keyName={key} value={displayValue} isLong={false} />
          <FieldRenderer keyName={nextKey} value={nextDisplayValue} isLong={false} />
              </div>
            );
            i += 2;
            continue;
          }
        }

        rows.push(
          <div key={`row-${i}`} className="grid grid-cols-12 gap-4 sm:gap-5 mb-4 sm:mb-5">
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