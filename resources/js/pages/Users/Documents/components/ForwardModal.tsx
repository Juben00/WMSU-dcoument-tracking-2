import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Office {
    id: number;
    name: string;
    contact_person: {
        id: number;
        name: string;
        role: string;
    } | null;
}

interface ForwardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onForward: (officeId: number, comments: string) => void;
    processing: boolean;
    offices?: Office[];
}

const ForwardModal: React.FC<ForwardModalProps> = ({ isOpen, onClose, onForward, processing, offices }) => {
    const [comments, setComments] = useState('');
    const [selectedOffice, setSelectedOffice] = useState<string>('');

    const handleSubmit = () => {
        if (selectedOffice) {
            onForward(parseInt(selectedOffice), comments);
            setComments('');
            setSelectedOffice('');
        }
    };

    return (
        <Dialog
            open={isOpen}
            onClose={() => {
                onClose();
                setComments('');
                setSelectedOffice('');
            }}
            className="relative z-50"
        >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-6">
                    <Dialog.Title className="text-lg font-medium mb-4">Forward Document</Dialog.Title>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Select Office</label>
                            <Select
                                value={selectedOffice}
                                onValueChange={setSelectedOffice}
                            >
                                <SelectTrigger className="w-full mt-1">
                                    <SelectValue placeholder="Select office" />
                                </SelectTrigger>
                                <SelectContent>
                                    {offices?.map((office) => (
                                        office.contact_person && (
                                            <SelectItem key={office.contact_person.id} value={office.contact_person.id.toString()}>
                                                {office.contact_person.name} - {office.name}
                                            </SelectItem>
                                        )
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Comments</label>
                            <Textarea
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                className="mt-1"
                                rows={3}
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    onClose();
                                    setComments('');
                                    setSelectedOffice('');
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={processing || !selectedOffice}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {processing ? 'Processing...' : 'Forward'}
                            </button>
                        </div>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

export default ForwardModal;
