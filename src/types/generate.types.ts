/** Generate localization output */
export interface IGenerateLocalizationOutput {
  /** Number of generated localization values */
  count: number;
  /** Generated localization data */
  data: Record<string, any>;
}

interface IPathBase {
  /** Column number */
  column: number;
  /** Column/part name */
  name: string;
}

/**
 * Localization base file path part
 *
 * Used to associate nested path parts to columns in input Excel file.
 *
 * @example "Section,Name,English"
 */
export interface IPathPart extends IPathBase {
  /** Whether column exists (for validation) */
  exists: boolean;
}

/** Cell corresponding to a nested path part */
export interface IPathCell extends IPathBase {
  /** Path level (similar to index) */
  level: number;
  /** Cell value */
  value: string;
}
