import {intFromBytes, intToBytes} from '../app/utils';

// Helper function to convert Uint8Array to hex string for testing
function uint8ArrayToHex(uint8Array: Uint8Array): string {
    return Array.from(uint8Array).map(b => b.toString(16).padStart(2, '0')).join('');
}

describe('intToBytes', () => {
	it('should convert a BigInt to bytes in big-endian order', () => {
		const num = BigInt(258);
		const size = 2;
		const bytes = intToBytes(num, size, 'big');
		expect(uint8ArrayToHex(bytes)).toBe('0102');
	});

	it('should convert a BigInt to bytes in little-endian order', () => {
		const num = BigInt(258);
		const size = 2;
		const bytes = intToBytes(num, size, 'little');
		expect(uint8ArrayToHex(bytes)).toBe('0201');
	});

	it('should handle single byte numbers', () => {
		const num = BigInt(10);
		const size = 1;
		const bytes = intToBytes(num, size, 'big');
		expect(uint8ArrayToHex(bytes)).toBe('0a');
	});

	it('should handle zero', () => {
		const num = BigInt(0);
		const size = 4;
		const bytes = intToBytes(num, size, 'big');
		expect(uint8ArrayToHex(bytes)).toBe('00000000');
	});

	it('should handle larger numbers', () => {
		const num = BigInt('12345678901234567890');		const size = 9;
		const bytes = intToBytes(num, size, 'big');
		expect(uint8ArrayToHex(bytes)).toBe('00ab54a98ceb1f0ad2');
	});
});

describe('intFromBytes', () => {
	it('should convert bytes to a BigInt in big-endian order', () => {
		const bytes = new Uint8Array([0x01, 0x02]);
		const num = intFromBytes(bytes, 'big');
		expect(num).toBe(BigInt(258));
	});

	it('should convert bytes to a BigInt in little-endian order', () => {
		const bytes = new Uint8Array([0x02, 0x01]);
		const num = intFromBytes(bytes, 'little');
		expect(num).toBe(BigInt(258));
	});

	it('should handle single byte numbers', () => {
		const bytes = new Uint8Array([0x0a]);
		const num = intFromBytes(bytes, 'big');
		expect(num).toBe(BigInt(10));
	});

	it('should handle zero', () => {
		const bytes = new Uint8Array([0x00, 0x00, 0x00, 0x00]);
		const num = intFromBytes(bytes, 'big');
		expect(num).toBe(BigInt(0));
	});

	it('should handle larger numbers', () => {
		const bytes = new Uint8Array([0x00, 0xab, 0x54, 0xa9, 0x8c, 0xeb, 0x1f, 0x0a, 0xd2]);
		const num = intFromBytes(bytes, 'big');
		expect(num).toBe(BigInt('12345678901234567890'));
	});
});
