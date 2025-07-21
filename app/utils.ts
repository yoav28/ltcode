
export function intToBytes(n: bigint, size: number, order: "big" | "little" = "big"): Buffer {
    const bytes = [] as number[];

    if (order === "little") {
        for (let i = 0; i < size; i++) {
            const byte = n % BigInt(256);
            bytes.push(Number(byte));
            n = n / BigInt(256);
        }
    }

    if (order === "big") {
        for (let i = 0; i < size; i++) {
            const byte = n >> BigInt((size - 1 - i) * 8) & BigInt(0xFF);
            bytes.push(Number(byte));
        }
    }


    return Buffer.from(bytes);
}


export function intFromBytes(block: Buffer, order: "big" | "little" = "big"): bigint {
    let result = BigInt(0);

    if (order === "big") {
        for (let i = 0; i < block.length; i++) {
            result = result * BigInt(256) + BigInt(block[i]);
        }
    }

    if (order === "little") {
        for (let i = block.length - 1; i >= 0; i--) {
            result = result * BigInt(256) + BigInt(block[i]);
        }
    }

    return result;
}
