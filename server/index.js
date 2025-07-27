import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Organizations endpoints
app.get("/api/organizations", async (req, res) => {
  try {
    const organizations = await prisma.organization.findMany({
      orderBy: { name: "asc" },
    });
    res.json(organizations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/organizations", async (req, res) => {
  try {
    const organization = await prisma.organization.create({
      data: req.body,
    });
    res.json(organization);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/organizations/:id", async (req, res) => {
  try {
    const organization = await prisma.organization.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(organization);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/organizations/:id", async (req, res) => {
  try {
    await prisma.organization.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stock items endpoints
app.get("/api/stock", async (req, res) => {
  try {
    const stockItems = await prisma.stockItem.findMany({
      include: { organization: true },
      orderBy: { name: "asc" },
    });
    res.json(stockItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/stock", async (req, res) => {
  try {
    const stockItem = await prisma.stockItem.create({
      data: req.body,
    });
    res.json(stockItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/stock/:id", async (req, res) => {
  try {
    const stockItem = await prisma.stockItem.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(stockItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/stock/:id", async (req, res) => {
  try {
    await prisma.stockItem.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Menu items endpoints
app.get("/api/menu", async (req, res) => {
  try {
    const menuItems = await prisma.menuItem.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/menu", async (req, res) => {
  try {
    const menuItem = await prisma.menuItem.create({
      data: req.body,
    });
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/menu/:id", async (req, res) => {
  try {
    const menuItem = await prisma.menuItem.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/menu/:id", async (req, res) => {
  try {
    await prisma.menuItem.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sales endpoints
app.get("/api/sales", async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      include: { organization: true, menuItem: true },
      orderBy: { saleDate: "desc" },
    });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/sales", async (req, res) => {
  try {
    const { quantity, unitPrice, costPrice, ...rest } = req.body;
    const totalRevenue = quantity * unitPrice;
    const totalCost = quantity * costPrice;
    const profit = totalRevenue - totalCost;

    const sale = await prisma.sale.create({
      data: {
        ...rest,
        quantity,
        unitPrice,
        costPrice,
        totalRevenue,
        totalCost,
        profit,
      },
    });
    res.json(sale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/sales/:id", async (req, res) => {
  try {
    await prisma.sale.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Losses endpoints
app.get("/api/losses", async (req, res) => {
  try {
    const losses = await prisma.loss.findMany({
      include: { organization: true, menuItem: true, stockItem: true },
      orderBy: { lossDate: "desc" },
    });
    res.json(losses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/losses", async (req, res) => {
  try {
    const { quantity, costPrice, expectedProfit, ...rest } = req.body;
    const totalLoss = quantity * (costPrice + expectedProfit);

    const loss = await prisma.loss.create({
      data: {
        ...rest,
        quantity,
        costPrice,
        expectedProfit,
        totalLoss,
      },
    });
    res.json(loss);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/losses/:id", async (req, res) => {
  try {
    await prisma.loss.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics endpoint
app.get("/api/analytics/summary", async (req, res) => {
  try {
    const { organizationId, startDate, endDate } = req.query;

    const whereClause = {
      ...(organizationId && { organizationId }),
      ...(startDate &&
        endDate && {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
    };

    const [sales, losses] = await Promise.all([
      prisma.sale.findMany({ where: whereClause }),
      prisma.loss.findMany({ where: whereClause }),
    ]);

    const totalRevenue = sales.reduce(
      (sum, sale) => sum + sale.totalRevenue,
      0
    );
    const totalCost = sales.reduce((sum, sale) => sum + sale.totalCost, 0);
    const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0);
    const totalLoss = losses.reduce((sum, loss) => sum + loss.totalLoss, 0);

    res.json({
      totalRevenue,
      totalCost,
      totalProfit,
      totalLoss,
      netProfit: totalProfit - totalLoss,
      salesCount: sales.length,
      lossCount: losses.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
