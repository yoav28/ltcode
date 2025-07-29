import {intFromBytes} from "./utils";
import {PRNG} from './prng';


export class Encoder {
    private readonly MAX_SEED_VALUE: number = 1073741824;
    private readonly seed: number;
    private readonly blockSize: number;


    constructor(size: number = 100, seed?: number) {
        this.seed = seed || this.randomSeed(this.MAX_SEED_VALUE);
        this.blockSize = size;
    }


    private randomSeed(max: number): number {
        const min = 0;
        const number = Math.random() * (max - min) + min;
        return Math.floor(number);
    }


    private splitToBlocks(data: Uint8Array): bigint[] {
        const blocks = [] as bigint[];

        for (let i = 0; i < data.length; i += this.blockSize) {
            let block = data.subarray(i, i + this.blockSize);

            const n = intFromBytes(block, "little");
            blocks.push(n);
        }

        return blocks;
    }

    
    private generateEncodedBlock(data: string, blocks: bigint[], prng: PRNG): string {
        const [blockseed, sampledBlocks] = prng.sample_source_blocks(null);
        let blockData = BigInt(0);

        for (const x of sampledBlocks) {
            blockData ^= blocks[x];
        }

        return JSON.stringify({
            length: data.length,
            size: this.blockSize,
            seed: blockseed,
            data: blockData.toString()
        });
    }

    
    public * encode(data: string): Generator<string> {
        const blocks = this.splitToBlocks(new TextEncoder().encode(data));
        const prng = new PRNG(blocks.length, this.seed);

        while (true) {
            yield this.generateEncodedBlock(data, blocks, prng);
        }
    }
}
