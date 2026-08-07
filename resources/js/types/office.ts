export type OfficeDepartment =
    | 'administration'
    | 'finance'
    | 'marketing'
    | 'planning';

export type OfficeRole = 'administrator' | 'manager' | 'staff';

export type Employee = {
    id: number;
    name: string;
    email: string;
    employee_id: string | null;
    department: OfficeDepartment;
    role: OfficeRole;
    is_active: boolean;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
};

export type OfficeAuth = {
    employee: Employee;
};

export type SshKeyInstance = {
    id: number;
    uuid: string;
    team_id: number | null;
    name: string;
    description: string | null;
    type: 'rsa' | 'ecdsa' | 'ed25519';
    public_key: string;
    fingerprint: string;
    created_at: string;
    updated_at: string;
};
