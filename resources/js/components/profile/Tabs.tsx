import React from 'react';

interface TabsProps {
    tabs: string[];
    current: number;
    onChange: (idx: number) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, current, onChange }) => (
    <div className="flex border-b mb-6">
        {tabs.map((tab, idx) => (
            <button
                key={tab}
                className={`px-6 py-2 -mb-px font-medium border-b-2 transition-colors duration-200 focus:outline-none ${current === idx
                    ? 'border-red-700 text-red-700 bg-white'
                    : 'border-transparent text-gray-500 hover:text-red-700'
                    }`}
                onClick={() => onChange(idx)}
                type="button"
            >
                {tab}
            </button>
        ))}
    </div>
);

export default Tabs;
