// app/lib/storage.ts
import { FormDefinition, FormTableData, FormDataRow } from './types';

const FORMS_KEY = 'forms';
const ALL_FORM_DATA_KEY = 'allFormData';

// Helper to safely get and parse JSON from localStorage
function getJSONFromStorage<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window === 'undefined') return defaultValue; // Guard for SSR or build time
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading or parsing localStorage key "${key}":`, error);
    return defaultValue;
  }
}

// Helper to safely stringify and set JSON to localStorage
function setJSONToStorage(key: string, value: any): void {
  try {
    if (typeof window === 'undefined') return; // Guard for SSR or build time
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
}

// --- Form Definitions ---
export function getForms(): FormDefinition[] {
  return getJSONFromStorage<FormDefinition[]>(FORMS_KEY, []);
}

export function saveForms(forms: FormDefinition[]): void {
  setJSONToStorage(FORMS_KEY, forms);
}

export function addForm(newForm: FormDefinition): void {
  const forms = getForms();
  forms.push(newForm);
  saveForms(forms);
}

export function getFormById(formId: string): FormDefinition | undefined {
  const forms = getForms();
  return forms.find(form => form.id === formId);
}

// --- Form Data (for all forms) ---
export function getAllFormData(): FormTableData[] {
  return getJSONFromStorage<FormTableData[]>(ALL_FORM_DATA_KEY, []);
}

export function saveAllFormData(allData: FormTableData[]): void {
  setJSONToStorage(ALL_FORM_DATA_KEY, allData);
}

export function getFormDataForForm(formId: string): FormDataRow[] {
  const allData = getAllFormData();
  const formDataForSpecificForm = allData.find(data => data.formId === formId);
  return formDataForSpecificForm ? formDataForSpecificForm.rows : [];
}

export function saveFormDataForForm(formId: string, rows: FormDataRow[]): void {
  const allData = getAllFormData();
  const existingDataIndex = allData.findIndex(data => data.formId === formId);

  if (existingDataIndex > -1) {
    allData[existingDataIndex].rows = rows;
  } else {
    allData.push({ formId, rows });
  }
  saveAllFormData(allData);
}
