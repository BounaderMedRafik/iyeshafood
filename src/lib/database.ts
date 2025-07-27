import { prisma } from './prisma';
import type { Organization, StockItem, MenuItem, Sale, Loss } from '@prisma/client';

export type { Organization, StockItem, MenuItem, Sale, Loss };

// Organization operations
export const organizationService = {
  getAll: () => prisma.organization.findMany({
    orderBy: { name: 'asc' },
  }),
  
  create: (data: { name: string; address?: string }) => 
    prisma.organization.create({ data }),
  
  update: (id: string, data: { name?: string; address?: string }) =>
    prisma.organization.update({ where: { id }, data }),
  
  delete: (id: string) => prisma.organization.delete({ where: { id } }),
};

// Stock item operations
export const stockService = {
  getAll: () => prisma.stockItem.findMany({
    include: { organization: true },
    orderBy: { name: 'asc' },
  }),
  
  getByOrganization: (organizationId: string) => 
    prisma.stockItem.findMany({
      where: { organizationId },
      include: { organization: true },
      orderBy: { name: 'asc' },
    }),
  
  create: (data: {
    name: string;
    category: string;
    unit: string;
    costPerUnit: number;
    currentStock?: number;
    minStockLevel?: number;
    organizationId: string;
  }) => prisma.stockItem.create({ data }),
  
  update: (id: string, data: Partial<Omit<StockItem, 'id' | 'createdAt' | 'updatedAt'>>) =>
    prisma.stockItem.update({ where: { id }, data }),
  
  delete: (id: string) => prisma.stockItem.delete({ where: { id } }),
};

// Menu item operations
export const menuService = {
  getAll: () => prisma.menuItem.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  }),
  
  create: (data: {
    name: string;
    category: string;
    costPrice: number;
    sellingPrice: number;
    description?: string;
  }) => prisma.menuItem.create({ data }),
  
  update: (id: string, data: Partial<Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>>) =>
    prisma.menuItem.update({ where: { id }, data }),
  
  delete: (id: string) => prisma.menuItem.update({ 
    where: { id }, 
    data: { isActive: false } 
  }),
};

// Sales operations
export const salesService = {
  getAll: () => prisma.sale.findMany({
    include: { organization: true, menuItem: true },
    orderBy: { saleDate: 'desc' },
  }),
  
  getByDateRange: (startDate: Date, endDate: Date) => 
    prisma.sale.findMany({
      where: {
        saleDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: { organization: true, menuItem: true },
      orderBy: { saleDate: 'desc' },
    }),
  
  getByOrganization: (organizationId: string) => 
    prisma.sale.findMany({
      where: { organizationId },
      include: { organization: true, menuItem: true },
      orderBy: { saleDate: 'desc' },
    }),
  
  create: (data: {
    quantity: number;
    unitPrice: number;
    costPrice: number;
    organizationId: string;
    menuItemId: string;
    notes?: string;
  }) => {
    const totalRevenue = data.quantity * data.unitPrice;
    const totalCost = data.quantity * data.costPrice;
    const profit = totalRevenue - totalCost;
    
    return prisma.sale.create({
      data: {
        ...data,
        totalRevenue,
        totalCost,
        profit,
      },
    });
  },
  
  delete: (id: string) => prisma.sale.delete({ where: { id } }),
};

// Loss operations
export const lossService = {
  getAll: () => prisma.loss.findMany({
    include: { organization: true, menuItem: true, stockItem: true },
    orderBy: { lossDate: 'desc' },
  }),
  
  getByDateRange: (startDate: Date, endDate: Date) => 
    prisma.loss.findMany({
      where: {
        lossDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: { organization: true, menuItem: true, stockItem: true },
      orderBy: { lossDate: 'desc' },
    }),
  
  getByOrganization: (organizationId: string) => 
    prisma.loss.findMany({
      where: { organizationId },
      include: { organization: true, menuItem: true, stockItem: true },
      orderBy: { lossDate: 'desc' },
    }),
  
  create: (data: {
    type: string;
    quantity: number;
    costPrice: number;
    expectedProfit: number;
    organizationId: string;
    menuItemId?: string;
    stockItemId?: string;
    reason?: string;
  }) => {
    const totalLoss = data.quantity * (data.costPrice + data.expectedProfit);
    
    return prisma.loss.create({
      data: {
        ...data,
        totalLoss,
      },
    });
  },
  
  delete: (id: string) => prisma.loss.delete({ where: { id } }),
};

// Analytics operations
export const analyticsService = {
  getSummary: async (organizationId?: string, startDate?: Date, endDate?: Date) => {
    const whereClause = {
      ...(organizationId && { organizationId }),
      ...(startDate && endDate && {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      }),
    };

    const [sales, losses] = await Promise.all([
      prisma.sale.findMany({ where: whereClause }),
      prisma.loss.findMany({ where: whereClause }),
    ]);

    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalRevenue, 0);
    const totalCost = sales.reduce((sum, sale) => sum + sale.totalCost, 0);
    const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0);
    const totalLoss = losses.reduce((sum, loss) => sum + loss.totalLoss, 0);

    return {
      totalRevenue,
      totalCost,
      totalProfit,
      totalLoss,
      netProfit: totalProfit - totalLoss,
      salesCount: sales.length,
      lossCount: losses.length,
    };
  },
};