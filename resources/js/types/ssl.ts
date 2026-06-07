export type CaStatus = {
    root: boolean;
    root_ecc: boolean;
    intermediate_2048: boolean;
    intermediate_4096: boolean;
    intermediate_ecc_256: boolean;
    intermediate_ecc_384: boolean;
    is_ready: boolean;
};

export type CaCertificate = {
    uuid: string;
    ca_type: string;
    common_name: string;
    organization: string;
    serial_number: string;
    issuer_name: string | null;
    family_id: string;
    valid_from: string;
    valid_to: string;
    is_latest: boolean;
    created_at: string;
};

export type Certificate = {
    id: number;
    uuid: string;
    common_name: string;
    organization: string | null;
    locality: string | null;
    state: string | null;
    country: string | null;
    san: string | null;
    serial_number: string;
    key_algorithm: string;
    key_bits: string | null;
    curve_name: string | null;
    valid_from: string;
    valid_to: string;
    created_at: string;
};
