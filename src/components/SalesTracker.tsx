import React, { useState, useEffect } from "react";
import { Plus, DollarSign, Trash2 } from "lucide-react";
import { apiClient } from "../lib/api";

interface Organization {
  id: string;
  name: string;
}

interface MenuItem {
  id: string;
  name: string;
  costPrice: number;
  sellingPrice: number;
}

interface Sale {
  id: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  totalRevenue: number;
  totalCost: number;
  profit: number;
  saleDate: string;
  notes?: string;
  organizationId: string;
  menuItemId: string;
  organization: Organization;
  menuItem: MenuItem;
}

const SalesTracker: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    quantity: "",
    menuItemId: "",
    organizationId: "",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [salesData, menuData, orgData] = await Promise.all([
        apiClient.getSales(),
        apiClient.getMenuItems(),
        apiClient.getOrganizations(),
      ]);
      //@ts-ignore
      setSales(salesData);
      //@ts-ignore
      setMenuItems(menuData);
      //@ts-ignore
      setOrganizations(orgData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = selectedOrg
    ? sales.filter((sale) => sale.organizationId === selectedOrg)
    : sales;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedMenuItem = menuItems.find(
        (item) => item.id === formData.menuItemId
      );
      if (!selectedMenuItem) return;

      const data = {
        quantity: parseInt(formData.quantity),
        unitPrice: selectedMenuItem.sellingPrice,
        costPrice: selectedMenuItem.costPrice,
        organizationId: formData.organizationId,
        menuItemId: formData.menuItemId,
        notes: formData.notes,
      };

      await apiClient.createSale(data);
      resetForm();
      loadData();
    } catch (error) {
      console.error("Error saving sale:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      quantity: "",
      menuItemId: "",
      organizationId: "",
      notes: "",
    });
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this sale?")) {
      try {
        await apiClient.deleteSale(id);
        loadData();
      } catch (error) {
        console.error("Error deleting sale:", error);
      }
    }
  };

  const selectedMenuItem = menuItems.find(
    (item) => item.id === formData.menuItemId
  );
  const estimatedRevenue =
    selectedMenuItem && formData.quantity
      ? selectedMenuItem.sellingPrice * parseInt(formData.quantity)
      : 0;
  const estimatedCost =
    selectedMenuItem && formData.quantity
      ? selectedMenuItem.costPrice * parseInt(formData.quantity)
      : 0;
  const estimatedProfit = estimatedRevenue - estimatedCost;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">
          Chargement des données de vente...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Suivi des Ventes</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Enregistrer une vente
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filtrer par organisation
        </label>
        <select
          value={selectedOrg}
          onChange={(e) => setSelectedOrg(e.target.value)}
          className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Toutes les organisations</option>
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Nouvelle vente</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Article du menu
                </label>
                <select
                  value={formData.menuItemId}
                  onChange={(e) =>
                    setFormData({ ...formData, menuItemId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Sélectionner un article</option>
                  {menuItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} - ${item.sellingPrice.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantité
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organisation
                </label>
                <select
                  value={formData.organizationId}
                  onChange={(e) =>
                    setFormData({ ...formData, organizationId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Sélectionner une organisation</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optionnel)
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {selectedMenuItem && formData.quantity && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  Aperçu de la vente
                </h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Revenu :</span>
                    <span className="ml-2 font-semibold text-green-600">
                      ${estimatedRevenue.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Coût :</span>
                    <span className="ml-2 font-semibold text-red-600">
                      ${estimatedCost.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Bénéfice :</span>
                    <span className="ml-2 font-semibold text-blue-600">
                      ${estimatedProfit.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Enregistrer la vente
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Ventes Récentes
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
                  Article
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coût
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bénéfice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organisation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(sale.saleDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-green-500 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {sale.menuItem.name}
                        </div>
                        {sale.notes && (
                          <div className="text-sm text-gray-500">
                            {sale.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    {sale.totalRevenue.toFixed(2)}{" "}
                    <span className=" text-xs opacity-75">dzd</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                    {sale.totalCost.toFixed(2)}{" "}
                    <span className=" text-xs opacity-75">dzd</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {sale.profit.toFixed(2)}{" "}
                    <span className=" text-xs opacity-75">dzd</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.organization.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDelete(sale.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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

export default SalesTracker;
