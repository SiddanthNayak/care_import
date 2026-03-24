# Import Plug Specifications

## 1. Purpose

Build an admin-facing import plug that allows product and operations teams to run CSV and master-data imports with usable UX, strong validation, and explicit import controls.

The plug must support both:

- Facility-specific imports driven by uploaded CSV files.
- Common master-data imports pulled from one or more configured external repositories.

The goal is to let admins perform imports safely without requiring engineering intervention for normal operations.

## 2. Product Goals

- Provide a clean, admin-friendly import panel for FE-led imports.
- Support validation before import submission.
- Support import execution from either uploaded files or configured master sources.
- Preserve full operator control over what gets imported and in what order.
- Prevent accidental overwrites through confirmation gates and dependency validation.
- Allow build-time restriction of manual CSV uploads for models backed by curated master repositories.

## 3. Target Users

- Internal product or ops users managing imports.
- Admins configuring or running imports for a specific facility.
- Community deployment admins who may rely entirely on CSV uploads.

## 4. Access and Placement

- The plug is an admin panel under the import route space.
- It should remain operationally scoped to admins.
- The UX should be intentionally clean and usable, even if the entry point is not broadly promoted in the main product navigation.

## 5. Supported Import Domains

The plug should support, at minimum, the following import domains:

- Users
- Departments, including multi-level department hierarchies
- User to department links with role mappings
- Locations
- Charge Item Definitions
- Product Knowledge
- Products
- Specimen Definitions
- Observation Definitions
- Activity Definitions
- ValueSets and Questionnaires, where implemented

## 6. Source Model

For each import domain, the UI must support one of the following input strategies:

- Upload a CSV file manually.
- Pull data from one or more configured master sources.

Master data must not be treated as a single separate import section. Instead, each model-specific import screen should allow the operator to choose its source.

Examples:

- Product Knowledge import can be run from uploaded CSV or from one or more configured master sources.
- Observation Definition import can be run from uploaded CSV or from one or more configured master sources.

## 7. Master Source Configuration

### 7.1 Repository Model

- Master data must come from dedicated external repositories, not from files committed into this plug repository.
- There can be multiple master repositories.
- A master repository may contain one or more candidate datasets for a model.
- A model may map to a folder rather than a single file.

Examples:

- Observation Definitions may be sourced from multiple files or folders.
- Activity Definitions may be grouped by resource category or stored in multiple candidate datasets.

### 7.2 Source Discovery

For each model, the plug should:

- Discover available configured master sources.
- Present one or more candidate imports from those sources.
- Let the user choose which source datasets to load.
- Fetch the selected source data before validation and import.

### 7.3 Build-Time Controls

The plug must support a build-time configuration that controls whether manual file upload can override repo-backed data.

Required behavior:

- If `DISABLE_OVERRIDE` is enabled at build time, and a configured master source exists for a given model, manual CSV upload for that model must be disabled.
- If `DISABLE_OVERRIDE` is disabled, users may still choose manual upload even when master sources exist.
- This behavior is deployment-specific. Internal deployments may lock models to repo-backed sources, while community deployments may leave CSV upload enabled.

## 8. Import UX Requirements

### 8.1 General UX

- The UI must be usable by product and ops teams, not only engineers.
- Each import screen must clearly show the selected facility context when relevant.
- Each screen must clearly show the chosen source type: CSV upload or master source.
- Sample files or source format guidance should be available where CSV upload is supported.
- Validation feedback must be readable and actionable.
- The user must understand what will be imported before submitting.

### 8.2 Selection Controls

The plug must support selection at multiple levels where applicable:

- Model-level selection: choose which model imports to run.
- Source-level selection: choose one or more configured datasets for a model.
- Category-level selection: choose subsets such as resource categories where relevant.
- Row-level selection: choose individual rows from the loaded dataset before import.

Row-level selection is required for master-data flows because not all facilities will need all rows from a shared national or common dataset.

### 8.3 Existing Data Warnings

Before import execution, the plug must check whether the target facility already has existing records for the selected model where that check is feasible.

Required behavior:

- If existing entities are found, the user must see a confirmation step.
- The confirmation must clearly state that data already exists and ask whether the user wants to continue.
- The confirmation is a warning gate, not an automatic block.

Example:

- If the facility already has Product Knowledge records, the user must be asked to confirm before proceeding.

## 9. Validation Rules

The plug must validate both file structure and business dependencies before import execution.

### 9.1 Structural Validation

- Required headers must be present.
- Repeatable column groups must follow the expected naming pattern.
- Rows with malformed values must fail validation with row-specific feedback.

### 9.2 Business Validation

- Foreign references must resolve correctly before import.
- Slug-based dependencies must be verified before import.
- If a dependent entity is missing, the affected import must fail instead of silently creating invalid data.

Examples:

- If Product Knowledge references a Charge Item Definition slug that does not exist, Product Knowledge import must fail.
- If Activity Definitions reference entities that cannot be resolved for the selected import context, the import must fail with explicit errors.

### 9.3 Import Order Guidance

The system should not hard-block users into a fixed global import order, but it must:

- Communicate the recommended import order.
- Enforce dependency validation on submission.
- Fail dependent imports when prerequisite records are unavailable.

The product philosophy is operator control with explicit consequences: users may choose any order, but imports that depend on missing entities must error out.

## 10. Model-Specific Requirements

### 10.1 Departments

- Support multi-level department imports.
- Preserve parent-child hierarchy validation.

### 10.2 User to Department Linking

- Support linking a single user to multiple departments.
- Support different roles across departments.

### 10.3 Charge Item Definitions

- Must be importable independently.
- Other models may reference Charge Item Definitions only by slug.
- Missing Charge Item Definition slugs must produce validation errors in dependent imports.

### 10.4 Product Knowledge

- Must support CSV and configured master sources.
- Must validate referenced Charge Item Definition slugs before import.
- Must allow row-level selection from master datasets.

### 10.5 Observation Definitions

- Must support CSV and configured master sources.
- Reference ranges must not be represented as JSON in a CSV cell.
- Reference ranges must use repeatable column groups in the CSV schema.
- The schema can be wide if necessary.

Suggested pattern:

- Base observation fields first.
- Then repeatable groups for components, interpretations, and ranges.
- Example style: `c1_i1_r1_*`, `c1_i1_r2_*`, `c2_i1_r1_*`.

The exact header naming may be implementation-specific, but the structure must be repeatable, parseable, and documented.

### 10.6 Activity Definitions

- Must support CSV and configured master sources.
- Activity Definitions should be importable by resource category.
- Users must be able to select which resource categories to import.
- The import flow must support the selected healthcare service context where required.
- Activity datasets may be grouped as folders or grouped datasets rather than a single flat file.

### 10.7 Facility-Specific Imports

- Facility-specific imports such as users, departments, links, and other local records continue to work in the current facility-scoped manner.
- Master source behavior applies only to shared master-data-style models, not to all import domains.

## 11. Import Execution Semantics

- Imports should behave as upserts where supported by the underlying import logic.
- The UI must make it clear whether the system is creating, updating, or skipping records.
- Validation errors must be surfaced before execution when possible.
- Execution results must summarize success, failure, and skipped items.

## 12. Documentation Requirements

The plug must include user-facing documentation that explains:

- Recommended import order.
- Dependency rules.
- Source selection behavior.
- When CSV upload is disabled by build-time configuration.
- How row-level and category-level selection work.
- Model-specific rules, especially for Charge Item Definition dependencies, Observation Definition reference ranges, and Activity Definition category selection.

## 13. Non-Goals

- Automatically inferring or creating missing dependent entities during unrelated imports.
- Hiding validation failures behind partial silent success.
- Treating master data as a single monolithic import flow disconnected from model-specific screens.
- Storing curated master datasets inside this plug repository.

## 14. Acceptance Criteria

- An admin can open each supported import model and choose either CSV upload or one or more configured master sources.
- For repo-backed models, manual upload is disabled when `DISABLE_OVERRIDE` is enabled.
- The UI supports row-level selection for master-data imports.
- The UI supports category-level selection where applicable, especially for Activity Definitions.
- Existing facility data triggers a confirmation step before import continues.
- Missing slug-based dependencies cause the dependent import to fail with explicit errors.
- Observation Definition CSVs use a repeatable tabular structure for reference ranges rather than JSON cell payloads.
- Master sources are loaded from dedicated external repositories, and multiple repositories are supported.
- Model-specific screens, rather than a separate master-data section, are the primary interaction model.
- User-facing documentation exists for recommended order and import rules.

## 15. Open Decisions to Confirm During Implementation

- Exact configuration format for declaring multiple master repositories and per-model source mappings.
- Exact UI treatment for hidden versus visible navigation entry points in production.
- Exact file and folder conventions expected inside a master repository.
- Exact import result format and whether partial success is permitted per row or only per batch.
- Exact naming convention for repeatable Observation Definition columns.
