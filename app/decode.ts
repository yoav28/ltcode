import {intFromBytes, intToBytes, concatUint8Arrays} from "./utils";
import {BlockGraph} from "./blockgraph";
import {PRNG} from './prng';


type BlockData = {
    size: number;
    length: number;
    blockseed: number;
    block_data: bigint;
}


export class Decoder {
    initialized: boolean = false;
    file_size: number | null = null;
    block_size: number | null = null;
    num_blocks: number | null = null;
    block_graph: BlockGraph;
    prng: any;


    constructor() {
        this.block_graph = new BlockGraph(0);
        this.prng = null;
    }


    public decode(data: string): boolean {
        if (!this.isBlockValid(data))
            return false;

        const next_block = this.readBlocks(data).next().value;
        return this.consume_block(next_block);
    }
    

    public getProgress(): number {
        if (!this.initialized || this.num_blocks == null) {
            return 0;
        }

        const eliminated = this.block_graph.eliminated.size;
        return Math.round(eliminated / this.num_blocks * 100);
    }
    
    
    public result(): string {
        const bytes = this.resultBytes();
        return bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
    }


    public resultBytes(): Uint8Array {
        if (!this.initialized || !this.num_blocks || !this.file_size || !this.block_size) {
            throw new Error("Decoder not initialized");
        }

        const sorted_blocks = Array.from(this.block_graph.eliminated.entries()).sort((a, b) => a[0] - b[0]);
        let out_stream: Uint8Array[] = [];

        for (let i = 0; i < this.num_blocks; i++) {
            const sorted_block = sorted_blocks[i];
            const block_data = intToBytes(sorted_block[1], this.block_size, 'big');

            if (i < this.num_blocks - 1 || this.file_size % this.block_size === 0) {
                out_stream.push(block_data);
            } else {
                const x = block_data.subarray(0, this.file_size % this.block_size)
                out_stream.push(x);
            }
        }

        return concatUint8Arrays(out_stream);
    }


    private consume_block(lt_block: BlockData): boolean {
        const {size, length, blockseed, block_data} = lt_block;

        if (!this.initialized)
            this._initialize(length, size, blockseed);


        const [_, source_blocks] = this.prng.sample_source_blocks(blockseed);
        return this.block_graph.add_block(source_blocks, block_data);
    }


    private _initialize(file_size: number, block_size: number, block_seed: number): void {
        this.file_size = file_size;
        this.block_size = block_size;
        this.num_blocks = Math.ceil(file_size / block_size);
        this.block_graph = new BlockGraph(this.num_blocks);
        this.prng = new PRNG(this.num_blocks, block_seed);
        this.initialized = true;
    }


    private * readBlocks(data: string): Generator<BlockData> {
        const {size, length, seed, data: block_data} = JSON.parse(data);

        const block_data_int = BigInt(block_data);
        const bytes = intToBytes(block_data_int, Number(size), "little");
        const block_data_ = intFromBytes(bytes, "big");

        return {
            size: Number(size),
            length: Number(length),
            blockseed: Number(seed),
            block_data: block_data_
        };
    }


    private _isBlockValid(parsedBlock: any): boolean {
        const {length, size, seed, data} = parsedBlock;
        if (typeof length !== 'number') {
            throw new Error('Invalid block: length is not a number.');
        }
        if (typeof size !== 'number') {
            throw new Error('Invalid block: size is not a number.');
        }
        if (typeof seed !== 'number') {
            throw new Error('Invalid block: seed is not a number.');
        }
        if (typeof data !== 'string') {
            throw new Error('Invalid block: data is not a string.');
        }
        return true;
    }
}
