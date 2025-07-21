
export class CheckNode {
	source_nodes: Set<number>;
	check_value: bigint;

	constructor(source_nodes: Set<number>, check_value: bigint) {
		this.source_nodes = source_nodes;
		this.check_value = check_value;
	}
}


export class BlockGraph {
	checks: Map<number, CheckNode[]>;
	eliminated: Map<number, bigint>;
	num_blocks: number;


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
