export const REQUIRED_HEADERS = [
  "userType",
  "prefix",
  "firstName",
  "lastName",
  "email",
  "phoneNumber",
  "gender",
  "password",
  "username",
] as const;

export const OPTIONAL_HEADERS = ["geoOrganization"] as const;

export const NORMALIZED_HEADER_MAP = [
  ...REQUIRED_HEADERS,
  ...OPTIONAL_HEADERS,
].reduce(
  (acc, header) => {
    acc[normalizeHeader(header)] = header;
    return acc;
  },
  {} as Record<string, string>,
);

export const GENDERS = ["male", "female", "transgender", "non_binary"] as const;

export type Gender = (typeof GENDERS)[number];

export type RawUserRow = Record<string, string>;

export interface ProcessedUserRow {
  rowIndex: number;
  raw: RawUserRow;
  errors: string[];
  normalized: {
    userType: string;
    prefix: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    gender: Gender;
    geoOrganization?: string;
    username: string;
    password: string;
  } | null;
}

export interface ImportResults {
  processed: number;
  created: number;
  skipped: number;
  failed: number;
  failures: { rowIndex: number; username?: string; reason: string }[];
}

function normalizeHeader(header: string) {
  return header.toLowerCase().replace(/[^a-z0-9]/g, "");
}
