import express from "express";

import {createProduct, getProducts, getProductById, updateProduct} from "../controllers/product.controller.js";

import { authenticate, authorize} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authenticate,authorize("ADMIN", "WAREHOUSE"), createProduct);
router.get("/", authenticate, authorize("ADMIN", "SALES", "WAREHOUSE"), getProducts);
router.get("/:id", authenticate, authorize("ADMIN", "SALES", "WAREHOUSE"), getProductById);
router.put("/:id", authenticate, authorize("ADMIN", "WAREHOUSE"), updateProduct);

export default router;