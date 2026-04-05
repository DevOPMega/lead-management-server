import mongoose from "mongoose";

const LeadSchema = new mongoose.Schema(
  {
    // 🔹 Basic Info
    name: {
      type: String,
      trim: true,
      required: true,
      index: true,
    },

    company: {
      type: String,
      trim: true,
    },

    website: {
      type: String,
      trim: true,
    },

    industry: {
      type: String,
      enum: [
        "IT",
        "Finance",
        "Healthcare",
        "Education",
        "Manufacturing",
        "Real Estate",
        "Other",
      ],
    },

    // 🔹 Location
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String },
    address: { type: String },

    // 🔹 Lead Source (VERY IMPORTANT in real systems)
    source: {
      type: String,
      enum: [
        "LinkedIn",
        "Website",
        "Referral",
        "Cold Call",
        "Email Campaign",
        "Ads",
        "Event",
        "Other",
      ],
      required: true,
    },

    sourceDetails: {
      type: String, // e.g. campaign name, URL, etc.
    },

    // 🔹 Contacts (structured instead of arrays)
    contacts: [
      {
        name: String,
        designation: String,
        phone: String,
        email: String,
        isPrimary: { type: Boolean, default: false },
      },
    ],

    // 🔹 HR Contacts (separate if needed)
    hrContacts: [
      {
        name: String,
        phone: String,
        email: String,
      },
    ],

    // 🔹 Lead Status (Lifecycle)
    status: {
      type: String,
      enum: [
        "new",
        "contacted",
        "qualified",
        "proposal-sent",
        "negotiation",
        "won",
        "lost",
        "not-interested",
      ],
      default: "new",
    },

    // 🔹 Lead Temperature (Sales priority)
    temperature: {
      type: String,
      enum: ["cold", "warm", "hot"],
      default: "cold",
    },

    // 🔹 Lead Score (for automation)
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // 🔹 Assignment (important for team)
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // 🔹 Follow-ups
    nextFollowUp: {
      type: Date,
    },

    lastContactedAt: {
      type: Date,
    },

    // 🔹 Deal Info (optional but powerful)
    dealValue: {
      type: Number,
    },

    currency: {
      type: String,
      default: "INR",
    },

    expectedCloseDate: Date,

    // 🔹 Tags (flexible filtering)
    tags: {
      type: [String],
      default: [],
    },

    // 🔹 Notes / Remarks
    remarks: String,

    // 🔹 Activity History (VERY IMPORTANT)
    activities: [
      {
        type: {
          type: String,
          enum: ["call", "email", "meeting", "note"],
        },
        note: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],

    // 🔹 Data Enrichment
    linkedinUrl: String,
    companySize: String,

    // 🔹 Flags
    isConverted: {
      type: Boolean,
      default: false,
    },

    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const LeadModel = mongoose.model("Lead", LeadSchema);
export default LeadModel;