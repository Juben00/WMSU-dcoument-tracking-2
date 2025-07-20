import { BarChart3, Building, FileText } from "lucide-react"

interface TabHeaderProps {
    title: string
    description: string
}

const icons = {
    documents: <FileText className="w-7 h-7 text-white" />,
    department: <Building className="w-7 h-7 text-white" />,
    dashboard: <BarChart3 className="w-7 h-7 text-white" />,
}

export default function TabHeader({ title, description }: TabHeaderProps) {
    const iconKey = title.toLowerCase() as keyof typeof icons;
    const icon = icons[iconKey] || <Building className="w-7 h-7 text-white" />;

    return (
        <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-xl">
                {icon}
            </div>
            <div>
                <h1 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    {description}
                </p>
            </div>
        </div>
    );
}
