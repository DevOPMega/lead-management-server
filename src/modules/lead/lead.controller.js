import createHttpError from "http-errors";
import log from "../../logs/index.js";
import LeadModel from "./lead.model.js";

const LeadController = {
    getLeads: async (req, res, next) => {
        try {
            const {
                page = 1,
                limit = 50,
                industry,
                city,
                country,
                source,
                status,
                isArchived,
            } = req.query;

            const filter = {};

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
            })
        } catch (error) {
            log.error(`Error Message: ${error.message}\nError Stack: ${error}`);

            next(
                createHttpError(500, {
                    message: "API function error: Login"
                })
            )
        }
    }
};

export default LeadController;