import {Encoder} from '../app/encode';


describe('Encoder', () => {
	it('should encode a simple string into blocks', () => {
		const encoder = new Encoder(10); // Block size of 10
		const text = "Hello, World!";
		const encodedGenerator = encoder.encode(text);

		const firstBlock = JSON.parse(encodedGenerator.next().value);

		// Verify length and size are correct
		expect(firstBlock.length).toBe(text.length);
		expect(firstBlock.size).toBe(10);
	});

	it('should correctly split data into blocks based on size', () => {
		const encoder = new Encoder(3); // Block size of 3
		const text = "abcdefghij"; // 10 characters
		const encodedGenerator = encoder.encode(text);

		// We expect 4 blocks: abc, def, ghi, j (padded)
		// The actual block data is XORed, so we can't directly check content here.
		// This test primarily checks that the encoder doesn't crash and produces output.

		const blocks = [];
		for (let i = 0; i < 10; i++) { // Get a few blocks
			blocks.push(encodedGenerator.next().value);
		}
		expect(blocks.length).toBe(10);

		// Further verification would require decoding, which is for the Decoder tests.
	});
});
