import { AlertCircle, Upload } from "lucide-react";
import { useState } from "react";

import { request } from "@/apis/request";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface DepartmentImportProps {
  facilityId?: string;
}

interface DepartmentNode {
  name: string;
  children: DepartmentNode[];
}

interface DepartmentRow {
  department: string;
  subDepartment?: string;
}

const REQUIRED_HEADERS = ["department", "subdepartment"] as const;

const normalizeHeader = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");

const buildHeaderMap = (headers: string[]) => {
  const headerMap: Record<string, number> = {};
  headers.forEach((header, index) => {
    const normalized = normalizeHeader(header);
    if (normalized === "department") headerMap.department = index;
    if (normalized === "subdepartment") headerMap.subDepartment = index;
  });
  return headerMap;
};

const buildDepartmentTree = (rows: DepartmentRow[]) => {
  const roots: DepartmentNode[] = [];

  const findOrCreate = (name: string, nodes: DepartmentNode[]) => {
    let node = nodes.find((entry) => entry.name === name);
    if (!node) {
      node = { name, children: [] };
      nodes.push(node);
    }
    return node;
  };

  for (const row of rows) {
    const rootName = row.department.trim();
    if (!rootName) continue;

    const root = findOrCreate(rootName, roots);
    if (row.subDepartment && row.subDepartment.trim()) {
      findOrCreate(row.subDepartment.trim(), root.children);
    }
  }

  return roots;
};

export default function DepartmentImport({
  facilityId,
}: DepartmentImportProps) {
  const [currentStep, setCurrentStep] = useState<"upload" | "review">("upload");
  const [uploadError, setUploadError] = useState<string>("");
  const [departments, setDepartments] = useState<DepartmentNode[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      setUploadError("Please upload a valid CSV file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const rows = csvText
          .split("\n")
          .map((row) => row.trim())
          .filter(Boolean);

        if (rows.length === 0) {
          setUploadError("CSV is empty or missing headers");
          return;
        }

        const headers = rows[0]
          .split(",")
          .map((h) => h.trim().replace(/"/g, ""));
        const headerMap = buildHeaderMap(headers);

        const missingHeaders = REQUIRED_HEADERS.filter(
          (header) => headerMap[header] === undefined,
        );
        if (missingHeaders.length > 0) {
          setUploadError(
            `Missing required headers: ${missingHeaders.join(", ")}`,
          );
          return;
        }

        const dataRows: DepartmentRow[] = [];
        for (let i = 1; i < rows.length; i++) {
          if (!rows[i]) continue;
          const values = rows[i]
            .split(",")
            .map((value) => value.trim().replace(/"/g, ""));
          const department = values[headerMap.department] ?? "";
          const subDepartment =
            headerMap.subDepartment !== undefined
              ? values[headerMap.subDepartment]
              : undefined;

          if (department.trim()) {
            dataRows.push({ department, subDepartment });
          }
        }

        setUploadError("");
        setDepartments(buildDepartmentTree(dataRows));
        setCurrentStep("review");
      } catch (error) {
        setUploadError("Error processing CSV file");
      }
    };
    reader.readAsText(file);
  };

  const saveDepartments = async () => {
    if (!facilityId) return;
    for (const department of departments) {
      await createDepartmentTree(facilityId, department);
    }
  };

  if (currentStep === "upload") {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Departments from CSV
            </CardTitle>
            <CardDescription>
              Upload a CSV file to import departments and sub-departments with
              their hierarchy preserved.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="dept-csv-upload"
              />
              <label htmlFor="dept-csv-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-4">
                  <Upload className="h-12 w-12 text-gray-400" />
                  <div>
                    <p className="text-lg font-medium">
                      Click to upload CSV file
                    </p>
                    <p className="text-sm text-gray-500">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-400">
                    Expected columns: department, subDepartment
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Sub-department is optional. If omitted, the department will
                    be created at the top level.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const sampleCSV = `Department,Sub Department
Varghese,Varghese Sub
Radiology,`;
                      const blob = new Blob([sampleCSV], { type: "text/csv" });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "sample_departments.csv";
                      a.click();
                      window.URL.revokeObjectURL(url);
                    }}
                  >
                    Download Sample CSV
                  </Button>
                </div>
              </label>
            </div>

            {uploadError && (
              <Alert className="mt-4" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">
                Valid Department Levels:
              </h4>
              <div className="flex flex-wrap gap-2">
                {["Department", "Sub Department"].map((label) => (
                  <Badge key={label} variant="outline" className="text-xs">
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Department Import Wizard</CardTitle>
          <CardDescription>
            Review and validate departments before importing
          </CardDescription>
          <div className="mt-4">
            <Progress value={100} className="h-2" />
          </div>
        </CardHeader>
        <CardContent>
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Review All Departments
            </h3>
            <div className="border rounded-lg bg-white">
              {departments.map((department) => (
                <div
                  key={department.name}
                  className="border-b border-gray-100 p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">
                      {department.name}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      Department
                    </Badge>
                  </div>
                  {department.children.length > 0 && (
                    <div className="ml-4 mt-2 space-y-1">
                      {department.children.map((child) => (
                        <div
                          key={child.name}
                          className="flex items-center gap-2 text-sm text-gray-600"
                        >
                          <span>{child.name}</span>
                          <Badge variant="outline" className="text-xs">
                            Sub Department
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <Button className="mt-4" onClick={saveDepartments}>
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function createDepartmentTree(
  facilityId: string,
  node: DepartmentNode,
  parentId?: string,
): Promise<void> {
  const payload = {
    name: node.name,
    description: "",
    org_type: "dept",
    parent: parentId ?? undefined,
    facility: facilityId,
  };

  const created = (await request<{ id?: string }>(
    `/api/v1/facility/${facilityId}/organizations/`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  )) as { id?: string } | null;

  if (!created?.id) {
    return;
  }

  for (const child of node.children) {
    await createDepartmentTree(facilityId, child, created.id);
  }
}
