/** Types of comparisons between base and comparison items */
export enum Comparison {
  /** Comparison item exists but is empty */
  EMPTY = "EMPTY",
  /** Comparison item is missing a property */
  MISSING = "MISSING",
  /** Comparison item has an extra property */
  EXTRA = "EXTRA",
  /** Items are the same */
  SAME = "SAME",
  /** Items have different types */
  DIFFERENT_TYPE = "DIFFERENT_TYPE",
  /** Items have different values (but same type) */
  DIFFERENT_VALUES = "DIFFERENT_VALUES",
  /** Unhandled comparison */
  UNHANDLED = "UNHANDLED",
}

export interface ComparisonDisplay {
  /** Comparison key */
  key: string;
  /** Comparison issues (warnings/errors) */
  issues?: number;
  /** Comparison parents */
  parents?: string[];
  /** Comparison result */
  result: Comparison;
  /** Comparison type */
  type: "section" | "value";
}

export interface ComparisonConfig {
  /** Comparison description */
  description: string;
  /** Comparison type */
  type: "error" | "warning";
}

export const ComparisonDescriptionMap: Record<
  keyof typeof Comparison,
  ComparisonConfig
> = {
  [Comparison.EMPTY]: {
    description: "Comparison file has an empty item!",
    type: "error",
  },
  [Comparison.MISSING]: {
    description: "Comparison file is missing an item!",
    type: "error",
  },
  [Comparison.EXTRA]: {
    description: "Comparison file has an extra item!",
    type: "warning",
  },
  [Comparison.SAME]: {
    description: "Values are the same (may indicate issue)!",
    type: "warning",
  },
  [Comparison.DIFFERENT_TYPE]: {
    description: "Comparison file has an invalid type for an item!",
    type: "error",
  },
  [Comparison.DIFFERENT_VALUES]: {
    description: "Values are different",
    type: "warning",
  },
  [Comparison.UNHANDLED]: {
    description: "Comparison was unhandled",
    type: "warning",
  },
};

export interface ComparisonOutput {
  /** Comparison children */
  children?: ComparisonOutputMap;
  /** Number of errors/warnings in children */
  issues?: number;
  /** Parent keys */
  parents?: string[];
  /** Comparison result */
  result: Comparison;
}

export interface ComparisonOutputConfig {
  /** Whether missing values should be ignored (useful for partial override files) */
  ignoreMissing: boolean;
  /** Whether same values should be ignored (can indicate missed translation) */
  ignoreSame: boolean;
}

export type ComparisonOutputMap = Record<string, ComparisonOutput>;

export type CompareOutputCallback = (
  baseObject: any,
  comparisonObject: any,
  key: string,
  parents: string[],
  childComparison?: any,
) => any;

export type CompareFilterCallback = (
  key: string,
  baseValue: any,
  comparisonValue: any,
) => boolean;
