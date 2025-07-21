
export function intToBytes(
    input: bigint,
    size: number,
    order: "big" | "little" = "big"
): Uint8Array {
    if (size < 0) {
        throw new RangeError("Size must be non-negative");
    }

    const bytes = new Uint8Array(size);
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

    return bytes;
}

export function intFromBytes(
    buffer: Uint8Array,
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

export function concatUint8Arrays(arrays: Uint8Array[]): Uint8Array {
    let totalLength = 0;
    for (const arr of arrays) {
        totalLength += arr.length;
    }
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const arr of arrays) {
        result.set(arr, offset);
        offset += arr.length;
    }
    return result;
}
