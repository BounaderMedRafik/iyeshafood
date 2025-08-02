import React from "react";
import {
  Building2,
  Package,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  currentTab: string;
  onTabChange: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  currentTab,
  onTabChange,
}) => {
  const tabs = [
    { id: "organizations", label: "Organisations", icon: Building2 },
    { id: "stock", label: "Gestion de Stock", icon: Package },
    { id: "sales", label: "Suivi des Ventes", icon: TrendingUp },
    { id: "losses", label: "Suivi des Pertes", icon: TrendingDown },
    { id: "insights", label: "Statistiques & Rapports", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <h1 className="ml-3 text-xl font-bold text-gray-900">
                IYSHA-FOOD Restaurant Management
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex space-x-8 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                currentTab === tab.id
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>

        <main>{children}</main>
      </div>
    </div>
  );
};

export default Layout;
