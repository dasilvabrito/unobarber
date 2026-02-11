"use client";

import React from 'react';

interface PhoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const formatPhone = (value: string) => {
    // Remove all non-digits
    const numbers = value.replace(/\D/g, "");

    // Limits to 11 digits
    const validNumbers = numbers.slice(0, 11);

    // Apply mask based on length
    if (validNumbers.length <= 10) {
        return validNumbers.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3")
            .replace(/(-\s*$)|(\s*$)/, ""); // Trim trailing chars if incomplete
    } else {
        return validNumbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
};

export default function PhoneInput({ value, onChange, className, ...props }: PhoneInputProps) {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        // Clean all non-digits to get raw value
        const onlyNums = rawValue.replace(/\D/g, "");

        // Prevent typing more than 11 digits
        if (onlyNums.length > 11) return;

        // Format
        let formatted = onlyNums;
        if (onlyNums.length > 0) {
            formatted = formatPhone(onlyNums);
        }

        // Update input directly to avoid cursor jumping issues if possible, 
        // but React controlled components need state update.
        // We pass the formatted value to the parent.

        // Construct a synthetic event or just call onChange with a modified target
        // We must ensure we don't lose the event properties if parent uses them.
        // Best way for simple inputs is to clone the event or modify the target value before calling handler.
        e.target.value = formatted;
        onChange(e);
    };

    return (
        <input
            {...props}
            type="tel"
            value={value}
            onChange={handleChange}
            className={className}
            maxLength={15} // (11) 99999-9999 is 15 chars
        />
    );
}
