// Shared by server and browser code, so it must not import anything server-only.
export const CLAIM_STATUSES = ["Submitted", "Under Review", "More Info Needed", "Approved", "Paid", "Rejected"] as const;
export type ClaimStatus = (typeof CLAIM_STATUSES)[number];
