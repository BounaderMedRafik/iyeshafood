import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Package, AlertTriangle } from "lucide-react";
import { apiClient } from "../lib/api";

interface Organization {
  id: string;
  name: string;
  address?: string;
}

interface StockItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  costPerUnit: number;
  currentStock: number;
  minStockLevel: number;
  organizationId: string;
  organization: Organization;
}

const StockManager: React.FC = () => {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    unit: "",
    costPerUnit: "",
    currentStock: "",
    minStockLevel: "",
    organizationId: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [stockData, orgData] = await Promise.all([
        apiClient.getStockItems(),
        apiClient.getOrganizations(),
      ]);
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

  const filteredItems = selectedOrg
    ? stockItems.filter((item) => item.organizationId === selectedOrg)
    : stockItems;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        costPerUnit: parseFloat(formData.costPerUnit),
        currentStock: parseFloat(formData.currentStock) || 0,
        minStockLevel: parseFloat(formData.minStockLevel) || 0,
      };

      if (editingItem) {
        await apiClient.updateStockItem(editingItem.id, data);
      } else {
        await apiClient.createStockItem(data);
      }

      resetForm();
      loadData();
    } catch (error) {
      console.error("Error saving stock item:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      unit: "",
      costPerUnit: "",
      currentStock: "",
      minStockLevel: "",
      organizationId: "",
    });
    setShowForm(false);
    setEditingItem(null);
  };

  const handleEdit = (item: StockItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      unit: item.unit,
      costPerUnit: item.costPerUnit.toString(),
      currentStock: item.currentStock.toString(),
      minStockLevel: item.minStockLevel.toString(),
      organizationId: item.organizationId,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this stock item?")) {
      try {
        await apiClient.deleteStockItem(id);
        loadData();
      } catch (error) {
        console.error("Error deleting stock item:", error);
      }
    }
  };

  const categories = [
    "Légumes",
    "Viande",
    "Produits laitiers",
    "Épices",
    "Nettoyage",
    "Emballage",
    "Autre",
  ];
  const units = [
    "kg",
    "g",
    "lb",
    "pièces",
    "litres",
    "ml",
    "bouteilles",
    "boîtes",
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">
          Chargement des articles en stock...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestion de Stock</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un article
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
          <h3 className="text-lg font-semibold mb-4">
            {editingItem ? "Modifier l'article" : "Ajouter un nouvel article"}
          </h3>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de l'article
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unité
              </label>
              <select
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Sélectionner une unité</option>
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coût par unité
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.costPerUnit}
                onChange={(e) =>
                  setFormData({ ...formData, costPerUnit: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock actuel
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.currentStock}
                onChange={(e) =>
                  setFormData({ ...formData, currentStock: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Niveau de stock minimum
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.minStockLevel}
                onChange={(e) =>
                  setFormData({ ...formData, minStockLevel: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
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
            <div className="md:col-span-2 flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                {editingItem ? "Mettre à jour" : "Créer"}
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
            Articles en Stock
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Article
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock actuel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coût/unité
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
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Package className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.name}
                        </div>
                        <div className="text-sm text-gray-500">{item.unit}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900 mr-2">
                        {item.currentStock.toFixed(2)}
                      </span>
                      {item.currentStock <= item.minStockLevel && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.costPerUnit.toFixed(2)}{" "}
                    <span className=" text-xs opacity-75">dzd</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.organization.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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

export default StockManager;
