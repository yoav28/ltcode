import {PRNG} from './prng';


export class Encoder {
    private readonly seed: number;
    private readonly size: number;


    constructor(size: number = 100) {
        this.seed = this.randomInt(1073741824);
        this.size = size;
    }


    private randomInt(max: number): number {
        const min = 0;
        const number = Math.random() * (max - min) + min;
        return Math.floor(number);
    }


    private getBlocks(data: Buffer): bigint[] {
        const blocks = [] as bigint[];

        for (let i = 0; i < data.length; i += this.size) {
            let block = data.subarray(i, i + this.size);
            block = this.padBlock(block);

            const n = intFromBytes(block, "little");
            blocks.push(n);
        }

        return blocks;
    }


    private padBlock(block: Buffer): Buffer {
        const padChar = "0";
        let str = block.toString();

        while (str.length < this.size) {
            str = str + padChar;
        }

        return Buffer.from(str);
    }


    public * encode(data: string): Generator<string> {
        const blocks = this.getBlocks(Buffer.from(data));
        const prng = new PRNG(blocks.length, this.seed);

        while (true) {
            const [blockseed, sampledBlocks] = prng.sample_source_blocks();
            let blockData = BigInt(0);

            for (const x of sampledBlocks) {
                const nextBlock = blocks[x];
                blockData ^= nextBlock;
            }

            yield `<length>${data.length}</length><size>${this.size}</size><seed>${blockseed}</seed><data>${blockData}</data>`;
        }
    }
}


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
