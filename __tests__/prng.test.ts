import {PRNG} from '../app/prng';


describe('PRNG', () => {
	const numBlocks = 100;
	const initialState = 12345;

	let prng: PRNG;

	beforeEach(() => {
		prng = new PRNG(numBlocks, initialState);
	});

	it('should generate a predictable sequence of random numbers', () => {
		const expectedSequence = [
			16807 * initialState % 2147483647,
			16807 * (16807 * initialState % 2147483647) % 2147483647,
			// Add more expected values if needed
		];

		// Accessing private method for testing purposes
		const nextRandom = (prng as any).nextRandom.bind(prng);

		expect(nextRandom()).toBe(expectedSequence[0]);
		expect(nextRandom()).toBe(expectedSequence[1]);
	});

	it('should sample source blocks with the correct seed', () => {
		const [seed, sampledBlocks] = prng.sample_source_blocks(null);
		expect(seed).toBe(initialState);
		expect(sampledBlocks.size).toBeGreaterThan(0);
		expect(sampledBlocks.size).toBeLessThanOrEqual(numBlocks);
		sampledBlocks.forEach(block => {
			expect(block).toBeGreaterThanOrEqual(0);
			expect(block).toBeLessThan(numBlocks);
		});
	});

	it('should update the state when a new state is provided to sample_source_blocks', () => {
		const newState = 54321;
		const [seed, sampledBlocks] = prng.sample_source_blocks(newState);
		expect(seed).toBe(newState);
	});

	it('should generate unique sampled blocks for a given seed', () => {
		const [seed1, sampledBlocks1] = prng.sample_source_blocks(1000);
		const [seed2, sampledBlocks2] = prng.sample_source_blocks(1000);
		// With the same seed, the sampled blocks should be the same
		expect(Array.from(sampledBlocks1).sort()).toEqual(Array.from(sampledBlocks2).sort());
	});

	it('should generate different sampled blocks for different seeds', () => {
		const [seed1, sampledBlocks1] = prng.sample_source_blocks(1000);
		const [seed2, sampledBlocks2] = prng.sample_source_blocks(1001);
		// With different seeds, the sampled blocks should be different
		expect(Array.from(sampledBlocks1).sort()).not.toEqual(Array.from(sampledBlocks2).sort());
	});

	it('should generate a degree within the valid range', () => {
		// This test is probabilistic, so we run it multiple times
		for (let i = 0; i < 100; i++) {
			const degree = (prng as any).sampleDegree(); // Access private method
			expect(degree).toBeGreaterThanOrEqual(1);
			expect(degree).toBeLessThanOrEqual(numBlocks);
		}
	});

	it('should have a cumulative distribution function that is non-decreasing', () => {
		const cdf = (prng as any).cumulativeDistributionFunction; // Access private property
		for (let i = 0; i < cdf.length - 1; i++) {
			expect(cdf[i]).toBeLessThanOrEqual(cdf[i + 1]);
		}
	});

	it('should have a cumulative distribution function where the last element is close to 1', () => {
		const cdf = (prng as any).cumulativeDistributionFunction; // Access private property
		expect(cdf[cdf.length - 1]).toBeCloseTo(1);
	});
});
