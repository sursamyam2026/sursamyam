import { parsePhoneNumberFromString } from "libphonenumber-js";
import { isValidPhoneNumber, type Country } from "react-phone-number-input";
import countryLabels from "react-phone-number-input/locale/en.json";

export function normalizePhoneNumber(phone: string) {
  const trimmed = phone.trim();
  if (!trimmed) return "";
  return parsePhoneNumberFromString(trimmed)?.number ?? trimmed.replace(/\s+/g, "");
}

export function validatePhoneNumber(phone: string) {
  const normalized = normalizePhoneNumber(phone);

  if (!normalized) {
    return "Please fill out this field.";
  }

  if (!isValidPhoneNumber(normalized)) {
    return "Please enter a valid mobile number.";
  }

  return null;
}

export function countryNameFromCode(countryCode?: Country | string) {
  if (!countryCode) return "";
  return countryLabels[countryCode as keyof typeof countryLabels] ?? "";
}

export function countryNameFromPhoneNumber(phone: string) {
  const normalized = normalizePhoneNumber(phone);
  if (!normalized) return "";
  return countryNameFromCode(parsePhoneNumberFromString(normalized)?.country);
}
