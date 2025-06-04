// app/forms/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FormDefinition } from '../lib/types';
import { getForms as fetchFormsFromStorage } from '../lib/storage';

export default function FormsListPage() {
  const [forms, setForms] = useState<FormDefinition[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    try {
      const storedForms = fetchFormsFromStorage();
      setForms(storedForms);
    } catch (err) {
      console.error('Failed to load forms from localStorage:', err);
      setError('Could not load forms. Data might be corrupted.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {/* Basic loading indicator, can be replaced with a spinner SVG or component */}
        <p className="text-gray-700 text-lg">Loading forms...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-red-500 bg-red-100 p-4 rounded-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-10 pb-6 border-b border-gray-200">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-4 sm:mb-0">
            Available Forms
          </h1>
          <Link
            href="/create-form"
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-blue-500 font-medium text-sm shadow-md hover:shadow-lg transition-all whitespace-nowrap"
          >
            + Create New Form
          </Link>
        </header>

        {forms.length === 0 ? (
          <div className="text-center bg-white p-10 rounded-xl shadow-xl">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No forms created yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new form.
            </p>
            <div className="mt-6">
              <Link
                href="/create-form"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-blue-500 transition-colors"
              >
                Create Form
              </Link>
            </div>
          </div>
        ) : (
          <ul className="space-y-6">
            {forms.map((form) => (
              <li key={form.id}>
                <Link
                  href={`/forms/${form.id}`}
                  className="block bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50 transition-all duration-150 ease-in-out"
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800 hover:text-blue-600 transition-colors">
                      {form.name}
                    </h2>
                    <span className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                      {form.fields.length} {form.fields.length === 1 ? 'field' : 'fields'}
                    </span>
                  </div>
                  {form.fields.length > 0 && (
                    <p className="mt-2 text-sm text-gray-500 truncate">
                      Fields: {form.fields.map(f => f.name).join(', ')}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
