import express from "express";
import {createCustomer, getCustomers, getCustomerById, updateCustomer, addFollowUp} from "../controllers/customer.controller.js";

import {authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authenticate, authorize("ADMIN", "SALES"), createCustomer);
router.get("/", authenticate, authorize("ADMIN", "SALES"), getCustomers);
router.get("/:id", authenticate, authorize("ADMIN", "SALES"), getCustomerById);
router.put("/:id", authenticate, authorize("ADMIN", "SALES"), updateCustomer);
router.post("/:id/followups", authenticate, authorize("ADMIN", "SALES"), addFollowUp);

export default router;