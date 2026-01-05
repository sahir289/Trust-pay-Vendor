/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
import React, { memo, useState, createContext, useContext } from 'react';
import { Clipboard, ChevronDown, ChevronRight, Check } from 'lucide-react';

type DataType = Record<string, unknown> | unknown[];

// Create a context for dark mode
const DarkModeContext = createContext<boolean>(false);

// Export a provider component to wrap the renderObjectData usage
export const OtherDetailsProvider: React.FC<{ darkMode: boolean; children: React.ReactNode }> = ({ darkMode, children }) => {
  return (
    <DarkModeContext.Provider value={darkMode}>
      {children}
    </DarkModeContext.Provider>
  );
};

// Custom hook to use dark mode within this file
const useDarkMode = () => useContext(DarkModeContext);

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
  const darkMode = useDarkMode();

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
      <div className={`absolute inset-0 opacity-100 ${
        darkMode 
          ? 'bg-gradient-to-br from-slate-800/50 via-slate-900/50 to-slate-800/50'
          : 'bg-gradient-to-br from-slate-100/80 via-white/80 to-slate-100/80'
      }`}></div>
      
      {/* Decorative corner glow */}
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity ${
        darkMode 
          ? 'bg-gradient-to-br from-theme-1/20 to-theme-2/20'
          : 'bg-gradient-to-br from-theme-1/10 to-theme-2/10'
      }`}></div>
      
      <div className={`relative p-5 sm:p-6 border rounded-2xl backdrop-blur-md transition-all duration-300 shadow-lg ${
        darkMode 
          ? 'border-white/10 bg-slate-900/80 hover:border-theme-1/50 hover:bg-slate-900/90 shadow-black/20'
          : 'border-slate-200 bg-white/90 hover:border-theme-1/30 hover:bg-white shadow-slate-200/50'
      }`}>
      
        {/* Single row layout with key, value, and copy button */}
        <div className="flex items-center justify-between gap-3">
          {/* Key label */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-theme-1 to-theme-2"></div>
            <span className={`text-xs sm:text-sm font-bold tracking-wider uppercase whitespace-nowrap ${
              darkMode ? 'text-white/70' : 'text-slate-500'
            }`}>
              {keyName}
            </span>
          </div>
          
          {/* Value with glow effect */}
          <div className="relative flex-1 min-w-0">
            <div className={`absolute -inset-1 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
              darkMode 
                ? 'bg-gradient-to-r from-theme-1/30 via-theme-2/30 to-theme-1/30'
                : 'bg-gradient-to-r from-theme-1/20 via-theme-2/20 to-theme-1/20'
            }`}></div>
            
            <span className={`relative block text-sm sm:text-base px-4 py-2.5 rounded-xl border-l-4 border-theme-1 font-semibold truncate transition-all duration-300 ${
              darkMode 
                ? 'text-white/90 bg-white/5 backdrop-blur-sm shadow-inner hover:bg-white/10'
                : 'text-slate-800 bg-slate-50 shadow-inner hover:bg-slate-100'
            }`}>
              {value}
            </span>
          </div>
          
          {/* Copy button */}
          <button
            onClick={handleCopy}
            className={`flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 p-2.5 rounded-xl shadow-sm hover:shadow-lg hover:scale-110 active:scale-95 transform ${
              darkMode 
                ? 'text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20'
                : 'text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-slate-300'
            }`}
            title="Copy to clipboard"
          >
            {copied ? (
              <Check size={16} className="text-emerald-500 sm:w-[18px] sm:h-[18px]" />
            ) : (
              <Clipboard size={16} className="sm:w-[18px] sm:h-[18px]" />
            )}
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
  const darkMode = useDarkMode();

  return (
    <div className={`rounded-xl overflow-hidden mb-4 ${
      darkMode 
        ? 'border border-gray-800 bg-gray-900'
        : 'border border-gray-200 bg-white'
    }`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 transition-colors duration-200 ${
          darkMode 
            ? 'bg-gray-950 hover:bg-gray-900'
            : 'bg-gray-50 hover:bg-gray-100'
        }`}
      >
        <span className={`text-sm font-semibold ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {keyName}
        </span>
        {isOpen ? (
          <ChevronDown size={18} className={darkMode ? 'text-gray-500' : 'text-gray-500'} />
        ) : (
          <ChevronRight size={18} className={darkMode ? 'text-gray-500' : 'text-gray-500'} />
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
  const darkMode = useDarkMode();

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
      {displayKey === 'More Details.unblocked_countries' && (
        <div className={`rounded-xl overflow-hidden mb-4 ${
          darkMode 
            ? 'border border-gray-800 bg-gray-900'
            : 'border border-gray-200 bg-white'
        }`}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full flex items-center justify-between px-4 py-3 transition-colors duration-200 ${
              darkMode 
                ? 'bg-gray-950 hover:bg-gray-900'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <span className={`text-sm font-semibold ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
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
                <h3 className={`text-lg font-semibold mb-4 ${
                  darkMode ? 'text-gray-200' : 'text-gray-800'
                }`}>Countries</h3>
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
                            className={`w-full text-left flex items-center justify-between px-2 py-2 rounded ${
                              darkMode 
                                ? 'hover:bg-gray-800'
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            <div>
                              <div className={`text-sm break-words ${
                                darkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}>{displayValue}</div>
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
                                <div className={`col-span-12 text-sm p-2 ${
                                  darkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  All regions
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className={`col-span-12 text-sm p-4 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      No countries
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
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
            <ReactElementField keyName={key} value={value} />
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
            if (!isNextObject && !isNextArray) {
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

// New component for React element values with dark mode support
const ReactElementField: React.FC<{
  keyName: string;
  value: React.ReactElement;
}> = memo(({ keyName, value }) => {
  const darkMode = useDarkMode();

  return (
    <div className={`col-span-12 sm:col-span-6 rounded-2xl p-4 sm:p-5 transition-all duration-300 group ${
      darkMode 
        ? 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-sm border border-indigo-500/20 hover:border-indigo-400/40 hover:shadow-lg hover:shadow-indigo-500/10'
        : 'bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-200/50'
    }`}>
      <span className={`block text-[10px] sm:text-xs font-semibold mb-2 sm:mb-2.5 tracking-widest uppercase ${
        darkMode ? 'text-indigo-400/80' : 'text-indigo-600/80'
      }`}>
        {keyName}
      </span>
      <div className={`relative overflow-hidden`}>
        <div className={`absolute inset-0 animate-pulse ${
          darkMode 
            ? 'bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5'
            : 'bg-gradient-to-r from-indigo-100/50 via-purple-100/50 to-pink-100/50'
        }`}></div>
        <div className={`relative flex items-center justify-between p-3 sm:p-4 backdrop-blur-md rounded-xl shadow-lg ${
          darkMode 
            ? 'bg-gray-900/40 border border-indigo-500/30 shadow-indigo-500/5'
            : 'bg-white/80 border border-indigo-200 shadow-indigo-100/50'
        }`}>
          <div className={`flex-1 text-sm sm:text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r transition-all duration-300 ${
            darkMode 
              ? 'from-indigo-400 via-purple-400 to-pink-400 group-hover:from-indigo-300 group-hover:via-purple-300 group-hover:to-pink-300'
              : 'from-indigo-600 via-purple-600 to-pink-600 group-hover:from-indigo-500 group-hover:via-purple-500 group-hover:to-pink-500'
          }`}>
            {value}
          </div>
          <div className={`ml-3 w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse shadow-lg ${
            darkMode ? 'shadow-indigo-500/50' : 'shadow-indigo-400/50'
          }`}></div>
        </div>
      </div>
    </div>
  );
});

export default renderObjectData;