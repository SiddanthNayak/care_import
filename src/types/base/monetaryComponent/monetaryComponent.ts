export type MonetaryComponentType = "base" | "surcharge" | "deduction";

export interface MonetaryComponent {
  monetary_component_type: MonetaryComponentType;
  amount: number | string;
}
