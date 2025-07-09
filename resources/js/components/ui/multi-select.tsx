import React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface Option {
    value: number;
    label: string;
    name?: string;
    department?: string;
    role?: string;
}

interface MultiSelectProps {
    options: Option[];
    selected: number[];
    onChange: (selected: number[]) => void;
    placeholder?: string;
    renderOption?: (option: Option) => React.ReactNode;
    renderSelected?: (option: Option) => React.ReactNode;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
    options,
    selected,
    onChange,
    placeholder = "Select recipients",
    renderOption,
    renderSelected,
}) => {
    const handleToggle = (value: number) => {
        if (selected.includes(value)) {
            onChange(selected.filter((v) => v !== value));
        } else {
            onChange([...selected, value]);
        }
    };

    return (
        <PopoverPrimitive.Root>
            <PopoverPrimitive.Trigger asChild>
                <Button
                    variant="outline"
                    className="w-full justify-between min-h-[2.5rem] max-h-32 overflow-y-auto items-start"
                    style={{ whiteSpace: 'normal' }}
                >
                    <div className="flex flex-wrap gap-1 w-full text-left pr-2">
                        {selected.length === 0
                            ? <span className="text-gray-400">{placeholder}</span>
                            : options
                                .filter((opt) => selected.includes(opt.value))
                                .map((opt, idx) => (
                                    <span key={opt.value} className="inline-block align-middle bg-gray-100 dark:bg-gray-700 rounded px-2 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-200">
                                        {renderSelected ? renderSelected(opt) : opt.label}
                                        {idx < selected.length - 1 ? ',' : ''}
                                    </span>
                                ))}
                    </div>
                </Button>
            </PopoverPrimitive.Trigger>
            <PopoverPrimitive.Content className="w-full p-2 bg-white dark:bg-gray-800 rounded shadow-md z-50 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
                    {options.map((option) => (
                        <label
                            key={option.value}
                            className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded hover:bg-accent dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <Checkbox
                                checked={selected.includes(option.value)}
                                onCheckedChange={() => handleToggle(option.value)}
                                id={`multi-select-${option.value}`}
                            />
                            <span>{renderOption ? renderOption(option) : option.label}</span>
                        </label>
                    ))}
                </div>
            </PopoverPrimitive.Content>
        </PopoverPrimitive.Root>
    );
};
