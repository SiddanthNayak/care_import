import {
  Bed,
  Building,
  Building2,
  Car,
  Eye,
  Home,
  Hospital,
  LucideIcon,
  Map,
} from "lucide-react";

export type Status = "active" | "inactive" | "unknown";

export type OperationalStatus = "C" | "H" | "O" | "U" | "K" | "I";

export type LocationMode = "instance" | "kind";

export type LocationForm = (typeof LocationFormOptions)[number];

export interface LocationBase {
  status: Status;
  operational_status: OperationalStatus;
  name: string;
  description: string;
  location_type?: unknown;
  form: LocationForm;
  mode: LocationMode;
}

export interface LocationDetail extends LocationBase {
  id: string;
  has_children: boolean;
}

export interface LocationWrite extends LocationBase {
  id?: string;
  parent?: string;
  organizations: string[];
  mode: LocationMode;
}

export interface LocationImport extends LocationBase {
  id?: string;
  mode: LocationMode;
  children: LocationImport[];
}

export const LocationFormOptions = [
  "si",
  "bu",
  "wi",
  "wa",
  "lvl",
  "co",
  "ro",
  "bd",
  "ve",
  "ho",
  "ca",
  "rd",
  "area",
  "jdn",
  "vi",
] as const;

export const LocationTypeIcons = {
  bd: Bed,
  wa: Hospital,
  lvl: Building2,
  bu: Building,
  si: Map,
  wi: Building2,
  co: Building2,
  ro: Home,
  ve: Car,
  ho: Home,
  ca: Car,
  rd: Car,
  area: Map,
  jdn: Map,
  vi: Eye,
} as const satisfies Record<LocationForm, LucideIcon>;
