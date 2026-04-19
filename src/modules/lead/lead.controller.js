const city = ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Fujairah", "Ras Al Khaimah"]
import createHttpError from "http-errors";
import log from "../../logs/index.js";
import LeadModel, { City, Industry, Source, Status } from "./lead.model.js";
import { CreateLeadSchema } from "./lead.validator.js";
import XLSX from "xlsx";
import { cleanString, getSource, splitToArray } from "../../utils/lead.js";
import mongoose from "mongoose";


const LeadController = {
    getLeads: async (req, res, next) => {
        try {
            const {
                page = 1,
                limit = 50,
                search,
                industry,
                city,
                country,
                source,
                status,
                isArchived,
            } = req.query;

            const filter = {};

            if (search) {
                filter.$or = [
                    { company: { $regex: search, $options: "i" } },
                ];
            }

            if (industry) filter.industry = industry;
            if (city) filter.city = city;
            if (country) filter.country = country;
            if (source) filter.source = source;
            if (status) filter.status = status;
            if (isArchived) filter.isArchived = isArchived;

            const docs = await LeadModel.find(filter)
                .skip((page - 1) * limit)
                .limit(limit);

            const docsCount = await LeadModel.countDocuments(filter);
            const pages = Math.ceil(docsCount / limit)

            res.status(200).json({
                leadsCount: docsCount,
                pages: pages,
                leads: docs,
                industry: Industry,
                source: Source,
                status: Object.values(Status),
                city: City
            })
        } catch (error) {
            log.error(`Error Message: ${error.message}\nError Stack: ${error}`);

            next(
                createHttpError(500, {
                    message: "API function error: Login"
                })
            )
        }
    },

    createLead: async (req, res, next) => {
        try {
            // Body Validation
            const { error, value } = CreateLeadSchema.validate(req.body, {
                abortEarly: false,
                stripUnknown: true,
            });
            if (error) {
                return next(
                    createHttpError(400, {
                        errorAPI: "POST: checklist validation failed:",
                        message: "Lead validation failed",
                        validationError: error.details.map(d => d.message),
                    })
                );
            }

            await LeadModel.create({
                company: value.company,
                website: value.website,
                industry: value.industry,
                address: value.address,
                city: value.city,
                emirate: value.emirate,
                country: value.country,
                source: value.source,
                sourceDetails: value.sourceDetails,
                contacts: value.contacts,
                hrContacts: value.hrContacts,
                temperature: value.temperature,
                score: value.score,
                tags: value.tags,
                remarks: value.remarks,
                linkedinUrl: value.linkedinUrl,
                companySize: value.companySize,
            });

            res.status(201).json({
                success: true,
                message: "Lead added!"
            })
        } catch (error) {
            log.error(`Error Message: ${error.message}\nError Stack: ${error}`);

            next(
                createHttpError(500, {
                    message: "API function error: Create lead",
                })
            )
        }
    },

    importExcelFile: async (req, res, next) => {
        const session = await mongoose.startSession();

        session.startTransaction();

        try {

            if (!req.file) {
                return res.status(400).json({
                    message: "No file uploaded"
                });
            }

            /*
              Read uploaded excel
            */

            const workbook = XLSX.read(
                req.file.buffer,
                { type: "buffer" }
            );

            const sheetName = workbook.SheetNames[0];

            const sheet = workbook.Sheets[sheetName];

            const rows = XLSX.utils.sheet_to_json(sheet);

            console.log(
                `Total rows in Excel: ${rows.length}`
            );


            /*
              Load existing leads
            */

            const existingLeads =
                await LeadModel.find(
                    {},
                    { company: 1 }
                ).lean();

            const existingNames =
                new Set(
                    existingLeads.map(
                        l => l.company.toLowerCase()
                    )
                );


            /*
              Transform rows
            */

            const leadsToInsert = [];

            for (const row of rows) {

                const name = cleanString(
                    row["Business Name"]
                );

                if (!name) continue;


                /*
                  Skip duplicates
                */

                if (
                    existingNames.has(
                        name.toLowerCase()
                    )
                ) {
                    continue;
                }


                /*
                  Read excel columns
                */

                const phone1 = cleanString(
                    row["Phone Number 1"]
                );

                const phone2 = cleanString(
                    row["Phone Number 2"]
                );

                const hrPhone = cleanString(
                    row["HR Phone"]
                );

                const email = cleanString(
                    row["General Email"]
                );

                const hrEmail = cleanString(
                    row["HR Email"]
                );


                /*
                  Build contacts
                */

                const contacts = [];

                if (phone1 || email) {

                    contacts.push({
                        name,
                        phone: phone1,
                        email,
                        isPrimary: true
                    });

                }

                if (phone2) {

                    contacts.push({
                        name,
                        phone: phone2,
                        isPrimary: false
                    });

                }


                /*
                  HR contacts
                */

                const hrContacts = [];

                if (hrPhone || hrEmail) {

                    hrContacts.push({
                        phone: hrPhone,
                        email: hrEmail
                    });

                }


                /*
                  Lead document
                */

                const leadDoc = {
                    company: name,

                    website: cleanString(
                        row["Website"]
                    ),

                    industry: cleanString(
                        row["Category"]
                    ),

                    city: cleanString(
                        row["City/Emirate"]
                    ),

                    address: cleanString(
                        row["Area/Location"]
                    ),

                    source: "sales",

                    sourceDetails: "Excel Import",

                    contacts,

                    hrContacts,

                    status: "new",

                    temperature: "cold",

                    score: 0,

                    tags: splitToArray(
                        row["Category"]
                    ),

                    remarks: cleanString(
                        row["Remarks"]
                    ),

                    linkedinUrl: "",

                    companySize: ""

                };


                leadsToInsert.push(
                    leadDoc
                );


                /*
                 Prevent duplicates
                 inside same upload
                */

                existingNames.add(
                    name.toLowerCase()
                );
            }


            console.log(
                `New leads to insert: ${leadsToInsert.length}`
            );


            /*
              Bulk insert
            */
            if (
                leadsToInsert.length > 0
            ) {
                console.log("insertmany running...");

                await LeadModel.insertMany(
                    leadsToInsert,
                    {
                        session,
                        ordered: false
                    }
                );

            }


            await session.commitTransaction();

            session.endSession();


            return res.json({
                success: true,
                inserted:
                    leadsToInsert.length
            });

        } catch (error) {

            await session.abortTransaction();

            session.endSession();

            log.error(`Error Message: ${error.message}\nError Stack: ${error}`);

            next(
                createHttpError(500, {
                    message: "API function error: Import Excel File lead",
                })
            )

        }
    },

};

export default LeadController;


