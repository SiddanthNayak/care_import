import type { MonetaryComponent } from "@/types/base/monetaryComponent/monetaryComponent";

export enum ChargeItemDefinitionStatus {
  draft = "draft",
  active = "active",
  retired = "retired",
}

export interface ChargeItemDefinitionBase {
  id: string;
  status: ChargeItemDefinitionStatus;
  title: string;
  slug: string;
  description?: string;
  purpose?: string;
  price_components: MonetaryComponent[];
  category: string;
  can_edit_charge_item: boolean;
}

export interface ChargeItemDefinitionCreate extends Omit<
  ChargeItemDefinitionBase,
  "id" | "category" | "slug"
> {
  slug_value: string;
  category: string;
}
