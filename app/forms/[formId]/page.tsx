// app/forms/[formId]/page.tsx
'use client';

import { useState, useEffect, ChangeEvent } from 'react'; // Removed FormEvent as form tag is not used for main actions
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FormDefinition, FormTableData, FormDataRow, FieldType } from '../../../lib/types';
import {
  getFormById as fetchFormDefinitionById,
  getFormDataForForm as fetchFormData,
  saveFormDataForForm as persistFormData
} from '../../lib/storage'; // Corrected path from previous fix

const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2, 9);

export default function FormDataPage() {
  const params = useParams();
  // const router = useRouter(); // Not actively used, can be uncommented if needed
  const formId = params.formId as string;

  const [formDefinition, setFormDefinition] = useState<FormDefinition | null>(null);
  const [formData, setFormData] = useState<FormDataRow[]>([]);
  const [newRow, setNewRow] = useState<Partial<FormDataRow>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!formId) {
      setError("Form ID is missing.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const currentFormDef = fetchFormDefinitionById(formId);
      if (!currentFormDef) {
        setError('Form definition not found. It might have been deleted.');
        setFormDefinition(null); // Explicitly set to null
        setIsLoading(false);
        return;
      }
      setFormDefinition(currentFormDef);

      const initialNewRow: Partial<FormDataRow> = {};
      currentFormDef.fields.forEach(field => {
        initialNewRow[field.id] = field.type === 'checkbox' ? false : '';
      });
      setNewRow(initialNewRow);

      const currentFormDataRows = fetchFormData(formId);
      setFormData(currentFormDataRows);

    } catch (err: any) {
      console.error('Failed to load form data or definition:', err);
      setError(err.message || 'Could not load form data.');
    } finally {
      setIsLoading(false);
    }
  }, [formId]);

  const handleNewRowInputChange = (fieldId: string, type: FieldType, value: string | boolean | number) => {
    // For number fields, convert value to number if it's not empty, otherwise keep as string for controlled input
    const processedValue = type === 'number' ? (value === '' ? '' : Number(value)) : value;
    setNewRow(prev => ({ ...prev, [fieldId]: processedValue }));
  };

  const handleExistingRowInputChange = (rowIndex: number, fieldId: string, type: FieldType, value: string | boolean | number) => {
    const processedValue = type === 'number' ? (value === '' ? '' : Number(value)) : value;
    const updatedRows = formData.map((row, idx) => {
        if (idx === rowIndex) {
            return { ...row, [fieldId]: processedValue };
        }
        return row;
    });
    setFormData(updatedRows);
  };

  const handleAddRow = () => {
    if (!formDefinition) return;
    const rowToAdd: FormDataRow = { id: generateId(), ...newRow } as FormDataRow;
    setFormData([...formData, rowToAdd]);

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
      persistFormData(formId, formData);
      alert('Data saved successfully!'); // Simple alert
    } catch (err) {
      console.error('Failed to save data:', err);
      alert('Failed to save data. Check console for details.');
    }
  };

  const renderInputField = (
    item: Partial<FormDataRow>,
    field: { id: string; type: FieldType; name: string },
    onChangeHandler: (fieldId: string, type: FieldType, value: any) => void,
    isNewRow: boolean,
    rowIndex?: number
  ) => {
    const value = item[field.id];
    const inputId = isNewRow ? `new-${field.id}` : `row-${rowIndex}-${field.id}`;

    switch (field.type) {
      case 'checkbox':
        return (
          <input
            type="checkbox"
            id={inputId}
            checked={!!value}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onChangeHandler(field.id, field.type, e.target.checked)}
            className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-1"
          />
        );
      case 'date':
        return (
          <input
            type="date"
            id={inputId}
            value={value === undefined ? '' : String(value)}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onChangeHandler(field.id, field.type, e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow duration-150 ease-in-out hover:shadow bg-white disabled:bg-gray-50"
          />
        );
      case 'number':
        return (
          <input
            type="number"
            id={inputId}
            value={value === undefined ? '' : String(value)}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onChangeHandler(field.id, field.type, e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow duration-150 ease-in-out hover:shadow bg-white disabled:bg-gray-50"
            placeholder={isNewRow ? `New ${field.name}` : ''}
          />
        );
      default: // text
        return (
          <input
            type="text"
            id={inputId}
            value={value === undefined ? '' : String(value)}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onChangeHandler(field.id, field.type, e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow duration-150 ease-in-out hover:shadow bg-white disabled:bg-gray-50"
            placeholder={isNewRow ? `New ${field.name}` : ''}
          />
        );
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-700 text-lg">Loading form data...</p>
      </div>
    );
  }

  if (error || !formDefinition) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-md mx-auto bg-white p-10 rounded-xl shadow-xl">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Error</h3>
          <p className="mt-1 text-sm text-red-600">{error || "Form definition could not be loaded."}</p>
          <div className="mt-6">
            <Link href="/forms" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
              &larr; Back to Forms List
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
              Form: {formDefinition.name}
            </h1>
            <Link
              href="/forms"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            >
              &larr; Back to Forms List
            </Link>
          </div>
        </header>

        {formDefinition.fields.length === 0 ? (
          <div className="text-center bg-white p-10 rounded-xl shadow-xl">
            <h3 className="mt-2 text-lg font-medium text-gray-900">This form has no fields.</h3>
            <p className="mt-1 text-sm text-gray-500">
              You can edit the form definition to add fields.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    {formDefinition.fields.map(field => (
                      <th key={`header-${field.id}`} scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                        {field.name} <span className="text-gray-400 normal-case">({field.type})</span>
                      </th>
                    ))}
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.map((row, rowIndex) => (
                    <tr key={`row-${row.id}`} className="hover:bg-gray-50/50 transition-colors">
                      {formDefinition.fields.map(field => (
                        <td key={`cell-${row.id}-${field.id}`} className="px-6 py-4 whitespace-nowrap text-sm">
                          {renderInputField(row, field, (fieldId, type, value) => handleExistingRowInputChange(rowIndex, fieldId, type, value), false, rowIndex)}
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleDeleteRow(rowIndex)}
                            className="inline-flex items-center text-red-500 hover:text-red-700 text-xs font-medium hover:underline transition-colors focus:outline-none focus:ring-1 focus:ring-red-400 focus:ring-offset-1 focus:ring-offset-white rounded"
                            title="Delete row" // Add title for accessibility on icon-leaning buttons
                          >
                            <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.177-2.34.294a.75.75 0 00-.512 1.064l.162.285c.089.156.24.274.418.339l.017.006c.307.113.626.213.956.3.063.017.126.03.19.043V15.25A2.75 2.75 0 008.75 18h2.5A2.75 2.75 0 0014 15.25V6.221c.064-.013.127-.026.19-.043.33-.086.649-.186.956-.3l.017-.006a.75.75 0 00.418-.339l.162-.285a.75.75 0 00-.512-1.064c-.76-.117-1.545-.217-2.34-.294V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.414 0 .75.336.75.75V15c0 .414-.336.75-.75.75S9.25 15.414 9.25 15V4.75c0-.414.336.75.75-.75z" clipRule="evenodd" />
                            </svg>
                            Delete
                          </button>
                      </td>
                    </tr>
                  ))}
                  {/* Input row for new data */}
                  <tr className="bg-gray-50/50">
                    {formDefinition.fields.map(field => (
                      <td key={`new-cell-${field.id}`} className="px-6 py-4">
                        {renderInputField(newRow, field, handleNewRowInputChange, true)}
                      </td>
                    ))}
                    <td className="px-6 py-4">
                      <button
                        onClick={handleAddRow}
                        className="w-full inline-flex items-center justify-center px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-gray-50 focus:ring-green-500 text-sm font-medium shadow-sm hover:shadow-md transition-all"
                      >
                        <svg className="w-5 h-5 mr-1.5 -ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                        </svg>
                        Add Row
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {formDefinition.fields.length > 0 && (
          <div className="mt-10 flex justify-end">
            <button
              onClick={handleSaveData}
              className="px-8 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-blue-500 font-medium text-sm shadow-md hover:shadow-lg transition-all"
              // disabled={formData.length === 0 && Object.values(newRow).every(val => val === '' || val === false) }
            >
              Save All Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
