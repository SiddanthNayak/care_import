export enum ResourceCategoryResourceType {
  product_knowledge = "product_knowledge",
  activity_definition = "activity_definition",
  charge_item_definition = "charge_item_definition",
}

export enum ResourceCategorySubType {
  charge_item_definition_location_bed_charges = "charge_item_definition:location:bed_charges",
  charge_item_definition_schedule_practitioner = "charge_item_definition:schedule:practitioner",
  charge_item_definition_schedule_location = "charge_item_definition:schedule:location",
  charge_item_definition_schedule_healthcare_service = "charge_item_definition:schedule:healthcare_service",
  other = "all:other",
}

export interface ResourceCategoryRead {
  id: string;
  title: string;
  slug: string;
  slug_config: { slug_value: string };
}
