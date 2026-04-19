export const cleanString = (value) => {
    if (!value) return "";
    return String(value).trim();
};

export const splitToArray = (value) => {
    if (!value) return [];
    return String(value)
        .split(",")
        .map(v => v.trim())
        .filter(Boolean);
};

export const getSource = (website) => {
    if (!website) return "manual";

    if (website.includes("linkedin")) {
        return "linkedin";
    }

    return "website";
};