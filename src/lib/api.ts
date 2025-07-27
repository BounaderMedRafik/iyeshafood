const API_BASE_URL = "http://localhost:3001/api";

class ApiClient {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Organizations
  async getOrganizations() {
    return this.request("/organizations");
  }

  async createOrganization(data: { name: string; address?: string }) {
    return this.request("/organizations", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateOrganization(
    id: string,
    data: { name?: string; address?: string }
  ) {
    return this.request(`/organizations/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteOrganization(id: string) {
    return this.request(`/organizations/${id}`, {
      method: "DELETE",
    });
  }

  // Stock Items
  async getStockItems() {
    return this.request("/stock");
  }

  async createStockItem(data: any) {
    return this.request("/stock", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateStockItem(id: string, data: any) {
    return this.request(`/stock/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteStockItem(id: string) {
    return this.request(`/stock/${id}`, {
      method: "DELETE",
    });
  }

  // Menu Items
  async getMenuItems() {
    return this.request("/menu");
  }

  async createMenuItem(data: any) {
    return this.request("/menu", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateMenuItem(id: string, data: any) {
    return this.request(`/menu/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteMenuItem(id: string) {
    return this.request(`/menu/${id}`, {
      method: "DELETE",
    });
  }

  // Sales
  async getSales() {
    return this.request("/sales");
  }

  async createSale(data: any) {
    return this.request("/sales", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async deleteSale(id: string) {
    return this.request(`/sales/${id}`, {
      method: "DELETE",
    });
  }

  // Losses
  async getLosses() {
    return this.request("/losses");
  }

  async createLoss(data: any) {
    return this.request("/losses", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async deleteLoss(id: string) {
    return this.request(`/losses/${id}`, {
      method: "DELETE",
    });
  }

  // Analytics
  async getAnalyticsSummary(
    organizationId?: string,
    startDate?: string,
    endDate?: string
  ) {
    const params = new URLSearchParams();
    if (organizationId) params.append("organizationId", organizationId);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const query = params.toString() ? `?${params.toString()}` : "";
    return this.request(`/analytics/summary${query}`);
  }
}

export const apiClient = new ApiClient();
