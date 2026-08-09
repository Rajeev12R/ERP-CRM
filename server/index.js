import "dotenv/config";
import express from "express";
import prisma from "./config/prisma.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import productRoutes from "./routes/product.routes.js";
import stockRoutes from "./routes/stock.routes.js";
import challanRoutes from "./routes/challan.routes.js";

import cors from "cors";

const app = express();
const port = process.env.PORT;

app.use(cors({
    origin: [
        'http://localhost:5173', 
        'https://erp-crm-pi.vercel.app', 
        process.env.CLIENT_URL
    ].filter(Boolean),
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/challans", challanRoutes);

app.get('/api/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        console.log("Server and database are working");
        res.status(200).json({
            success: true,
            message: "Server and database are working"
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Database connection failed"
        });
    }
});



app.listen(port, () => {
    console.log(`Server Started at PORT: ${port}`);
});