/**
 * PromptPay QR Code Payload Generator
 * ตามมาตรฐาน EMVCo QR Code Specification for Payment Systems
 */

function formatTLV(tag: string, value: string): string {
    const length = value.length.toString().padStart(2, '0');
    return `${tag}${length}${value}`;
}

function formatTarget(promptpayId: string): string {
    // Clean up — remove dashes and spaces
    const cleaned = promptpayId.replace(/[-\s]/g, '');

    // Determine aid and format
    let aid: string;
    let formattedId: string;

    if (cleaned.length >= 13) {
        // National ID (13 digits)
        aid = 'A000000677010112';
        formattedId = cleaned;
    } else {
        // Phone number — ensure +66 prefix
        aid = 'A000000677010111';
        if (cleaned.startsWith('0')) {
            formattedId = '0066' + cleaned.substring(1);
        } else if (cleaned.startsWith('66')) {
            formattedId = '00' + cleaned;
        } else if (cleaned.startsWith('+66')) {
            formattedId = '00' + cleaned.substring(1);
        } else {
            formattedId = '0066' + cleaned;
        }
    }

    // Merchant Account Information (Tag 29)
    const aidTLV = formatTLV('00', aid);
    const idTLV = formatTLV('01', formattedId);
    return formatTLV('29', aidTLV + idTLV);
}

function crc16(data: string): string {
    let crc = 0xffff;
    for (let i = 0; i < data.length; i++) {
        crc ^= data.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            if (crc & 0x8000) {
                crc = (crc << 1) ^ 0x1021;
            } else {
                crc <<= 1;
            }
            crc &= 0xffff;
        }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function generatePromptPayPayload(
    promptpayId: string,
    amount?: number
): string {
    let payload = '';

    // Payload Format Indicator
    payload += formatTLV('00', '01');
    // Point of Initiation Method (12 = dynamic for amount)
    payload += formatTLV('01', amount ? '12' : '11');
    // Merchant Account Information
    payload += formatTarget(promptpayId);
    // Country Code
    payload += formatTLV('58', 'TH');
    // Transaction Currency (764 = THB)
    payload += formatTLV('53', '764');
    // Transaction Amount
    if (amount) {
        payload += formatTLV('54', amount.toFixed(2));
    }

    // CRC placeholder then calculate
    const crcData = payload + '6304';
    const checksum = crc16(crcData);
    payload += formatTLV('63', checksum);

    return payload;
}
