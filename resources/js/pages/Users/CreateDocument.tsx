import React, { useState } from 'react';
import Navbar from '@/components/User/navbar';
import { useForm } from '@inertiajs/react';

interface FormData {
    title: string;
    description: string;
    documentType: string;
    file: File | null;
    [key: string]: string | File | null;
}

const CreateDocument = () => {
    const { data, setData, post, processing, errors } = useForm<FormData>({
        title: '',
        description: '',
        documentType: '',
        file: null
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/users/documents');
    };

    return (
        <>
            <Navbar />
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Create New Document</h1>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                Document Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                id="title"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                                value={data.title}
                                onChange={e => setData('title', e.target.value)}
                            />
                            {errors.title && <div className="text-red-500 text-sm mt-1">{errors.title}</div>}
                        </div>

                        <div>
                            <label htmlFor="documentType" className="block text-sm font-medium text-gray-700">
                                Document Type
                            </label>
                            <select
                                name="documentType"
                                id="documentType"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                                value={data.documentType}
                                onChange={e => setData('documentType', e.target.value)}
                            >
                                <option value="">Select a type</option>
                                <option value="research">Research Proposal</option>
                                <option value="thesis">Thesis</option>
                                <option value="dissertation">Dissertation</option>
                                <option value="other">Other</option>
                            </select>
                            {errors.documentType && <div className="text-red-500 text-sm mt-1">{errors.documentType}</div>}
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <textarea
                                name="description"
                                id="description"
                                rows={4}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                            />
                            {errors.description && <div className="text-red-500 text-sm mt-1">{errors.description}</div>}
                        </div>

                        <div>
                            <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                                Upload Document
                            </label>
                            <input
                                type="file"
                                name="file"
                                id="file"
                                required
                                className="mt-1 block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-md file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-red-50 file:text-red-700
                                    hover:file:bg-red-100"
                                onChange={e => setData('file', e.target.files?.[0] || null)}
                            />
                            {errors.file && <div className="text-red-500 text-sm mt-1">{errors.file}</div>}
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => window.history.back()}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            >
                                {processing ? 'Submitting...' : 'Submit Document'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default CreateDocument;
