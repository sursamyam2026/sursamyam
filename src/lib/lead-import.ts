import type { LeadStatus } from "@/lib/leads";

type LeadImportTrack = "adults" | "kids";
type LeadImportFormat = "online" | "offline";

export interface ParsedLeadImport {
  name: string;
  email: string;
  phone?: string;
  age?: string;
  city?: string;
  country?: string;
  track?: LeadImportTrack;
  courseName?: string;
  format?: LeadImportFormat;
  message: string;
  status: LeadStatus;
}

export interface LeadImportParseResult {
  leads: ParsedLeadImport[];
  errors: string[];
}

const STATUS_ALIASES: Record<string, LeadStatus> = {
  new: "new",
  contacted: "contacted",
  converted: "converted",
  registered: "registered",
  enrolled: "enrolled",
  discontinued: "discontinued",
  declined: "declined",
  droppedout: "discontinued",
  dropped_out: "discontinued",
  inactive: "discontinued",
};

const HEADER_ALIASES: Record<string, keyof ParsedLeadImport> = {
  name: "name",
  fullname: "name",
  studentname: "name",
  email: "email",
  emailaddress: "email",
  phone: "phone",
  mobile: "phone",
  mobilenumber: "phone",
  contact: "phone",
  contactnumber: "phone",
  age: "age",
  city: "city",
  country: "country",
  program: "track",
  programme: "track",
  track: "track",
  studenttype: "track",
  message: "message",
  note: "message",
  notes: "message",
  comments: "message",
  course: "courseName",
  coursename: "courseName",
  courseline: "courseName",
  class: "courseName",
  classtype: "courseName",
  format: "format",
  mode: "format",
  classformat: "format",
  coursetype: "format",
  status: "status",
  leadstatus: "status",
};

function normalizeKey(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function normalizeStatus(value: unknown): LeadStatus | null {
  const key = normalizeKey(value);
  if (!key) return "new";
  return STATUS_ALIASES[key] ?? null;
}

function normalizeTrack(value: unknown): LeadImportTrack | null | undefined {
  const key = normalizeKey(value);
  if (!key) return undefined;
  if (["adult", "adults"].includes(key)) return "adults";
  if (["kid", "kids", "child", "children"].includes(key)) return "kids";
  return null;
}

function normalizeFormat(value: unknown): LeadImportFormat | null | undefined {
  const key = normalizeKey(value);
  if (!key) return undefined;
  if (key === "online") return "online";
  if (key === "offline" || key === "inperson" || key === "inpersonclass") return "offline";
  return null;
}

function cellText(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  return String(value ?? "").trim();
}

function isBlankRow(row: unknown[]): boolean {
  return row.every((cell) => cellText(cell) === "");
}

function isLikelyEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function parseLeadImportFile(file: File): Promise<LeadImportParseResult> {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    return { leads: [], errors: ["The selected file does not contain a sheet."] };
  }

  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    blankrows: false,
  });
  const headerIndex = rows.findIndex((row) => !isBlankRow(row));
  if (headerIndex === -1) {
    return { leads: [], errors: ["The selected file is empty."] };
  }

  const headers = rows[headerIndex];
  const columnMap = new Map<keyof ParsedLeadImport, number>();
  headers.forEach((header, index) => {
    const field = HEADER_ALIASES[normalizeKey(header)];
    if (field && !columnMap.has(field)) {
      columnMap.set(field, index);
    }
  });

  if (!columnMap.has("name") || !columnMap.has("email")) {
    return {
      leads: [],
      errors: ["The file must include name and email columns."],
    };
  }

  const leads: ParsedLeadImport[] = [];
  const errors: string[] = [];
  const seenEmails = new Set<string>();

  rows.slice(headerIndex + 1).forEach((row, offset) => {
    if (isBlankRow(row)) return;

    const rowNumber = headerIndex + offset + 2;
    const name = cellText(row[columnMap.get("name") ?? -1]);
    const email = cellText(row[columnMap.get("email") ?? -1]).toLowerCase();
    const phoneIndex = columnMap.get("phone");
    const ageIndex = columnMap.get("age");
    const cityIndex = columnMap.get("city");
    const countryIndex = columnMap.get("country");
    const trackIndex = columnMap.get("track");
    const courseIndex = columnMap.get("courseName");
    const formatIndex = columnMap.get("format");
    const messageIndex = columnMap.get("message");
    const statusIndex = columnMap.get("status");
    const status = normalizeStatus(statusIndex === undefined ? "" : row[statusIndex]);
    const track = normalizeTrack(trackIndex === undefined ? "" : row[trackIndex]);
    const courseName = courseIndex === undefined ? "" : cellText(row[courseIndex]);
    const format = normalizeFormat(formatIndex === undefined ? "" : row[formatIndex]);

    if (!name) {
      errors.push(`Row ${rowNumber}: name is required.`);
      return;
    }

    if (!isLikelyEmail(email)) {
      errors.push(`Row ${rowNumber}: valid email is required.`);
      return;
    }

    if (!status || !["registered", "enrolled"].includes(status)) {
      errors.push(`Row ${rowNumber}: status must be registered or enrolled.`);
      return;
    }

    if (!track) {
      if (track === null) {
        errors.push(`Row ${rowNumber}: program must be Adults or Kids.`);
        return;
      }
    }

    if (!format) {
      if (format === null) {
        errors.push(`Row ${rowNumber}: format must be Online or Offline.`);
        return;
      }
    }

    if ((status === "registered" || status === "enrolled") && !courseName) {
      errors.push(`Row ${rowNumber}: course is required for ${status} leads.`);
      return;
    }

    if (seenEmails.has(email)) {
      errors.push(`Row ${rowNumber}: duplicate email in file.`);
      return;
    }

    seenEmails.add(email);
    leads.push({
      name,
      email,
      phone: phoneIndex === undefined ? undefined : cellText(row[phoneIndex]) || undefined,
      age: ageIndex === undefined ? undefined : cellText(row[ageIndex]) || undefined,
      city: cityIndex === undefined ? undefined : cellText(row[cityIndex]) || undefined,
      country: countryIndex === undefined ? undefined : cellText(row[countryIndex]) || undefined,
      track: track ?? undefined,
      courseName: courseName || undefined,
      format: format ?? undefined,
      message: messageIndex === undefined ? "" : cellText(row[messageIndex]),
      status,
    });
  });

  return { leads, errors };
}
