import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Filter,
} from "lucide-react";
import { apiClient } from "../lib/api";

interface Organization {
  id: string;
  name: string;
}

interface Sale {
  id: string;
  quantity: number;
  totalRevenue: number;
  totalCost: number;
  profit: number;
  saleDate: string;
  notes?: string;
  organizationId: string;
  organization: Organization;
  menuItem: {
    name: string;
  };
}

interface Loss {
  id: string;
  type: string;
  quantity: number;
  totalLoss: number;
  lossDate: string;
  reason?: string;
  organizationId: string;
  organization: Organization;
  menuItem?: {
    name: string;
  };
  stockItem?: {
    name: string;
  };
}

interface Summary {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  totalLoss: number;
  netProfit: number;
  salesCount: number;
  lossCount: number;
}

const InsightsReports: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [losses, setLosses] = useState<Loss[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    totalLoss: 0,
    netProfit: 0,
    salesCount: 0,
    lossCount: 0,
  });
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    organizationId: "",
    startDate: "",
    endDate: "",
    itemType: "", // 'sales', 'losses', or ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [salesData, lossData, orgData] = await Promise.all([
        apiClient.getSales(),
        apiClient.getLosses(),
        apiClient.getOrganizations(),
      ]);
      //@ts-ignore
      setSales(salesData);
      //@ts-ignore
      setLosses(lossData);
      //@ts-ignore
      setOrganizations(orgData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    try {
      const summaryData = await apiClient.getAnalyticsSummary(
        filters.organizationId || undefined,
        filters.startDate || undefined,
        filters.endDate || undefined
      );
      //@ts-ignore
      setSummary(summaryData);
    } catch (error) {
      console.error("Error applying filters:", error);
    }
  };

  const getFilteredData = () => {
    let filteredSales = [...sales];
    let filteredLosses = [...losses];

    if (filters.organizationId) {
      filteredSales = filteredSales.filter(
        (sale) => sale.organizationId === filters.organizationId
      );
      filteredLosses = filteredLosses.filter(
        (loss) => loss.organizationId === filters.organizationId
      );
    }

    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filteredSales = filteredSales.filter(
        (sale) => new Date(sale.saleDate) >= startDate
      );
      filteredLosses = filteredLosses.filter(
        (loss) => new Date(loss.lossDate) >= startDate
      );
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      filteredSales = filteredSales.filter(
        (sale) => new Date(sale.saleDate) <= endDate
      );
      filteredLosses = filteredLosses.filter(
        (loss) => new Date(loss.lossDate) <= endDate
      );
    }

    let combinedData: any[] = [];

    if (filters.itemType === "sales" || !filters.itemType) {
      combinedData = [
        ...combinedData,
        ...filteredSales.map((sale) => ({
          ...sale,
          type: "Sale",
          date: sale.saleDate,
          amount: sale.totalRevenue,
          itemName: sale.menuItem.name,
          organizationName: sale.organization.name,
        })),
      ];
    }

    if (filters.itemType === "losses" || !filters.itemType) {
      combinedData = [
        ...combinedData,
        ...filteredLosses.map((loss) => ({
          ...loss,
          type: "Loss",
          date: loss.lossDate,
          amount: -loss.totalLoss,
          itemName: loss.menuItem?.name || loss.stockItem?.name || "Unknown",
          organizationName: loss.organization.name,
        })),
      ];
    }

    return combinedData.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  const combinedData = getFilteredData();

  const clearFilters = () => {
    setFilters({
      organizationId: "",
      startDate: "",
      endDate: "",
      itemType: "",
    });
  };

  const stats = [
    {
      title: "Total Revenue",
      value: `${summary.totalRevenue}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Cost",
      value: `${summary.totalCost}`,
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Gross Profit",
      value: `${summary.totalProfit}`,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Losses",
      value: `${summary.totalLoss}`,
      icon: TrendingDown,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Net Profit",
      value: `${summary.netProfit}`,
      icon: BarChart3,
      color: summary.netProfit >= 0 ? "text-green-600" : "text-red-600",
      bgColor: summary.netProfit >= 0 ? "bg-green-100" : "bg-red-100",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">
          Chargement des statistiques...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Statistiques & Rapports
        </h2>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  {stat.title}
                </p>
                <p className={`text-2xl font-semibold ${stat.color}`}>
                  {stat.value} <span className=" text-sm opacity-75">DZD</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtres
          </h3>
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Réinitialiser
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organisation
            </label>
            <select
              value={filters.organizationId}
              onChange={(e) =>
                setFilters({ ...filters, organizationId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes les organisations</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de début
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de fin
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type d’article
            </label>
            <select
              value={filters.itemType}
              onChange={(e) =>
                setFilters({ ...filters, itemType: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les types</option>
              <option value="sales">Ventes seulement</option>
              <option value="losses">Pertes seulement</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tableau de données */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Toutes les transactions ({combinedData.length} enregistrements)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Article
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organisation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Détails
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {combinedData.map((item, index) => (
                <tr
                  key={`${item.type}-${item.id}-${index}`}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.type === "Sale"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.type === "Sale" ? "Vente" : "Perte"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.itemName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.organizationName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span
                      className={
                        item.amount >= 0 ? "text-green-600" : "text-red-600"
                      }
                    >
                      {item.amount >= 0 ? "+" : ""}DZD{" "}
                      {Math.abs(item.amount).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.type === "Sale" ? (
                      <div>
                        <div>Qté : {item.quantity}</div>
                        <div>Bénéfice : DZD {item.profit.toFixed(2)}</div>
                      </div>
                    ) : (
                      <div>
                        <div>Qté : {item.quantity}</div>
                        <div>Type : {item.type}</div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InsightsReports;
