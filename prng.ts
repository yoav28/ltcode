
export class PRNG {
    private state: number;
    private readonly numBlocks: number;
    private readonly cumulativeDistributionFunction: number[];
    private readonly DEFAULT_DELTA: number = 0.5;
    private readonly PRNG_M: number = 2147483647;


    constructor(numBlocks: number, state: number) {
        this.state = state;
        this.numBlocks = numBlocks;
        this.cumulativeDistributionFunction = this.generateRsdCdf();
    }


    public sample_source_blocks(state: number | null): [number, Set<number>] {
        if (state !== null) {
            this.state = state;
        }

        const seed = this.state;
        const degree = this.sampleDegree();

        const selectedBlocks = new Set<number>();

        while (selectedBlocks.size < degree) {
            const nextRandom = this.nextRandom();
            const blockNumber = nextRandom % this.numBlocks;
            selectedBlocks.add(blockNumber);
        }

        return [seed, selectedBlocks];
    }


    private nextRandom(): number {
        this.state = 16807 * this.state % this.PRNG_M;
        return this.state;
    }


    private sampleDegree(): number {
        const probability = this.nextRandom() / (this.PRNG_M - 1);

        for (let index = 0; index < this.cumulativeDistributionFunction.length; index++) {
            if (this.cumulativeDistributionFunction[index] > probability) {
                return index + 1;
            }
        }

        return this.cumulativeDistributionFunction.length;
    }


    private generateTau(S: number): number[] {
        const pivot = Math.floor(this.numBlocks / S);
        const tau = Array.from({ length: pivot - 1 }, (_, d) => S / this.numBlocks / (d + 1));
        tau.push(S / this.numBlocks * Math.log(S / this.DEFAULT_DELTA));
        tau.push(...Array.from({ length: this.numBlocks - pivot }, () => 0));

        return tau;
    }


    private generateRho(): number[] {
        return [1 / this.numBlocks, ...Array.from({ length: this.numBlocks - 1 }, (_, d) => 1 / ((d + 2) * (d + 1)))];
    }


    private generateMu(): number[] {
        const S = Math.log(this.numBlocks / this.DEFAULT_DELTA) * Math.sqrt(this.numBlocks) * 0.1;
        const tau = this.generateTau(S);
        const rho = this.generateRho();
        const normalizer = this.sum(rho) + this.sum(tau);
        return Array.from({ length: this.numBlocks }, (_, d) => (rho[d] + tau[d]) / normalizer);
    }


    private sum(arr: number[]): number {
        return arr.reduce((a, b) => a + b, 0);
    }


    private generateRsdCdf(): number[] {
        const mu = this.generateMu();
        const arr = [];

        for (let d = 0; d < this.numBlocks; d++) {
            const slice_mu = mu.slice(0, d + 1);
            arr.push(this.sum(slice_mu));
        }

        return arr;
    }
}
