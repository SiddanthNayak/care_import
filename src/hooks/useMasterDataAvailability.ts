import { useEffect, useState } from "react";

export type DatasetId =
  | "product-knowledge"
  | "specimen-definition"
  | "observation-definition"
  | "activity-definition";

export const DATASET_ORDER: DatasetId[] = [
  "product-knowledge",
  "specimen-definition",
  "observation-definition",
  "activity-definition",
];

export interface MasterDataFile {
  /** Full URL to the CSV file */
  url: string;
  /** Filename extracted from the path (e.g. "product_knowledge.csv") */
  name: string;
}

/**
 * Resolves the manifest's file entries for a given dataset.
 *
 * New format — array of relative paths:
 *   "product-knowledge": ["product-knowledge/medications.csv", ...]
 *
 * Legacy format — single string (backwards compatible):
 *   "product-knowledge": "product_knowledge.csv"
 */
const resolveManifestFiles = (
  manifest: Record<string, unknown>,
  datasetId: DatasetId,
): string[] => {
  const value = manifest[datasetId] ?? manifest[datasetId.replace(/-/g, "_")];

  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === "string");
  }

  if (typeof value === "string" && value.length > 0) {
    return [value];
  }

  return [];
};

const resolveManifestBase = (manifest: unknown) => {
  if (!manifest || typeof manifest !== "object") return "/";
  const record = manifest as Record<string, unknown>;
  const base =
    (typeof record.basePath === "string" && record.basePath) ||
    (typeof record.base_path === "string" && record.base_path) ||
    (typeof record.baseUrl === "string" && record.baseUrl) ||
    (typeof record.base_url === "string" && record.base_url) ||
    "/";
  return base.endsWith("/") ? base : `${base}/`;
};

type ManifestStatus = "idle" | "loading" | "ready" | "error";

const buildEmptyFiles = () =>
  DATASET_ORDER.reduce<Record<DatasetId, MasterDataFile[]>>(
    (acc, datasetId) => {
      acc[datasetId] = [];
      return acc;
    },
    {} as Record<DatasetId, MasterDataFile[]>,
  );

const buildEmptyAvailability = () =>
  DATASET_ORDER.reduce<Record<DatasetId, boolean>>(
    (acc, datasetId) => {
      acc[datasetId] = false;
      return acc;
    },
    {} as Record<DatasetId, boolean>,
  );

export const useMasterDataAvailability = () => {
  const [status, setStatus] = useState<ManifestStatus>("idle");
  const [error, setError] = useState("");
  const [files, setFiles] =
    useState<Record<DatasetId, MasterDataFile[]>>(buildEmptyFiles());
  const [availability, setAvailability] = useState<Record<DatasetId, boolean>>(
    buildEmptyAvailability(),
  );

  useEffect(() => {
    let active = true;

    const loadManifest = async () => {
      setStatus("loading");
      setError("");

      try {
        const manifestUrl = new URL("/manifest.json", import.meta.url);
        const response = await fetch(manifestUrl.toString(), {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("Manifest not found");
        }

        const manifest = (await response.json()) as Record<string, unknown>;
        const basePath = resolveManifestBase(manifest);
        const baseUrl = new URL(basePath, manifestUrl);

        const resolvedFiles = buildEmptyFiles();

        DATASET_ORDER.forEach((datasetId) => {
          const relativePaths = resolveManifestFiles(manifest, datasetId);
          resolvedFiles[datasetId] = relativePaths.map((relativePath) => {
            const url = relativePath.startsWith("http")
              ? relativePath
              : new URL(relativePath.replace(/^\//, ""), baseUrl).toString();
            const name = relativePath.split("/").pop() ?? relativePath;
            return { url, name };
          });
        });

        const resolvedAvailability = buildEmptyAvailability();
        DATASET_ORDER.forEach((datasetId) => {
          resolvedAvailability[datasetId] = resolvedFiles[datasetId].length > 0;
        });

        if (!active) return;

        setFiles(resolvedFiles);
        setAvailability(resolvedAvailability);
        setStatus("ready");
      } catch (err) {
        if (!active) return;
        setStatus("error");
        setFiles(buildEmptyFiles());
        setAvailability(buildEmptyAvailability());
        setError(err instanceof Error ? err.message : "Manifest unavailable");
      }
    };

    loadManifest();

    return () => {
      active = false;
    };
  }, []);

  return { status, error, files, availability };
};
