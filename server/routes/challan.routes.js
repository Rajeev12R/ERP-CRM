import express from "express";

import { createChallan, getChallans, getChallanById, confirmChallan, cancelChallan} from "../controllers/challan.controller.js";

import { authenticate, authorize} from "../middlewares/auth.middleware.js";

const router = express.Router();


router.post("/", authenticate, authorize("ADMIN", "SALES"), createChallan);
router.get("/", authenticate, authorize("ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"), getChallans);
router.get("/:id", authenticate, authorize("ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"), getChallanById);
router.put("/:id/confirm", authenticate, authorize("ADMIN", "SALES"), confirmChallan);
router.put("/:id/cancel", authenticate, authorize("ADMIN", "SALES"), cancelChallan);


export default router;