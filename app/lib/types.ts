// app/lib/types.ts

export type FieldType = 'text' | 'number' | 'date' | 'checkbox';

export interface FormField {
  id: string;       // Unique identifier for the field (e.g., generated uuid)
  name: string;     // User-defined name for the field (e.g., "Email Address")
  type: FieldType;  // Type of the field
}

export interface FormDefinition {
  id: string;                // Unique identifier for the form (e.g., generated uuid)
  name: string;              // User-defined name for the form (e.g., "Customer Feedback")
  fields: FormField[];       // Array of field definitions
}

// Represents a single row of data in a form's table
// Using a Record type where keys are field IDs and values are the field data
export interface FormDataRow {
  id: string; // Unique ID for this row of data
  [fieldId: string]: any; // Allows any string as a key, mapping to the data for that field
}

// Represents all the data stored for a specific form instance
export interface FormTableData {
  formId: string;         // Links to the FormDefinition's id
  rows: FormDataRow[];    // Array of data rows
}
