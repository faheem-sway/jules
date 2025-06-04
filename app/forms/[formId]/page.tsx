// app/forms/[formId]/page.tsx
'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FormDefinition, FormTableData, FormDataRow, FieldType } from '../../../lib/types'; // Adjust path
import {
  getFormById as fetchFormDefinitionById,
  getFormDataForForm as fetchFormData,
  saveFormDataForForm as persistFormData
} from '../../../lib/storage';


// Helper to generate a simple unique ID
const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2, 9);


export default function FormDataPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.formId as string;

  const [formDefinition, setFormDefinition] = useState<FormDefinition | null>(null);
  const [formData, setFormData] = useState<FormDataRow[]>([]);
  const [newRow, setNewRow] = useState<Partial<FormDataRow>>({}); // For the input row
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!formId) return;
    setIsLoading(true); // Ensure loading state is managed
    try {
      // OLD: Load Form Definition
      // const formsString = localStorage.getItem('forms');
      // if (!formsString) throw new Error('No form definitions found.');
      // const forms: FormDefinition[] = JSON.parse(formsString);
      // const currentFormDef = forms.find(f => f.id === formId);

      // NEW: Load Form Definition
      const currentFormDef = fetchFormDefinitionById(formId);
      if (!currentFormDef) throw new Error('Form definition not found.');
      setFormDefinition(currentFormDef);

      const initialNewRow: Partial<FormDataRow> = {};
      currentFormDef.fields.forEach(field => {
        initialNewRow[field.id] = field.type === 'checkbox' ? false : '';
      });
      setNewRow(initialNewRow);

      // OLD: Load Form Data
      // const allFormDataString = localStorage.getItem('allFormData');
      // if (allFormDataString) {
      //   const allFormData: FormTableData[] = JSON.parse(allFormDataString);
      //   const currentFormData = allFormData.find(fd => fd.formId === formId);
      //   if (currentFormData) {
      //     setFormData(currentFormData.rows);
      //   }
      // }

      // NEW: Load Form Data
      const currentFormDataRows = fetchFormData(formId);
      setFormData(currentFormDataRows);

    } catch (err: any) {
      console.error('Failed to load form data or definition:', err);
      setError(err.message || 'Could not load form data.');
    } finally {
      setIsLoading(false);
    }
  }, [formId]);

  const handleNewRowInputChange = (fieldId: string, type: FieldType, value: string | boolean) => {
    setNewRow(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleExistingRowInputChange = (rowIndex: number, fieldId: string, type: FieldType, value: string | boolean) => {
    const updatedRows = formData.map((row, idx) => {
        if (idx === rowIndex) {
            return { ...row, [fieldId]: value };
        }
        return row;
    });
    setFormData(updatedRows);
  };


  const handleAddRow = () => {
    if (!formDefinition) return;

    // Basic validation: check if any field in newRow is empty for non-checkbox types
    // For simplicity, we'll allow adding partially filled rows. More robust validation can be added.
    // const isNewRowValid = formDefinition.fields.every(field => {
    //   if (field.type !== 'checkbox') {
    //     return newRow[field.id] !== undefined && (newRow[field.id] as string).trim() !== '';
    //   }
    //   return true;
    // });

    // if (!isNewRowValid) {
    //   alert('Please fill in all fields for the new row.');
    //   return;
    // }

    const rowToAdd: FormDataRow = { id: generateId(), ...newRow } as FormDataRow;
    setFormData([...formData, rowToAdd]);

    // Reset newRow inputs
    const resetNewRow: Partial<FormDataRow> = {};
    formDefinition.fields.forEach(field => {
      resetNewRow[field.id] = field.type === 'checkbox' ? false : '';
    });
    setNewRow(resetNewRow);
  };

  const handleDeleteRow = (rowIndex: number) => {
    setFormData(prevData => prevData.filter((_,index) => index !== rowIndex));
  };

  const handleSaveData = () => {
    if (!formId) return;
    try {
      // OLD:
      // const allFormDataString = localStorage.getItem('allFormData');
      // let allFormData: FormTableData[] = allFormDataString ? JSON.parse(allFormDataString) : [];
      // const existingDataIndex = allFormData.findIndex(fd => fd.formId === formId);
      // if (existingDataIndex > -1) {
      //   allFormData[existingDataIndex].rows = formData;
      // } else {
      //   allFormData.push({ formId, rows: formData });
      // }
      // localStorage.setItem('allFormData', JSON.stringify(allFormData));

      // NEW:
      persistFormData(formId, formData);
      alert('Data saved successfully!');
    } catch (err) { // This catch might be less necessary if persistFormData handles its own errors
      console.error('Failed to save data:', err);
      alert('Failed to save data. Check console for details.');
    }
  };

  if (isLoading) return <div className="container mx-auto p-8"><p>Loading form data...</p></div>;
  if (error) return <div className="container mx-auto p-8"><p className="text-red-500">{error}</p><Link href="/forms" className="text-blue-500 hover:underline">Back to forms list</Link></div>;
  if (!formDefinition) return <div className="container mx-auto p-8"><p>Form not found.</p><Link href="/forms" className="text-blue-500 hover:underline">Back to forms list</Link></div>;

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Form: {formDefinition.name}</h1>
        <Link href="/forms" className="text-blue-600 hover:underline">&larr; Back to Forms List</Link>
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {formDefinition.fields.map(field => (
                <th key={field.id} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {field.name} ({field.type})
                </th>
              ))}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {formData.map((row, rowIndex) => (
              <tr key={row.id}>
                {formDefinition.fields.map(field => (
                  <td key={field.id} className="px-6 py-4 whitespace-nowrap">
                    { field.type === 'checkbox' ? (
                      <input
                        type="checkbox"
                        checked={!!row[field.id]}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleExistingRowInputChange(rowIndex, field.id, field.type, e.target.checked)}
                        className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    ) : (
                      <input
                        type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                        value={row[field.id] === undefined ? '' : row[field.id]}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleExistingRowInputChange(rowIndex, field.id, field.type, e.target.value)}
                        className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                      />
                    )}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap">
                    <button onClick={() => handleDeleteRow(rowIndex)} className="text-red-600 hover:text-red-900 text-sm">Delete</button>
                </td>
              </tr>
            ))}
            {/* Input row for new data */}
            <tr>
              {formDefinition.fields.map(field => (
                <td key={`new-${field.id}`} className="px-6 py-4">
                  { field.type === 'checkbox' ? (
                     <input
                        type="checkbox"
                        checked={!!newRow[field.id]}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleNewRowInputChange(field.id, field.type, e.target.checked)}
                        className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                  ) : (
                    <input
                      type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                      placeholder={`New ${field.name}`}
                      value={newRow[field.id] === undefined ? '' : newRow[field.id] as string}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleNewRowInputChange(field.id, field.type, e.target.value)}
                      className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                  )}
                </td>
              ))}
              <td className="px-6 py-4">
                <button
                  onClick={handleAddRow}
                  className="px-3 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
                >
                  Add Row
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {formDefinition.fields.length === 0 && <p className="mt-4 text-gray-600">This form has no fields defined.</p>}

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSaveData}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          disabled={formData.length === 0 && Object.values(newRow).every(val => val === '' || val === false) }
        >
          Save All Data
        </button>
      </div>
    </div>
  );
}
