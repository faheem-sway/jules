// app/forms/page.tsx
'use client'; // Required for client-side features like useEffect and useState

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FormDefinition } from '../lib/types'; // Adjust path if necessary
import { getForms as fetchFormsFromStorage } from '../lib/storage';

export default function FormsListPage() {
  const [forms, setForms] = useState<FormDefinition[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true); // Ensure loading state is managed
    try {
      // OLD:
      // const storedFormsString = localStorage.getItem('forms');
      // if (storedFormsString) {
      //   const storedForms: FormDefinition[] = JSON.parse(storedFormsString);
      //   setForms(storedForms);
      // }

      // NEW:
      const storedForms = fetchFormsFromStorage();
      setForms(storedForms);

    } catch (err) { // This catch might be less necessary if fetchFormsFromStorage handles its own errors
      console.error('Failed to load forms from localStorage:', err);
      setError('Could not load forms. Data might be corrupted.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <p>Loading forms...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Available Forms</h1>
        <Link href="/create-form" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          + Create New Form
        </Link>
      </div>
      {forms.length === 0 ? (
        <p className="text-gray-600">No forms created yet. <Link href="/create-form" className="text-blue-500 hover:underline">Create one now!</Link></p>
      ) : (
        <ul className="space-y-4">
          {forms.map((form) => (
            <li key={form.id} className="p-4 border border-gray-300 rounded-md shadow-sm hover:shadow-md transition-shadow">
              <Link href={`/forms/${form.id}`} className="text-xl font-semibold text-blue-600 hover:underline">
                {form.name}
              </Link>
              <p className="text-sm text-gray-500 mt-1">Fields: {form.fields.length}</p>
              {/* Optional: Display a snippet of field names or types */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
