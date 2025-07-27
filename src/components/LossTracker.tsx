import React, { useState, useEffect } from "react";
import { Plus, AlertTriangle, Trash2 } from "lucide-react";
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

interface StockItem {
  id: string;
  name: string;
  costPerUnit: number;
  organization: Organization;
}

interface Loss {
  id: string;
  type: string;
  quantity: number;
  costPrice: number;
  expectedProfit: number;
  totalLoss: number;
  lossDate: string;
  reason?: string;
  organizationId: string;
  menuItemId?: string;
  stockItemId?: string;
  organization: Organization;
  menuItem?: MenuItem;
  stockItem?: StockItem;
}

const LossTracker: React.FC = () => {
  const [losses, setLosses] = useState<Loss[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "",
    quantity: "",
    itemType: "menu", // 'menu' or 'stock'
    menuItemId: "",
    stockItemId: "",
    organizationId: "",
    reason: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [lossData, menuData, stockData, orgData] = await Promise.all([
        apiClient.getLosses(),
        apiClient.getMenuItems(),
        apiClient.getStockItems(),
        apiClient.getOrganizations(),
      ]);
      //@ts-ignore
      setLosses(lossData);
      //@ts-ignore
      setMenuItems(menuData);
      //@ts-ignore
      setStockItems(stockData);
      //@ts-ignore
      setOrganizations(orgData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLosses = selectedOrg
    ? losses.filter((loss) => loss.organizationId === selectedOrg)
    : losses;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let costPrice = 0;
      let expectedProfit = 0;

      if (formData.itemType === "menu" && formData.menuItemId) {
        const selectedMenuItem = menuItems.find(
          (item) => item.id === formData.menuItemId
        );
        if (selectedMenuItem) {
          costPrice = selectedMenuItem.costPrice;
          expectedProfit =
            selectedMenuItem.sellingPrice - selectedMenuItem.costPrice;
        }
      } else if (formData.itemType === "stock" && formData.stockItemId) {
        const selectedStockItem = stockItems.find(
          (item) => item.id === formData.stockItemId
        );
        if (selectedStockItem) {
          costPrice = selectedStockItem.costPerUnit;
          expectedProfit = 0; // Stock items don't have direct profit
        }
      }

      const data = {
        type: formData.type,
        quantity: parseInt(formData.quantity),
        costPrice,
        expectedProfit,
        organizationId: formData.organizationId,
        menuItemId:
          formData.itemType === "menu" ? formData.menuItemId : undefined,
        stockItemId:
          formData.itemType === "stock" ? formData.stockItemId : undefined,
        reason: formData.reason,
      };

      await apiClient.createLoss(data);
      resetForm();
      loadData();
    } catch (error) {
      console.error("Error saving loss:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      type: "",
      quantity: "",
      itemType: "menu",
      menuItemId: "",
      stockItemId: "",
      organizationId: "",
      reason: "",
    });
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this loss record?")) {
      try {
        await apiClient.deleteLoss(id);
        loadData();
      } catch (error) {
        console.error("Error deleting loss:", error);
      }
    }
  };

  const lossTypes = [
    "consommation_personnel", // staff_consumption
    "périssable", // spoilers
    "gaspillage", // waste
    "endommagé", // damaged
    "vol", // theft
    "autre", // other
  ];

  const getSelectedItem = () => {
    if (formData.itemType === "menu" && formData.menuItemId) {
      return menuItems.find((item) => item.id === formData.menuItemId);
    } else if (formData.itemType === "stock" && formData.stockItemId) {
      return stockItems.find((item) => item.id === formData.stockItemId);
    }
    return null;
  };

  const selectedItem = getSelectedItem();
  const estimatedCost =
    selectedItem && formData.quantity
      ? //@ts-ignore
        (selectedItem.costPrice || selectedItem.costPerUnit) *
        parseInt(formData.quantity)
      : 0;
  const estimatedProfit =
    selectedItem && formData.quantity && "sellingPrice" in selectedItem
      ? (selectedItem.sellingPrice - selectedItem.costPrice) *
        parseInt(formData.quantity)
      : 0;
  const totalLoss = estimatedCost + estimatedProfit;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">
          Chargement des données de perte...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Suivi des Pertes</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Enregistrer une Perte
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filtrer par Organisation
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
          <h3 className="text-lg font-semibold mb-4">Nouvelle Perte</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de Perte
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Sélectionner un type</option>
                  {lossTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.replace("_", " ").toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type d'Article
                </label>
                <select
                  value={formData.itemType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      itemType: e.target.value,
                      menuItemId: "",
                      stockItemId: "",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="menu">Article du Menu</option>
                  <option value="stock">Article en Stock</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.itemType === "menu"
                    ? "Article du Menu"
                    : "Article en Stock"}
                </label>
                <select
                  value={
                    formData.itemType === "menu"
                      ? formData.menuItemId
                      : formData.stockItemId
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [formData.itemType === "menu"
                        ? "menuItemId"
                        : "stockItemId"]: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">
                    Sélectionner un article{" "}
                    {formData.itemType === "menu" ? "du menu" : "en stock"}
                  </option>
                  {(formData.itemType === "menu" ? menuItems : stockItems).map(
                    (item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} -
                        {
                          //@ts-ignore
                          (item.costPrice || item.costPerUnit).toFixed(2)
                        }{" "}
                        <span className=" text-xs opacity-75">dzd</span>
                      </option>
                    )
                  )}
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
                  Raison (optionnelle)
                </label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {selectedItem && formData.quantity && (
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  Aperçu des Pertes
                </h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Coût perdu :</span>
                    <span className="ml-2 font-semibold text-red-600">
                      {estimatedCost.toFixed(2)}{" "}
                      <span className=" text-xs opacity-75">dzd</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Perte de profit :</span>
                    <span className="ml-2 font-semibold text-red-600">
                      {estimatedProfit.toFixed(2)}{" "}
                      <span className=" text-xs opacity-75">dzd</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Perte totale :</span>
                    <span className="ml-2 font-semibold text-red-700">
                      {totalLoss.toFixed(2)}{" "}
                      <span className=" text-xs opacity-75">dzd</span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Enregistrer
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
            Historique des Pertes
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
                  Quantité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Perte Totale
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
              {filteredLosses.map((loss) => (
                <tr key={loss.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(loss.lossDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      {loss.type.replace("_", " ").toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {loss.menuItem?.name || loss.stockItem?.name}
                        </div>
                        {loss.reason && (
                          <div className="text-sm text-gray-500">
                            {loss.reason}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {loss.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                    {loss.totalLoss.toFixed(2)}{" "}
                    <span className=" text-xs opacity-75">dzd</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {loss.organization.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDelete(loss.id)}
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

export default LossTracker;
