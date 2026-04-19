import express from "express";
import LeadController from "./lead.controller.js";
import { userAuth } from "../../middleware/userAuth.js";
import upload from "../../middleware/uploadFile.js";

const leadRoute = express.Router();

leadRoute.get("/", userAuth, LeadController.getLeads);
leadRoute.post("/create-lead", userAuth, LeadController.createLead);
leadRoute.post("/upload-excel", userAuth, upload.single("excelFile"), LeadController.importExcelFile);

export default leadRoute;