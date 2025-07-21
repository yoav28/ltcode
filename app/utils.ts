
export function intToBytes(
    input: bigint,
    size: number,
    order: "big" | "little" = "big"
): Buffer {
    if (size < 0) {
        throw new RangeError("Size must be non-negative");
    }

    const bytes = new Array<number>(size);
    let n = input;

    if (order === "little") {
        for (let i = 0; i < size; i++) {
            bytes[i] = Number(n & BigInt(0xFF));
            n >>= BigInt(8);
        }
    } else { // "big"
        for (let i = size - 1; i >= 0; i--) {
            bytes[i] = Number(n & BigInt(0xFF));
            n >>= BigInt(8);
        }
    }

    return Buffer.from(bytes);
}

export function intFromBytes(
    buffer: Buffer,
    order: "big" | "little" = "big"
): bigint {
    let result = BigInt(0);

    if (order === "big") {
        for (const byte of buffer) {
            result = (result << BigInt(8)) | BigInt(byte);
        }
    } else { // "little"
        for (let i = buffer.length - 1; i >= 0; i--) {
            result = (result << BigInt(8)) | BigInt(buffer[i]);
        }
    }

    return result;
}
