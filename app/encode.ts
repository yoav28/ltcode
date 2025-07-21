import {PRNG} from './prng';
import {intFromBytes} from "./utils";


export class Encoder {
    private readonly seed: number;
    private readonly size: number;


    constructor(size: number = 100, seed?: number) {
        this.seed = seed || this.randomInt(1073741824);
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

            const n = intFromBytes(block, "little");
            blocks.push(n);
        }

        return blocks;
    }


    public * encode(data: string): Generator<string> {
        const blocks = this.getBlocks(Buffer.from(data));
        const prng = new PRNG(blocks.length, this.seed);

        while (true) {
            const [blockseed, sampledBlocks] = prng.sample_source_blocks(null);
            let blockData = BigInt(0);

            for (const x of sampledBlocks) {
                const nextBlock = blocks[x];
                blockData ^= nextBlock;
            }

            yield JSON.stringify({
                length: data.length,
                size: this.size,
                seed: blockseed,
                data: blockData.toString()
            });
        }
    }
}
