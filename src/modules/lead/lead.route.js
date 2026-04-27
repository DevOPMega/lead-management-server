import express from "express";
import LeadController from "./lead.controller.js";
import { userAuth } from "../../middleware/userAuth.js";
import upload from "../../middleware/uploadFile.js";

const leadRoute = express.Router();

leadRoute.get("/", userAuth, LeadController.getLeads);
leadRoute.get("/:id", userAuth, LeadController.getLeadById);
leadRoute.post("/create-lead", userAuth, LeadController.createLead);
leadRoute.patch("/remarks/:id", userAuth, LeadController.updateRemark);
leadRoute.patch("/follow-up/:id", userAuth, LeadController.updateFollowupHistroy);
leadRoute.post("/upload-excel", userAuth, upload.single("excelFile"), LeadController.importExcelFile);
leadRoute.patch("/change-status", userAuth, LeadController.changeLeadStatus);
leadRoute.patch("/change-temp", userAuth, LeadController.changeLeadTemp);


export default leadRoute;