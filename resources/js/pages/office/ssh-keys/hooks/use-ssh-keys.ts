import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import type React from 'react';
import { toast } from 'sonner';
import { index as sshKeysIndex } from '@/actions/App/Http/Controllers/Office/SshKeyController';
import { getRelativeUrl } from '@/lib/utils';
import type { SshKeyInstance } from '@/types/office';

export function useSshKeys(initialKeys: SshKeyInstance[]) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [viewingKey, setViewingKey] = useState<SshKeyInstance | null>(null);

    // Create Key Form
    const createForm = useForm({
        name: '',
        description: '',
        private_key: '',
        creation_method: 'generate' as 'generate' | 'import',
        type: 'ed25519' as 'rsa' | 'ed25519',
    });

    // Delete Key Form
    const deleteForm = useForm({});

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(getRelativeUrl(sshKeysIndex.url()), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('SSH Key successfully created!');
                setIsCreateOpen(false);
                createForm.reset();
            },
            onError: (errors) => {
                toast.error(errors.private_key || errors.name || 'Failed to create SSH Key.');
            },
        });
    };

    const handleDelete = (key: SshKeyInstance) => {
        if (confirm(`Are you sure you want to delete SSH Key "${key.name}"?`)) {
            deleteForm.delete(getRelativeUrl(sshKeysIndex.url()) + `/${key.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('SSH Key deleted successfully.');
                },
                onError: () => {
                    toast.error('Failed to delete SSH Key.');
                },
            });
        }
    };

    const filteredKeys = initialKeys.filter((key) =>
        key.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (key.description && key.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        key.fingerprint.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return {
        searchQuery,
        setSearchQuery,
        isCreateOpen,
        setIsCreateOpen,
        viewingKey,
        setViewingKey,
        createForm,
        deleteForm,
        handleCreateSubmit,
        handleDelete,
        filteredKeys,
    };
}
