import express from "express";
import LeadController from "./lead.controller.js";

const leadRoute = express.Router();

leadRoute.get("/", LeadController.getLeads);

export default leadRoute;