import express from "express";

import {stockIn,stockOut, getStockMovements, getLowStockProducts} from "../controllers/stock.controller.js";

import { authenticate, authorize} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/in", authenticate, authorize("ADMIN", "WAREHOUSE"), stockIn);
router.post("/out", authenticate, authorize("ADMIN", "WAREHOUSE"), stockOut);
router.get("/movements", authenticate, authorize("ADMIN", "WAREHOUSE"), getStockMovements);
router.get("/low-stock", authenticate, authorize("ADMIN", "WAREHOUSE"), getLowStockProducts);

export default router;