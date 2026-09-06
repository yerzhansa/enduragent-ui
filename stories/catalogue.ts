export const readyIds = [
  "shared-select--default",
  "shared-select--disabled",
  "shared-inline-confirmation--default",
  "shared-inline-confirmation--busy",
  "shared-inline-confirmation--disabled",
  "shared-theme--default",
  "shared-controls--buttons",
  "shared-controls--cards",
  "shared-controls--dialogs",
  "shared-controls--popovers",
  "shared-controls--pages",
] as const;
export const coverage = readyIds.map((id) => ({ id, kind: "ready" as const }));
