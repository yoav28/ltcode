import {intFromBytes, intToBytes} from "./utils";
import {PRNG} from './prng';


type BlockData = {
    size: number;
    length: number;
    blockseed: number;
    block_data: bigint;
}


class CheckNode {
    source_nodes: Set<number>;
    check_value: bigint;

    constructor(source_nodes: Set<number>, check_value: bigint) {
        this.source_nodes = source_nodes;
        this.check_value = check_value;
    }
}


class BlockGraph {
    num_blocks: number;
    checks: Map<number, CheckNode[]>;
    eliminated: Map<number, bigint>;


    constructor(num_blocks: number) {
        this.num_blocks = num_blocks;
        this.checks = new Map();
        this.eliminated = new Map();
    }


    add_block(nodes: Set<number>, data: bigint): boolean {
        if (nodes.size === 1) {
            const next = nodes.values().next().value as number;
            let to_eliminate = Array.from(this.eliminate(next, data));

            while (to_eliminate.length) {
                const [other, check] = to_eliminate.pop() as [number, bigint];
                to_eliminate.push(...this.eliminate(other, check));
            }
        }

        for (const node of nodes) {
            if (this.eliminated.has(node)) {
                nodes.delete(node);
                data = data ^ this.eliminated.get(node)!;
            }
        }

        if (nodes.size === 1) {
            return this.add_block(nodes, data);
        }

        return this._create_check_node(nodes, data);
    }


    * eliminate(node: number, data: bigint): Generator<[number, bigint]> {
        this.eliminated.set(node, data);
        const others = this.checks.get(node) || [];
        this.checks.delete(node);

        for (const check of others) {
            check.check_value = check.check_value ^ data;
            check.source_nodes.delete(node);

            if (check.source_nodes.size === 1) {
                const next = check.source_nodes.values().next().value as number;
                yield [next, check.check_value];
            }
        }
    }


    _create_check_node(nodes: Set<number>, data: bigint): boolean {
        const check_node = new CheckNode(new Set(nodes), data);
        for (const node of nodes) {
            this.checks.set(node, [...(this.checks.get(node) || []), check_node]);
        }

        return this.eliminated.size >= this.num_blocks;
    }
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


    public result(): Buffer {
        if (!this.initialized || !this.num_blocks || !this.file_size || !this.block_size) {
            throw new Error("Decoder not initialized");
        }

        const sorted_blocks = Array.from(this.block_graph.eliminated.entries()).sort((a, b) => a[0] - b[0]);
        let out_stream = Buffer.alloc(0);

        for (let i = 0; i < this.num_blocks; i++) {
            const sorted_block = sorted_blocks[i];
            const block_data = intToBytes(sorted_block[1], this.block_size, 'big');

            if (i < this.num_blocks - 1 || this.file_size % this.block_size === 0) {
                out_stream = Buffer.concat([out_stream, block_data]);
            } else {
                const x = block_data.subarray(0, this.file_size % this.block_size)
                out_stream = Buffer.concat([out_stream, x]);
            }
        }

        return out_stream;
    }


    private consume_block(lt_block: BlockData): boolean {
        const {size, length, blockseed, block_data} = lt_block;

        if (!this.initialized)
            this._initialize(length, size, blockseed);


        const [blockseed_, source_blocks] = this.prng.sample_source_blocks(blockseed);
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
        const length = data.match(/<length>(.*?)<\/length>/) as RegExpMatchArray;
        const block_data = data.match(/<data>(.*?)<\/data>/) as RegExpMatchArray;
        const blockseed = data.match(/<seed>(.*?)<\/seed>/) as RegExpMatchArray;
        const size = data.match(/<size>(.*?)<\/size>/) as RegExpMatchArray;

        const block_data_int = BigInt(block_data[1]);
        const bytes = intToBytes(block_data_int, Number(size[1]), "little");
        const block_data_ = intFromBytes(bytes, "big");

        return {
            size: Number(size[1]),
            length: Number(length[1]),
            blockseed: Number(blockseed[1]),
            block_data: block_data_
        };
    }


    private isBlockValid(block: string): boolean {
        return block.match(/<length>(.*?)<\/length><size>(.*?)<\/size><seed>(.*?)<\/seed><data>(.*?)<\/data>/) !== null;
    }
}
