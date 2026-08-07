import { Head } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { index as sshKeysIndex } from '@/actions/App/Http/Controllers/Office/SshKeyController';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { getRelativeUrl } from '@/lib/utils';
import type { SshKeyInstance } from '@/types/office';
import { CreateSshKeyDialog } from './components/create-ssh-key-dialog';
import { SshKeyTable } from './components/ssh-key-table';
import { ViewSshKeyDialog } from './components/view-ssh-key-dialog';
import { useSshKeys } from './hooks/use-ssh-keys';

export default function SshKeysIndex({ sshKeys }: { sshKeys: SshKeyInstance[] }) {
    const {
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
    } = useSshKeys(sshKeys);

    return (
        <>
            <Head title="SSH Key Management" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 font-base">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Heading
                        title="SSH Key Management"
                        description="Manage global SSH private keys for remote deployments, build runners, and cluster nodes."
                    />
                    <div>
                        <Button onClick={() => setIsCreateOpen(true)} className="gap-2 shadow-shadow border-2 border-border">
                            <Plus className="h-4 w-4" />
                            Add SSH Key
                        </Button>
                    </div>
                </div>

                <SshKeyTable
                    keys={filteredKeys}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onView={setViewingKey}
                    onDelete={handleDelete}
                    deleteProcessing={deleteForm.processing}
                />
            </div>

            {/* Create SSH Key Dialog */}
            <CreateSshKeyDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                onSubmit={handleCreateSubmit}
                form={createForm}
            />

            {/* View Public Key Dialog */}
            <ViewSshKeyDialog
                keyInstance={viewingKey}
                onClose={() => setViewingKey(null)}
            />
        </>
    );
}

SshKeysIndex.layout = {
    breadcrumbs: [
        {
            title: 'SSH Key Management',
            href: getRelativeUrl(sshKeysIndex.url()),
        },
    ],
};
