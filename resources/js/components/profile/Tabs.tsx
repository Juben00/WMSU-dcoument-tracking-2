import type React from "react"
import { cn } from "@/lib/utils"

interface TabsProps {
    tabs: string[]
    current: number
    onChange: (idx: number) => void
    className?: string
}

const MinimalTabs: React.FC<TabsProps> = ({ tabs, current, onChange, className }) => {
    return (
        <div className={cn("w-full max-w-2xl mx-auto", className)}>
            <nav className="flex space-x-12" aria-label="Tabs">
                {tabs.map((tab, idx) => (
                    <button
                        key={tab}
                        className={cn(
                            "pb-4 text-sm font-medium transition-colors duration-200 border-b-2",
                            "focus:outline-none focus:ring-0",
                            current === idx ? "border-red-700 text-red-700" : "border-transparent text-gray-500",
                        )}
                        onClick={() => onChange(idx)}
                        type="button"
                        role="tab"
                        aria-selected={current === idx}
                        aria-controls={`tabpanel-${idx}`}
                        id={`tab-${idx}`}
                    >
                        {tab}
                    </button>
                ))}
            </nav>
        </div>
    )
}

export default MinimalTabs
