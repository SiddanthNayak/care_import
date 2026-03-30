# Import Plug Specifications

## 1. Purpose

Build an admin-facing import plug that allows product and operations teams to run CSV and master-data imports with usable UX, strong validation, and explicit import controls.

The plug must support both:

- Facility-specific imports driven by uploaded CSV files.
- Common master-data imports pulled from one or more configured external repositories.

The goal is to let admins perform imports safely without requiring engineering intervention for normal operations.

The same operational principle should apply in reverse: any domain that can be imported through the plug must also be exportable through a corresponding admin-facing export workflow.

### 1.1 Problem Context

The plug addresses the following operational gaps:

- Imports are often script-driven and developer-dependent.
- Product and admin teams do not have a consistent validation and execution UX.
- Deployments can drift because standardized masters are difficult to enforce and facility-level adjustments are difficult to manage safely.
- Incorrect imports are hard to detect early when there is limited preview, dependency visibility, or confirmation flow.

### 1.2 Product Objective

The plug formalizes a two-layer import model:

- A common national or centrally curated standard distributed through configured repositories.
- A facility-specific application layer where admins choose what to apply, filter, validate, and import.

The FE plug is responsible for visibility, structure, validation, and safe execution controls. It is not responsible for judging whether the business intent of centrally curated master data is correct.

## 2. Product Goals

- Provide a clean, admin-friendly import panel for FE-led imports.
- Support validation before import submission.
- Support import execution from either uploaded files or configured master sources.
- Support export execution for every model that is supported for import.
- Preserve full operator control over what gets imported and in what order.
- Prevent accidental overwrites through confirmation gates and dependency validation.
- Allow build-time restriction of manual CSV uploads for models backed by curated master repositories.

## 3. Target Users

- Internal product or ops users managing imports.
- Admins configuring or running imports for a specific facility.
- Community deployment admins who may rely entirely on CSV uploads.

### 3.1 National Master Curators

The product must also account for a distinct operational role responsible for maintaining standardized master datasets.

Responsibilities include:

- Curating common datasets such as Product Knowledge, Observation Definitions, Specimen Definitions, and Activity Definitions.
- Maintaining naming conventions, slug integrity, category structure, and dataset completeness.
- Preparing deployment-ready repository content for FE consumption.

Design principle:

- The FE plug consumes and structurally validates centrally curated masters.
- The FE plug does not validate the business intent of those masters beyond schema, dependency, and structural rules.

## 4. Access and Placement

- The plug is an admin panel under the import route space.
- It should remain operationally scoped to admins.
- The UX should be intentionally clean and usable, even if the entry point is not broadly promoted in the main product navigation.
- The primary access pattern should support direct URL entry.
- The plug should not be exposed as a standard, always-visible CARE navigation destination for general users.

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
- Labs
- ValueSets and Questionnaires, where implemented

Export parity requirement:

- Every model that is importable through this plug must have a corresponding export capability.
- Export support should use the same model-centric structure as imports rather than a disconnected utility flow.

## 6. Source Model

For each import domain, the UI must support one of the following input strategies:

- Upload a CSV file manually.
- Pull data from one or more configured master sources.

Each model should also define, either directly or through FE-consumed metadata:

- Required fields
- Required dependencies
- Optional dependencies

The backend schema remains the implicit source of truth for importability, while FE-facing metadata may augment how the UI interprets and presents repo-based datasets.

Master data must not be treated as a single separate import section. Instead, each model-specific import screen should allow the operator to choose its source.

Export behavior should mirror the same model-centric design:

- Each model-specific admin screen should expose a clear export action or a corresponding export page.
- Export workflows should preserve the same context model used by import workflows where relevant, such as facility, healthcare service, location, or resource category.

Examples:

- Product Knowledge import can be run from uploaded CSV or from one or more configured master sources.
- Observation Definition import can be run from uploaded CSV or from one or more configured master sources.
- Observation Definition data should also be exportable from the same admin surface or a closely aligned export surface.

## 7. Master Source Configuration

### 7.1 Repository Model

- Master data must come from dedicated external repositories, not from files committed into this plug repository.
- There can be multiple master repositories.
- A master repository may contain one or more candidate datasets for a model.
- A model may map to a folder rather than a single file.

Examples:

- Observation Definitions may be sourced from multiple files or folders.
- Activity Definitions may be grouped by resource category or stored in multiple candidate datasets.

### 7.1.1 Index-Based Discovery

Repo-backed masters should be consumed through an index-driven contract rather than by the FE inferring arbitrary repository structure.

Required expectations:

- Each master data folder should expose an `index.json` file.
- `index.json` is the FE plug's single source of truth for discoverable datasets in that folder.
- The FE should use the index to render datasets, categories, declared dependencies, and metadata.

Representative metadata fields include:

- Resource or model identifier
- Version
- File name
- Relative path
- Category
- Required dependencies
- Optional dependencies
- Description

The FE should prefer index-driven discovery because it:

- Avoids parsing arbitrary repository layouts.
- Keeps dataset discovery predictable.
- Supports version-aware behavior and metadata-driven UX.

### 7.1.2 Repository Ownership Expectations

The repository indexing and validation pipeline may be maintained by the platform team or master-data curators.

Expected responsibilities outside this FE repository include:

- Validating source CSV structure before publication.
- Declaring dependencies and optional dependencies in index metadata.
- Generating or updating `index.json` through an automated pipeline where possible.
- Maintaining versioned, deployment-ready datasets.

### 7.2 Source Discovery

For each model, the plug should:

- Discover available configured master sources.
- Present one or more candidate imports from those sources.
- Let the user choose which source datasets to load.
- Fetch the selected source data before validation and import.
- Use metadata from `index.json` or equivalent source manifests when available.
- Support file-level selection when a model exposes multiple candidate files.
- Surface declared dependency and category metadata before the user starts the import.

### 7.3 Build-Time Controls

The plug must support a build-time configuration that controls whether manual file upload can override repo-backed data.

Relevant environment configuration includes:

- `ENABLE_REPO_IMPORT` to enable or disable repository-backed source flows in a deployment.
- `DISABLE_OVERRIDE` to control whether repo-backed models can still be overridden through manual CSV upload.

Required behavior:

- If `ENABLE_REPO_IMPORT` is disabled, the repo-backed source flow should be unavailable.
- If `DISABLE_OVERRIDE` is enabled at build time, and a configured master source exists for a given model, manual CSV upload for that model must be disabled.
- If `DISABLE_OVERRIDE` is disabled, users may still choose manual upload even when master sources exist.
- This behavior is deployment-specific. Internal deployments may lock models to repo-backed sources, while community deployments may leave CSV upload enabled.

## 8. Import UX Requirements

The product should also expose a similar admin-facing export dashboard or export page structure so that export operations feel consistent with import operations.

### 8.0 Export Dashboard Principle

- Export should not be treated as an afterthought or a hidden developer-only utility.
- The export experience should be accessible to the same admin-facing audience that performs imports.
- The export UX should be similar enough to the import UX that operators can move between both without relearning the workflow.
- Export pages may be separate from import pages, but they should follow the same model-based organization and context selection patterns.

### 8.1 General UX

- The UI must be usable by product and ops teams, not only engineers.
- Each import screen must clearly show the selected facility context when relevant.
- Each screen must clearly show the chosen source type: CSV upload or master source.
- Sample files or source format guidance should be available where CSV upload is supported.
- Validation feedback must be readable and actionable.
- The user must understand what will be imported before submitting.
- Parsed data should be previewed before import submission.
- Error states should be highlighted in the preview rather than deferred to a vague post-submit failure.
- Export flows should clearly show what data slice will be exported before the export is triggered.

### 8.2 Selection Controls

The plug must support selection at multiple levels where applicable:

- Model-level selection: choose which model imports to run.
- Source-level selection: choose one or more configured datasets for a model.
- Category-level selection: choose subsets such as resource categories where relevant.
- Row-level selection: choose individual rows from the loaded dataset before import.

Row-level selection is required for master-data flows because not all facilities will need all rows from a shared national or common dataset.

### 8.3 Context Selection

The import flow must collect execution context before validation and import.

Required context:

- Facility for facility-scoped imports.

Conditional context based on model and dataset:

- Healthcare Service
- Resource Category
- Location

The UI must block import if required context for the selected model is missing.

The same context model should apply to export where relevant so that users can export data for the exact facility or scoped context they are managing.

### 8.4 Existing Data Warnings

Before import execution, the plug must check whether the target facility already has existing records for the selected model where that check is feasible.

Required behavior:

- If existing entities are found, the user must see a confirmation step.
- The confirmation must clearly state that data already exists and ask whether the user wants to continue.
- The confirmation is a warning gate, not an automatic block.

Example:

- If the facility already has Product Knowledge records, the user must be asked to confirm before proceeding.

### 8.5 Validation Summary and Dependency Visibility

Before final submission, the plug should provide a summary panel that surfaces:

- Total rows loaded
- Valid rows
- Invalid rows
- Missing required dependencies
- Missing optional dependencies
- Existing data detected in the target context

The UI should also provide a dependency report that distinguishes:

- Blocking issues
- Warning-only issues

### 8.6 Confirmation Layer

Before import execution, the user should be shown a confirmation state summarizing:

- Selected source datasets
- Selected rows or categories
- Context such as facility and healthcare service, when relevant
- Existing data impact
- Any overrides being applied

### 8.7 Export Flow Requirements

For each exportable model, the export admin flow should support the following stages where applicable:

- Select model
- Select scope or context such as facility, healthcare service, location, or category
- Preview the dataset scope or record count to be exported
- Trigger a preparation step rather than immediately downloading the file
- Show preparation status while export data is being assembled
- Allow download only after preparation completes successfully
- Surface export preparation success or failure feedback

Where row- or category-level import selection exists, the export flow should provide equivalent filters or scoping controls when technically feasible.

The preparation flow should support paginated data retrieval so large datasets can be assembled progressively rather than requiring a single blocking fetch.

## 9. Validation Rules

The plug must validate both file structure and business dependencies before import execution.

### 9.1 Structural Validation

- Required headers must be present.
- Repeatable column groups must follow the expected naming pattern.
- Rows with malformed values must fail validation with row-specific feedback.
- Declared field types should be validated where feasible in the FE.

### 9.2 Business Validation

- Foreign references must resolve correctly before import.
- Slug-based dependencies must be verified before import.
- If a dependent entity is missing, the affected import must fail instead of silently creating invalid data.

Examples:

- If Product Knowledge references a Charge Item Definition slug that does not exist, Product Knowledge import must fail.
- If Activity Definitions reference entities that cannot be resolved for the selected import context, the import must fail with explicit errors.

### 9.3 Strict Pre-Import Validation Mode

Validation should happen before import execution, not as an invisible side effect of import submission.

Required behavior:

- The user must not be able to import without first reaching a validated state.
- Validation must run against the selected rows, selected source datasets, and selected context.
- Import should be blocked when validation has not passed.

### 9.4 Dependency Severity and Override Rules

Dependencies must be modeled with severity.

- Required dependencies must block import when missing.
- Optional dependencies may be allowed through an explicit user override only when the schema or source metadata marks them as optional.

General override principles:

- Overrides must be explicit.
- Overrides must be limited to cases defined as optional.
- Overrides must be user-confirmed.

Charge Item Definition special case:

- If a missing Charge Item Definition is optional for the selected schema path and does not require financial or billing linkage, the user may be allowed to proceed after an explicit warning.
- If Charge Item Definition linkage is required for pricing or billing semantics, import must be blocked.

### 9.5 Import Order Guidance

The system should not hard-block users into a fixed global import order, but it must:

- Communicate the recommended import order.
- Enforce dependency validation on submission.
- Fail dependent imports when prerequisite records are unavailable.

The product philosophy is operator control with explicit consequences: users may choose any order, but imports that depend on missing entities must error out.

### 9.6 Action Guardrails

The system must block the following actions:

- Import without successful validation
- Import with unresolved required dependencies
- Import with invalid schema
- Import without required facility or contextual selection

Imports are not blindly retryable. A retry must require:

- Revalidation of the current dataset and context
- An explicit user action to re-initiate the flow

## 10. Model-Specific Requirements

In addition to import requirements, every model listed in this section should be considered exportable through an admin-facing export flow.

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
- Charge Item Definition dependency handling must respect required versus optional linkage rules where the schema differentiates them.

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
- Activity Definition datasets may declare dependencies on Observation Definitions, Specimen Definitions, Charge Item Definitions, Healthcare Services, and Locations.
- Missing required dependencies must be surfaced with explicit slug-level or entity-level detail before import.

### 10.7 Facility-Specific Imports

- Facility-specific imports such as users, departments, links, and other local records continue to work in the current facility-scoped manner.
- Master source behavior applies only to shared master-data-style models, not to all import domains.

### 10.8 Export Parity

- Users must be able to export the same model categories that the plug allows them to import.
- Exports should honor the same context boundaries as imports, especially facility scoping.
- If a model supports category-level import behavior, the export flow should support category-level export filtering where feasible.
- If a model supports healthcare-service-specific or location-specific import context, the export flow should support the same context constraints.
- Exported formats should be structured for operator use, ideally aligned with the import schema where round-tripping is intended.

## 11. Import Execution Semantics

- Imports should behave as upserts where supported by the underlying import logic.
- The UI must make it clear whether the system is creating, updating, or skipping records.
- Validation errors must be surfaced before execution when possible.
- Execution results must summarize success, failure, and skipped items.
- Error logs should be available for review or download when execution produces failures.
- The UI should track post-run dataset state as imported, partially imported, or failed when the underlying flow can determine that status.
- Partial import behavior should not be assumed unless it is explicitly supported by the import path.

## 11.1 Export Execution Semantics

- Export operations should be available through a similar admin dashboard page or aligned model-specific export surface.
- Export should respect the selected context and filters before file generation.
- The UI should make it clear what resource type and scope are being exported.
- Export must be modeled as a two-step flow: prepare first, download second.
- Preparing an export should traverse the underlying paginated data source until the full exportable dataset has been assembled.
- The UI should show preparation progress or status while pagination is being consumed and files are being assembled.
- Prepared output may result in a single CSV file or multiple CSV files, depending on dataset size or model-specific export rules.
- Download must only be enabled after preparation completes successfully.
- Export preparation and download results should provide clear success or failure feedback.
- When export preparation fails, the user should receive an actionable error state rather than a silent failure.
- Exported output should be suitable for review, reuse, and in supported cases re-import after operator adjustments.

### 11.2 Export Preparation Status Model

The export dashboard should reflect the lifecycle of an export preparation job.

Minimum expected states:

- Not started
- Preparing
- Ready for download
- Failed

The status view should make it clear that preparation may take time because the system is iterating through paginated data and assembling one or more output files.

## 12. Documentation Requirements

The plug must include user-facing documentation that explains:

- Supported models.
- CSV schemas.
- Expected repo structure and source discovery behavior.
- Recommended import order.
- Dependency rules.
- Source selection behavior.
- When CSV upload is disabled by build-time configuration.
- How row-level and category-level selection work.
- How export pages or export actions map to the importable models.
- What context filters apply to exports.
- Whether exported files are intended to match or approximate import schemas.
- How export preparation works before download.
- That export assembly may use pagination and may produce one or more files.
- Common validation and dependency failure cases.
- Model-specific rules, especially for Charge Item Definition dependencies, Observation Definition reference ranges, and Activity Definition category selection.

## 13. Non-Goals

- Backend import logic changes.
- Automatically inferring or creating missing dependent entities during unrelated imports.
- Hiding validation failures behind partial silent success.
- Treating master data as a single monolithic import flow disconnected from model-specific screens.
- Storing curated master datasets inside this plug repository.
- Version control, rollback, and history management in the initial scope.

## 14. Acceptance Criteria

- An admin can open each supported import model and choose either CSV upload or one or more configured master sources.
- Repo-backed source discovery can be driven through `index.json` or equivalent FE-consumable source manifests.
- For repo-backed models, manual upload is disabled when `DISABLE_OVERRIDE` is enabled.
- Repo-backed flows can be turned off entirely when `ENABLE_REPO_IMPORT` is disabled.
- The UI supports row-level selection for master-data imports.
- The UI supports file-level selection when a model exposes multiple candidate datasets.
- The UI supports category-level selection where applicable, especially for Activity Definitions.
- The UI blocks import when required execution context is missing.
- Existing facility data triggers a confirmation step before import continues.
- Missing slug-based dependencies cause the dependent import to fail with explicit errors.
- Optional dependencies can only be bypassed through explicit, user-confirmed override paths.
- Observation Definition CSVs use a repeatable tabular structure for reference ranges rather than JSON cell payloads.
- Master sources are loaded from dedicated external repositories, and multiple repositories are supported.
- Model-specific screens, rather than a separate master-data section, are the primary interaction model.
- Validation summary and dependency visibility are available before import execution.
- Error outputs are visible to the user after failed import attempts.
- User-facing documentation exists for recommended order and import rules.
- Every import-supported model has a corresponding export capability exposed through a similar admin-facing export page or model-aligned export flow.
- Export flows honor the same context boundaries used by import flows where relevant.
- Export UI makes the selected resource type and scope visible before export is triggered.
- Export preparation status is visible to the user before download becomes available.
- Export assembly can iterate through paginated data until the complete CSV output is ready.
- Export downloads are available only after a successful preparation step.
- Export success and failure states are visible to the user.

## 15. Open Decisions to Confirm During Implementation

- Exact configuration format for declaring multiple master repositories and per-model source mappings.
- Exact `index.json` schema and compatibility guarantees across repositories.
- Exact UI treatment for hidden versus visible navigation entry points in production.
- Exact file and folder conventions expected inside a master repository.
- Exact import result format and whether partial success is permitted per row or only per batch.
- Exact naming convention for repeatable Observation Definition columns.
- Exact output formats for each exportable model and whether exports are guaranteed to be import-compatible.
- Exact placement of export actions: same page as import, parallel export dashboard, or model-specific split screens.
- Exact pagination and batching behavior for export preparation across models.
- Exact threshold for splitting exports into multiple files instead of one file.
