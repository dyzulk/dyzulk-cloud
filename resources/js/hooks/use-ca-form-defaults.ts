import { useEffect } from 'react';
import type { CaStatus } from '@/types';

interface MinimumFormData {
    algorithm: 'rsa' | 'ecc';
    key_bits: string;
    curve_name: string;
}

/**
 * Custom hook to ensure form default values for CA generation are valid
 * based on the current CA availability status.
 */
export function useCaFormDefaults<T extends MinimumFormData>(
    isDialogOpen: boolean,
    data: T,
    setData: (callback: (prev: T) => T) => void,
    caStatus: CaStatus,
) {
    useEffect(() => {
        if (!isDialogOpen) return;

        let newAlgorithm = data.algorithm;
        let newKeyBits = data.key_bits;
        let newCurveName = data.curve_name;

        const rsaAvailable =
            caStatus.intermediate_2048 || caStatus.intermediate_4096;
        const eccAvailable =
            caStatus.intermediate_ecc_256 || caStatus.intermediate_ecc_384;

        // Auto-switch algorithm if the selected one is completely unavailable
        if (newAlgorithm === 'rsa' && !rsaAvailable && eccAvailable) {
            newAlgorithm = 'ecc';
        } else if (newAlgorithm === 'ecc' && !eccAvailable && rsaAvailable) {
            newAlgorithm = 'rsa';
        }

        // Auto-switch key bits or curve name if the selected one is unavailable
        if (newAlgorithm === 'rsa') {
            if (
                newKeyBits === '2048' &&
                !caStatus.intermediate_2048 &&
                caStatus.intermediate_4096
            )
                newKeyBits = '4096';
            if (
                newKeyBits === '4096' &&
                !caStatus.intermediate_4096 &&
                caStatus.intermediate_2048
            )
                newKeyBits = '2048';
        } else {
            if (
                newCurveName === 'prime256v1' &&
                !caStatus.intermediate_ecc_256 &&
                caStatus.intermediate_ecc_384
            )
                newCurveName = 'secp384r1';
            if (
                newCurveName === 'secp384r1' &&
                !caStatus.intermediate_ecc_384 &&
                caStatus.intermediate_ecc_256
            )
                newCurveName = 'prime256v1';
        }

        // Only update state if changes are required to prevent infinite loops
        if (
            newAlgorithm !== data.algorithm ||
            newKeyBits !== data.key_bits ||
            newCurveName !== data.curve_name
        ) {
            setData((prev) => ({
                ...prev,
                algorithm: newAlgorithm as 'rsa' | 'ecc',
                key_bits: newKeyBits,
                curve_name: newCurveName,
            }));
        }
    }, [isDialogOpen, data.algorithm, caStatus]);
}
