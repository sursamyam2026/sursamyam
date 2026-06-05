import type { LeadStatus } from "@/lib/leads";

export interface ParsedLeadImport {
  name: string;
  email: string;
  phone?: string;
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
  message: "message",
  note: "message",
  notes: "message",
  comments: "message",
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
    const messageIndex = columnMap.get("message");
    const statusIndex = columnMap.get("status");
    const status = normalizeStatus(statusIndex === undefined ? "" : row[statusIndex]);

    if (!name) {
      errors.push(`Row ${rowNumber}: name is required.`);
      return;
    }

    if (!isLikelyEmail(email)) {
      errors.push(`Row ${rowNumber}: valid email is required.`);
      return;
    }

    if (!status) {
      errors.push(`Row ${rowNumber}: status is not recognized.`);
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
      message: messageIndex === undefined ? "" : cellText(row[messageIndex]),
      status,
    });
  });

  return { leads, errors };
}
