
export class PRNG {
    private seed: number;
    private readonly numBlocks: number;
    private readonly cumulativeDistributionFunction: number[];
    private readonly DEFAULT_DELTA: number = 0.5;
    private readonly PRNG_M: number = 2147483647;
    private readonly LCG_MULTIPLIER: number = 16807;
    private readonly S_SCALING_FACTOR: number = 0.1;


    constructor(numBlocks: number, seed: number) {
        this.seed = seed;
        this.numBlocks = numBlocks;
        this.cumulativeDistributionFunction = this.generateRsdCdf();
    }


    public sample_source_blocks(seed: number | null): [number, Set<number>] {
        const initialSamplingSeed = seed !== null ? seed : this.seed;

        if (seed !== null) {
            this.seed = seed;
        }

        const degree = this.sampleDegree();

        const selectedBlocks = new Set<number>();

        while (selectedBlocks.size < degree) {
            const nextRandom = this.nextRandom();
            const blockNumber = nextRandom % this.numBlocks;
            selectedBlocks.add(blockNumber);
        }

        return [initialSamplingSeed, selectedBlocks];
    }


    private nextRandom(): number {
        this.seed = this.LCG_MULTIPLIER * this.seed % this.PRNG_M;
        return this.seed;
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
        const S = Math.log(this.numBlocks / this.DEFAULT_DELTA) * Math.sqrt(this.numBlocks) * this.S_SCALING_FACTOR;
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
