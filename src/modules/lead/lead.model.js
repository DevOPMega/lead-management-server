import mongoose from "mongoose";

export const Industry = [
  "IT",
  "Finance",
  "HealthCare",
  "Construction",
  "Hospitality & Tourism",
  "Logistic",
  "Transport",
  "Real Estate",
  "Bank & Finance",
  "Retail",
  "E-Commerce",
  "Consulting",
  "Oil & Gas",
  "Cleaning",
  "Security",
  "Manufacturing",
  "Education",
  "Restaurants & Cafe",
  "Clinics",
  "Others"
]

export const Source = [
  "sales"
];

export const Status = {
  new: "New",
  contacted: "Contacted",
  interested: "Interested",
  quoteSent: "Quote sent",
  won: "Won",
  lost: "Lost",
}

export const Temperature = {
  cold: "Cold",
  warm: "Warm",
  hot: "Hot",
}

export const Activities = {
  call: "Call",
  email: "Email",
  meeting: "Meeting",
  note: "Note",
};

export const City = ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Fujairah", "Ras Al Khaimah"]

const ActivitiesSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: Activities,
    default: Activities.note,
  },
  note: String,
}, {
  timestamps: true,
});

const RemarkSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Call", "Meeting", "WhatsApp", "Email", "Note"],
    default: "Call",
  },
  remark: String,
  nextFollowUp: Date,
});

const FollowupHistorySchema = new mongoose.Schema({
  action: String,
  scheduledAt: String,
  status: {
    type: String,
    enum: ["Upcoming", "No Answer", "Responded"],
    default: "Call",
  }
});

const LeadSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      trim: true,
      index: 1,
    },

    website: {
      type: String,
      trim: true,
    },

    industry: {
      type: String,
      enum: Industry,
      default: "Others"
    },

    address: { type: String },
    city: { type: String, trim: true },
    emirate: { type: String, trim: true },
    country: { type: String },

    source: {
      type: String,
      enum: Source,
      default: "Others",
    },

    sourceDetails: {
      type: String, // e.g. campaign name, URL, etc.
    },

    contacts: [
      {
        name: String,
        designation: String,
        phone: String,
        email: String,
        isPrimary: { type: Boolean, default: false },
      },
    ],

    hrContacts: [
      {
        name: String,
        phone: String,
        email: String,
      },
    ],

    status: {
      type: String,
      enum: Status,
      default: Status.new,
    },

    temperature: {
      type: String,
      enum: Temperature,
      default: Temperature.cold,
    },

    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

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

    dealValue: {
      type: Number,
    },

    currency: {
      type: String,
      default: "AED",
    },

    expectedCloseDate: Date,

    tags: {
      type: [String],
      default: [],
    },

    // 🔹 Notes / Remarks
    remarks: [RemarkSchema],
    followupHistory: [FollowupHistorySchema],

    activities: [ActivitiesSchema],

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