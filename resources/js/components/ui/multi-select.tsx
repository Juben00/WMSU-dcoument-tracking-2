import React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface Option {
    value: number;
    label: string;
}

interface MultiSelectProps {
    options: Option[];
    selected: number[];
    onChange: (selected: number[]) => void;
    placeholder?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
    options,
    selected,
    onChange,
    placeholder = "Select recipients",
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
                    className="w-full justify-between"
                >
                    <span>
                        {selected.length === 0
                            ? placeholder
                            : options
                                .filter((opt) => selected.includes(opt.value))
                                .map((opt) => opt.label)
                                .join(", ")}
                    </span>
                </Button>
            </PopoverPrimitive.Trigger>
            <PopoverPrimitive.Content className="w-full p-2 bg-white rounded shadow-md z-50">
                <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
                    {options.map((option) => (
                        <label
                            key={option.value}
                            className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded hover:bg-accent"
                        >
                            <Checkbox
                                checked={selected.includes(option.value)}
                                onCheckedChange={() => handleToggle(option.value)}
                                id={`multi-select-${option.value}`}
                            />
                            <span>{option.label}</span>
                        </label>
                    ))}
                </div>
            </PopoverPrimitive.Content>
        </PopoverPrimitive.Root>
    );
};
