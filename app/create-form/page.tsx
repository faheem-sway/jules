// app/create-form/page.tsx
'use client'; // Required for Next.js App Router to use client-side features like useState

import { useState, ChangeEvent, FormEvent } from 'react';
import { FormField, FormDefinition, FieldType } from '../lib/types'; // Adjust path if necessary
// import { useRouter } from 'next/navigation'; // Will be used later for navigation
import { addForm as saveNewFormToStorage } from '../lib/storage'; // Renamed import for clarity

// Helper to generate a simple unique ID (for client-side temporary use)
const generateId = () => Date.now().toString();

export default function CreateFormPage() {
  // const router = useRouter(); // Will be used later
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
      alert('Please enter a form name.');
      return;
    }
    if (fields.length === 0) {
      alert('Please add at least one field.');
      return;
    }
    // Ensure all fields have names
    if (fields.some(field => !field.name.trim())) {
        alert('Please ensure all fields have a name.');
        return;
    }

    const newFormDefinition: FormDefinition = {
      id: generateId(), // This ID is for the form itself
      name: formName,
      fields: fields.map(field => ({ ...field, id: generateId() })) // Assign new IDs to fields upon saving
    };

    try {
      // OLD:
      // const existingFormsString = localStorage.getItem('forms');
      // const existingForms: FormDefinition[] = existingFormsString ? JSON.parse(existingFormsString) : [];
      // localStorage.setItem('forms', JSON.stringify([...existingForms, newFormDefinition]));

      // NEW:
      saveNewFormToStorage(newFormDefinition);

      alert('Form saved successfully!');
      setFormName('');
      setFields([]);
      // router.push('/forms');
    } catch (error) { // This catch might be less necessary if saveNewFormToStorage handles its own errors
      console.error('Failed to save form:', error);
      alert('Failed to save form. Check console for details.');
    }
  };

  const fieldTypes: FieldType[] = ['text', 'number', 'date', 'checkbox'];

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Create New Form</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="formName" className="block text-sm font-medium text-gray-700 mb-1">
            Form Name
          </label>
          <input
            type="text"
            id="formName"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="e.g., Customer Survey"
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Fields</h2>
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-md">
              <div className="flex-1">
                <label htmlFor={`fieldName-${index}`} className="block text-xs font-medium text-gray-600">
                  Field Name
                </label>
                <input
                  type="text"
                  id={`fieldName-${index}`}
                  value={field.name}
                  onChange={(e) => handleFieldNameChange(index, e)}
                  className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                  placeholder="e.g., Email"
                />
              </div>
              <div className="flex-1">
                <label htmlFor={`fieldType-${index}`} className="block text-xs font-medium text-gray-600">
                  Field Type
                </label>
                <select
                  id={`fieldType-${index}`}
                  value={field.type}
                  onChange={(e) => handleFieldTypeChange(index, e)}
                  className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm sm:text-sm bg-white"
                >
                  {fieldTypes.map(type => (
                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveField(index)}
                className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
          {fields.length === 0 && <p className="text-sm text-gray-500">No fields added yet. Click "Add Field" to begin.</p>}
        </div>

        <div className="flex items-center justify-between mt-6">
          <button
            type="button"
            onClick={handleAddField}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + Add Field
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Save Form
          </button>
        </div>
      </form>
    </div>
  );
}
