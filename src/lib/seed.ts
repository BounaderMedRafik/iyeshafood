import { prisma } from './prisma';

async function seed() {
  try {
    // Create sample organizations
    const org1 = await prisma.organization.create({
      data: {
        name: 'Downtown Branch',
        address: '123 Main St, Downtown',
      },
    });

    const org2 = await prisma.organization.create({
      data: {
        name: 'Uptown Branch',
        address: '456 Oak Ave, Uptown',
      },
    });

    const org3 = await prisma.organization.create({
      data: {
        name: 'Westside Branch',
        address: '789 Pine Rd, Westside',
      },
    });

    // Create sample menu items
    const menuItems = [
      { name: 'Margherita Pizza', category: 'Main Course', costPrice: 8.50, sellingPrice: 15.99 },
      { name: 'Chicken Tacos', category: 'Main Course', costPrice: 6.25, sellingPrice: 12.99 },
      { name: 'Caesar Salad', category: 'Appetizers', costPrice: 4.75, sellingPrice: 9.99 },
      { name: 'Chocolate Cake', category: 'Desserts', costPrice: 3.50, sellingPrice: 7.99 },
      { name: 'Coca Cola', category: 'Beverages', costPrice: 1.25, sellingPrice: 2.99 },
    ];

    for (const item of menuItems) {
      await prisma.menuItem.create({ data: item });
    }

    // Create sample stock items
    const stockItems = [
      { name: 'Tomatoes', category: 'Vegetables', unit: 'kg', costPerUnit: 3.50, currentStock: 25, organizationId: org1.id },
      { name: 'Chicken Breast', category: 'Meat', unit: 'kg', costPerUnit: 8.99, currentStock: 15, organizationId: org1.id },
      { name: 'Mozzarella Cheese', category: 'Dairy', unit: 'kg', costPerUnit: 12.50, currentStock: 8, organizationId: org1.id },
      { name: 'Flour', category: 'Other', unit: 'kg', costPerUnit: 2.25, currentStock: 50, organizationId: org2.id },
      { name: 'Olive Oil', category: 'Other', unit: 'liters', costPerUnit: 15.99, currentStock: 12, organizationId: org2.id },
    ];

    for (const item of stockItems) {
      await prisma.stockItem.create({ data: item });
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seed();