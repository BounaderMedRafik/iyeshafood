import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Building2 } from "lucide-react";
import { apiClient } from "../lib/api";

interface Organization {
  id: string;
  name: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

const OrganizationManager: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [formData, setFormData] = useState({ name: "", address: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getOrganizations();
      //@ts-ignore
      setOrganizations(data);
    } catch (error) {
      console.error("Erreur lors du chargement des organisations :", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingOrg) {
        await apiClient.updateOrganization(editingOrg.id, formData);
      } else {
        await apiClient.createOrganization(formData);
      }
      setFormData({ name: "", address: "" });
      setShowForm(false);
      setEditingOrg(null);
      loadOrganizations();
    } catch (error) {
      console.error(
        "Erreur lors de l'enregistrement de l'organisation :",
        error
      );
    }
  };

  const handleEdit = (org: Organization) => {
    setEditingOrg(org);
    setFormData({ name: org.name, address: org.address || "" });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette organisation ?")) {
      try {
        await apiClient.deleteOrganization(id);
        loadOrganizations();
      } catch (error) {
        console.error(
          "Erreur lors de la suppression de l'organisation :",
          error
        );
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">
          Chargement des organisations...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Organisations</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une organisation
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">
            {editingOrg
              ? "Modifier l'organisation"
              : "Ajouter une nouvelle organisation"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de l'organisation
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse (optionnelle)
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                {editingOrg ? "Mettre à jour" : "Créer"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingOrg(null);
                  setFormData({ name: "", address: "" });
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {organizations.map((org) => (
          <div key={org.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(org)}
                  className="text-gray-600 hover:text-blue-600"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(org.id)}
                  className="text-gray-600 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {org.name}
            </h3>
            {org.address && (
              <p className="text-gray-600 text-sm mb-2">{org.address}</p>
            )}
            <p className="text-gray-500 text-xs">
              Crée le : {new Date(org.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrganizationManager;
