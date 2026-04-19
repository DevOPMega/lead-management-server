import mongoose from "mongoose";
import csv from "csvtojson";
import connectDb from "../config/db.js";
import LeadModel from "../modules/lead/lead.model.js";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔹 CSV FILE PATH
const CSV_FILE_PATH = path.join(__dirname, "./data/CRM DATA.csv");

// 🔹 Helper Functions
const cleanString = (val) => (val ? val.trim() : "");

const splitToArray = (val) =>
    val ? val.split(",").map((v) => v.trim()).filter(Boolean) : [];

const getSource = (website) => {
    if (!website) return "Other";
    if (website.includes("linkedin")) return "LinkedIn";
    return "Website";
};

const seedCSVLeadsIntoDB = async () => {
    await mongoose.connect("mongodb://localhost:27017/lead-management?replicaSet=rs0");

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        console.log("📥 Reading CSV...");

        const csvData = await csv().fromFile(CSV_FILE_PATH);

        console.log(`📊 Total rows in CSV: ${csvData.length}`);

        // 🔹 Get existing company names (to avoid duplicates)
        const existingLeads = await LeadModel.find({}, { name: 1 }).lean();
        const existingNames = new Set(existingLeads.map((l) => l.name.toLowerCase()));

        const leadsToInsert = [];

        for (const row of csvData) {
            const name = cleanString(row["Business Name"]);

            if (!name) continue;

            // ❌ Skip duplicate
            if (existingNames.has(name.toLowerCase())) continue;

            const phone1 = cleanString(row["Phone Number 1"]);
            const phone2 = cleanString(row["Phone Number 2"]);
            const hrPhone = cleanString(row["HR Phone"]);

            const email = cleanString(row["General Email"]);
            const hrEmail = cleanString(row["HR Email"]);

            const contacts = [];

            if (phone1 || email) {
                contacts.push({
                    name: name,
                    phone: phone1,
                    email: email,
                    isPrimary: true,
                });
            }

            if (phone2) {
                contacts.push({
                    name: name,
                    phone: phone2,
                    isPrimary: false,
                });
            }

            const hrContacts = [];
            if (hrPhone || hrEmail) {
                hrContacts.push({
                    phone: hrPhone,
                    email: hrEmail,
                });
            }

            const leadDoc = {
                name,
                company: name,
                website: cleanString(row["Website"]),
                industry: cleanString(row["Category"]),

                city: cleanString(row["City/Emirate"]),
                address: cleanString(row["Area/Location"]),

                source: getSource(row["Website"]),
                sourceDetails: "CSV Import",

                contacts,
                hrContacts,

                status:
                    row["Status"] === "not-interested"
                        ? "not-interested"
                        : "new",

                temperature: "cold",
                score: 0,

                tags: splitToArray(row["Category"]),

                remarks: cleanString(row["Remarks"]),

                linkedinUrl: "",
                companySize: "",
            };

            leadsToInsert.push(leadDoc);
            existingNames.add(name.toLowerCase()); // prevent duplicates within same CSV
        }

        console.log(`✅ New leads to insert: ${leadsToInsert.length}`);

        // 🔹 Bulk Insert (FAST)
        if (leadsToInsert.length > 0) {
            await LeadModel.insertMany(leadsToInsert, {
                session,
                ordered: false, // skip failed docs, continue others
            });
        }

        await session.commitTransaction();
        session.endSession();

        console.log("🎉 Seeding completed successfully!");
        process.exit(0);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error("❌ Seeding failed:", error.message);
        process.exit(1);
    }
};

seedCSVLeadsIntoDB();