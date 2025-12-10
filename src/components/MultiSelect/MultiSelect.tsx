/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Select from 'react-select'

const MultiSelect = ({ codes, selectedFilter, setSelectedFilter, placeholder }: any) => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';

    return (
        <Select
            options={codes}
            value={selectedFilter}
            onChange={setSelectedFilter}
            isMulti
            className="w-full"
            closeMenuOnSelect={false}
            placeholder={placeholder}
            menuPortalTarget={document.body}
            styles={{
                control: (provided) => ({
                    ...provided,
                    backgroundColor: isDarkMode ? 'rgb(255 255 255 / 0)' : 'white',
                    color: isDarkMode ? '#cbd5e1' : '#111827',
                    borderColor: 'transparent',
                    minHeight: window.innerWidth < 640 ? '36px' : '42px',
                    padding: window.innerWidth < 640 ? '1px 2px' : '2px 4px',
                    fontSize: window.innerWidth < 475 ? '10px' : window.innerWidth < 640 ? '12px' : '14px',
                }),
                menu: (provided) => ({
                    ...provided,
                    backgroundColor: isDarkMode ? 'rgb(255 255 255 / 0)' : 'white',
                    zIndex: 9999,
                }),
                menuPortal: (base) => ({
                    ...base,
                    zIndex: 9999, 
                  }),
                option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isSelected
                        ? (isDarkMode ? '#374151' : '#e5e7eb')
                        : isDarkMode
                            ? 'black'
                            : 'white',
                    color: state.isSelected
                        ? 'white'
                        : isDarkMode
                            ? '#cbd5e1'
                            : '#111827',
                    fontSize: window.innerWidth < 475 ? '10px' : window.innerWidth < 640 ? '12px' : '14px',
                    padding: window.innerWidth < 640 ? '6px 8px' : '8px 12px',
                }),
                multiValue: (provided) => ({
                    ...provided,
                    backgroundColor: isDarkMode ? '#374151' : '#e5e7eb',
                    borderRadius: window.innerWidth < 640 ? '4px' : '6px',
                    padding: window.innerWidth < 640 ? '1px 2px' : '2px 4px',
                    margin: window.innerWidth < 640 ? '1px' : '2px',
                }),
                multiValueLabel: (provided) => ({
                    ...provided,
                    color: isDarkMode ? 'white' : '#111827',
                    fontSize: window.innerWidth < 475 ? '9px' : window.innerWidth < 640 ? '11px' : '0.875rem',
                    padding: window.innerWidth < 640 ? '1px 3px' : '2px 6px',
                }),
                multiValueRemove: (provided) => ({
                    ...provided,
                    color: isDarkMode ? '#cbd5e1' : '#6b7280',
                    cursor: 'pointer',
                    ':hover': {
                        backgroundColor: isDarkMode ? '#4b5563' : '#d1d5db',
                        color: isDarkMode ? 'white' : '#111827',
                    },
                }),
                placeholder: (provided) => ({
                    ...provided,
                    color: isDarkMode ? '#cbd5e1' : '#6b7280',
                    fontSize: window.innerWidth < 475 ? '10px' : window.innerWidth < 640 ? '12px' : '14px',
                }),
                input: (provided) => ({
                    ...provided,
                    color: isDarkMode ? '#cbd5e1' : '#111827',
                    fontSize: window.innerWidth < 475 ? '10px' : window.innerWidth < 640 ? '12px' : '14px',
                }),
                valueContainer: (provided) => ({
                    ...provided,
                    padding: window.innerWidth < 640 ? '2px 4px' : '4px 8px',
                    maxHeight: window.innerWidth < 640 ? '200px' : '300px',
                    overflowY: 'auto',
                }),
            }}
        />
    );
}

export default MultiSelect;
