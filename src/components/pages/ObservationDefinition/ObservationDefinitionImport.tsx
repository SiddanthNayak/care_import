import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { disableOverride } from "@/config";
import { useMasterDataAvailability } from "@/hooks/useMasterDataAvailability";
import { csvEscape } from "@/utils/importHelpers";
import { AlertCircle, Database, Upload } from "lucide-react";
import { useState } from "react";

import ObservationDefinitionCsvImport from "./ObservationDefinitionCsvImport";
import ObservationDefinitionMasterImport from "./ObservationDefinitionMasterImport";

interface ObservationDefinitionImportProps {
  facilityId?: string;
}

type ActiveView =
  | { kind: "upload" }
  | { kind: "csv"; csvText: string }
  | { kind: "master"; csvText: string };

export default function ObservationDefinitionImport({
  facilityId,
}: ObservationDefinitionImportProps) {
  const [activeView, setActiveView] = useState<ActiveView>({ kind: "upload" });
  const [uploadError, setUploadError] = useState("");
  const [bundledError, setBundledError] = useState("");
  const [bundledLoading, setBundledLoading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");

  const { availability, files } = useMasterDataAvailability();
  const repoFileAvailable = availability["observation-definition"];
  const disableManualUpload = disableOverride && repoFileAvailable;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disableManualUpload) {
      setUploadError(
        "Manual uploads are disabled because observation definition data is bundled with this build.",
      );
      setUploadedFileName("");
      setBundledError("");
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      setUploadError("Please upload a valid CSV file");
      setUploadedFileName("");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        setUploadError("");
        setBundledError("");
        setUploadedFileName(file.name);
        setActiveView({ kind: "csv", csvText });
      } catch {
        setUploadError("Error reading CSV file");
      }
    };
    reader.readAsText(file);
  };

  const handleBundledImport = async () => {
    if (!repoFileAvailable) {
      setBundledError(
        "Bundled observation definition dataset is not available.",
      );
      return;
    }

    setBundledError("");
    setUploadError("");
    setBundledLoading(true);

    try {
      const fileUrl = files["observation-definition"];
      if (!fileUrl) {
        throw new Error("Dataset file missing");
      }
      const response = await fetch(fileUrl, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Unable to fetch bundled observation definition CSV");
      }
      const csvText = await response.text();
      setActiveView({ kind: "master", csvText });
    } catch (error) {
      setBundledError(
        error instanceof Error ? error.message : "Error loading dataset",
      );
    } finally {
      setBundledLoading(false);
    }
  };

  const downloadSample = () => {
    const headers = [
      "title",
      "description",
      "category",
      "status",
      "code_system",
      "code_value",
      "code_display",
      "permitted_data_type",
      "component",
      "body_site_system",
      "body_site_code",
      "body_site_display",
      "method_system",
      "method_code",
      "method_display",
      "permitted_unit_system",
      "permitted_unit_code",
      "permitted_unit_display",
      "derived_from_uri",
    ];

    const componentExample = JSON.stringify([
      {
        code: {
          system: "http://loinc.org",
          code: "8480-6",
          display: "Systolic blood pressure",
        },
        permitted_data_type: "quantity",
        permitted_unit: {
          system: "http://unitsofmeasure.org",
          code: "mm[Hg]",
          display: "mmHg",
        },
        qualified_ranges: [],
      },
    ]);

    const rows = [
      [
        "Blood Pressure",
        "Systolic blood pressure",
        "vital_signs",
        "active",
        "http://loinc.org",
        "8480-6",
        "Systolic blood pressure",
        "quantity",
        componentExample,
        "",
        "",
        "",
        "http://snomed.info/sct",
        "272394005",
        "Technique",
        "http://unitsofmeasure.org",
        "mm[Hg]",
        "mmHg",
        "",
      ].map(csvEscape),
      [
        "Fasting Blood Sugar",
        "Fasting blood glucose",
        "laboratory",
        "active",
        "http://loinc.org",
        "1558-6",
        "Glucose [Moles/volume] in Serum or Plasma",
        "quantity",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "http://unitsofmeasure.org",
        "mmol/L",
        "mmol/L",
        "",
      ].map(csvEscape),
    ];

    const sampleCSV = `${headers.join(",")}\n${rows
      .map((row) => row.join(","))
      .join("\n")}`;
    const blob = new Blob([sampleCSV], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_observation_definition.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleBack = () => {
    setActiveView({ kind: "upload" });
    setUploadedFileName("");
  };

  if (activeView.kind === "csv") {
    return (
      <ObservationDefinitionCsvImport
        facilityId={facilityId}
        initialCsvText={activeView.csvText}
        onBack={handleBack}
      />
    );
  }

  if (activeView.kind === "master") {
    return (
      <ObservationDefinitionMasterImport
        facilityId={facilityId}
        initialCsvText={activeView.csvText}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-2 items-start">
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Observation Definitions from CSV
          </CardTitle>
          <CardDescription>
            Upload a CSV file to create observation definitions and validate
            them before import.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="observation-definition-csv-upload"
              disabled={disableManualUpload}
            />
            <label
              htmlFor="observation-definition-csv-upload"
              className={
                disableManualUpload
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer"
              }
            >
              <div className="flex flex-col items-center gap-4">
                <Upload className="h-12 w-12 text-gray-400" />
                <div>
                  <p className="text-lg font-medium">
                    Click to upload CSV file
                  </p>
                  <p className="text-sm text-gray-500">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-400">
                  Required columns: title, description, category,
                  permitted_data_type, code_system, code_value, code_display
                </p>
                <Button variant="outline" size="sm" onClick={downloadSample}>
                  Download Sample CSV
                </Button>
              </div>
            </label>
          </div>

          {uploadedFileName && (
            <p className="mt-3 text-sm text-gray-600">
              Selected file: {uploadedFileName}
            </p>
          )}

          {disableManualUpload && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Manual uploads are disabled because this build includes an
                observation definition dataset in the repository.
              </AlertDescription>
            </Alert>
          )}

          {uploadError && (
            <Alert className="mt-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>Master Observation Definitions</CardTitle>
          <CardDescription>
            Import data for Observation Definitions from available master
            dataset.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 flex-1">
          <div className="rounded-lg border border-gray-200 px-6 py-8 text-center text-s">
            <div className="flex flex-col items-center gap-4">
              <Database className="h-12 w-12 text-gray-400" />
              <div className="space-y-3">
                {repoFileAvailable ? (
                  <div className="flex flex-col items-center gap-4">
                    <p className="text-lg font-medium text-gray-600">
                      Click to Upload from master dataset
                    </p>
                    <p className="text-xs text-gray-400">
                      A bundled dataset is available in this build. You can
                      import it directly without uploading a CSV file.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBundledImport}
                      disabled={!repoFileAvailable || bundledLoading}
                    >
                      {bundledLoading
                        ? "Loading Master Data..."
                        : "Import Master Data"}
                    </Button>
                  </div>
                ) : (
                  <p className="text-gray-600">
                    No bundled dataset was detected for this build. You can
                    upload a CSV file to import observation definitions
                    manually.
                  </p>
                )}
              </div>
            </div>
          </div>
          {bundledError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{bundledError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
