// app/create-form/page.tsx
'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { FormField, FormDefinition, FieldType } from '../lib/types';
import { addForm as saveNewFormToStorage } from '../lib/storage';
// import { useRouter } from 'next/navigation'; // Keep commented if not immediately used

const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2, 9);

export default function CreateFormPage() {
  // const router = useRouter();
  const [formName, setFormName] = useState<string>('');
  const [fields, setFields] = useState<FormField[]>([]);

  const handleAddField = () => {
    setFields([...fields, { id: generateId(), name: '', type: 'text' }]);
  };

  const handleFieldNameChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const newFields = fields.map((field, i) =>
      i === index ? { ...field, name: event.target.value } : field
    );
    setFields(newFields);
  };

  const handleFieldTypeChange = (index: number, event: ChangeEvent<HTMLSelectElement>) => {
    const newFields = fields.map((field, i) =>
      i === index ? { ...field, type: event.target.value as FieldType } : field
    );
    setFields(newFields);
  };

  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formName.trim()) {
      alert('Please enter a form name.'); // Simple alert, can be improved with custom modals later
      return;
    }
    if (fields.length === 0) {
      alert('Please add at least one field.');
      return;
    }
    if (fields.some(field => !field.name.trim())) {
        alert('Please ensure all fields have a name.');
        return;
    }

    const newFormDefinition: FormDefinition = {
      id: generateId(),
      name: formName,
      fields: fields.map(field => ({ ...field, id: generateId() }))
    };

    try {
      saveNewFormToStorage(newFormDefinition);
      alert('Form saved successfully!'); // Simple alert
      setFormName('');
      setFields([]);
      // router.push('/forms');
    } catch (error) {
      console.error('Failed to save form:', error);
      alert('Failed to save form. Check console for details.');
    }
  };

  const fieldTypes: FieldType[] = ['text', 'number', 'date', 'checkbox'];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Create New Form
          </h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 sm:p-10 rounded-xl shadow-xl">
          <div>
            <label htmlFor="formName" className="block text-sm font-medium text-gray-700 mb-1">
              Form Name
            </label>
            <input
              type="text"
              id="formName"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow duration-150 ease-in-out hover:shadow-md"
              placeholder="e.g., Customer Survey"
            />
          </div>

          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900">Fields</h2>
            {fields.map((field, index) => (
              <div key={field.id} className="p-5 border border-gray-200 rounded-lg bg-gray-50/50 space-y-4 sm:flex sm:items-end sm:gap-4 sm:space-y-0">
                <div className="flex-grow">
                  <label htmlFor={`fieldName-${index}`} className="block text-xs font-medium text-gray-600 mb-0.5">
                    Field Name
                  </label>
                  <input
                    type="text"
                    id={`fieldName-${index}`}
                    value={field.name}
                    onChange={(e) => handleFieldNameChange(index, e)}
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow duration-150 ease-in-out hover:shadow"
                    placeholder="e.g., Email Address"
                  />
                </div>
                <div className="sm:w-48 flex-shrink-0">
                  <label htmlFor={`fieldType-${index}`} className="block text-xs font-medium text-gray-600 mb-0.5">
                    Field Type
                  </label>
                  <select
                    id={`fieldType-${index}`}
                    value={field.type}
                    onChange={(e) => handleFieldTypeChange(index, e)}
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white transition-shadow duration-150 ease-in-out hover:shadow"
                  >
                    {fieldTypes.map(type => (
                      <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveField(index)}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50/50 focus:ring-red-500 text-sm font-medium transition-colors shadow-sm hover:shadow-md"
                >
                  <svg className="w-4 h-4 mr-1.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.177-2.34.294a.75.75 0 00-.512 1.064l.162.285c.089.156.24.274.418.339l.017.006c.307.113.626.213.956.3.063.017.126.03.19.043V15.25A2.75 2.75 0 008.75 18h2.5A2.75 2.75 0 0014 15.25V6.221c.064-.013.127-.026.19-.043.33-.086.649-.186.956-.3l.017-.006a.75.75 0 00.418-.339l.162-.285a.75.75 0 00-.512-1.064c-.76-.117-1.545-.217-2.34-.294V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.414 0 .75.336.75.75V15c0 .414-.336.75-.75.75S9.25 15.414 9.25 15V4.75c0-.414.336.75.75-.75z" clipRule="evenodd" />
                  </svg>
                  Remove
                </button>
              </div>
            ))}
            {fields.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No fields added yet. Click "+ Add Field" to begin.
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200 mt-10">
            <button
              type="button"
              onClick={handleAddField}
              className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-blue-500 font-medium text-sm shadow-md hover:shadow-lg transition-all"
            >
              <svg className="w-5 h-5 mr-2 -ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
              Add Field
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 font-medium text-sm shadow-md hover:shadow-lg transition-all"
            >
              Save Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
