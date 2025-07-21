# Luby Transform Codes

This project is a TypeScript implementation of Luby Transform (LT) codes, a type of forward error correction (FEC) code.
LT codes are fountain codes, meaning they can generate a potentially limitless stream of encoded blocks from a fixed set
of source blocks. The original data can be reconstructed from any subset of the encoded blocks, as long as the number of
received blocks is slightly larger than the number of source blocks.

## How it Works

The project is divided into several key components:

### Encoder (`encode.ts`)

The `Encoder` takes a string of data as input and generates an infinite stream of encoded blocks. Each block is a string
containing the following information:

- `<length>`: The length of the original data.
- `<size>`: The size of each block.
- `<seed>`: The seed used to generate the random numbers for this block.
- `<data>`: The encoded data (XOR sum of selected source blocks).

### Decoder (`decode.ts`)

The `Decoder` takes the encoded blocks as input and reconstructs the original data. It does this by building a graph of
the relationships between the blocks and then using a process of elimination (Gaussian elimination-like process) to
solve for the original data blocks.

### Pseudo-Random Number Generator (PRNG) (`prng.ts`)

This module implements a custom PRNG used by both the `Encoder` and `Decoder` to ensure that the same source blocks are
sampled for a given seed. It also handles the degree distribution (how many source blocks contribute to an encoded
block) based on the robust soliton distribution.

### Utilities (`utils.ts`)

This file provides helper functions for converting between `BigInt` (used for block data) and `Buffer` (byte arrays),
handling both big-endian and little-endian byte orders.

## How to Use

To use the project, you can run the `example.ts` file:

```bash
pnpm install
pnpm start
```

This will encode and decode a sample message and print the result to the console.

## API Reference

### `Encoder` Class

- `constructor(size: number = 100)`: Initializes the encoder with an optional block size.
- `encode(data: string): Generator<string>`: A generator function that yields encoded blocks as strings.

### `Decoder` Class

- `constructor()`: Initializes the decoder.
- `decode(data: string): boolean`: Consumes an encoded block string. Returns `true` if decoding is complete, `false`
  otherwise.
- `result(): Buffer`: Returns the reconstructed original data as a Buffer. Throws an error if decoding is not yet
  complete.

### `PRNG` Class

- `constructor(numBlocks: number, state: number)`: Initializes the PRNG with the total number of source blocks and an
  initial state (seed).
- `sample_source_blocks(state: number | null): [number, Set<number>]`: Samples a set of source block indices and returns
  the seed used and the set of indices. If `state` is provided, it updates the PRNG's internal state.