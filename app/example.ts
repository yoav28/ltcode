import {Decoder} from "./decode";
import {Encoder} from "./encode";



const text = "Hello, World! This is a test message to be encoded and decoded.".repeat(10);

const encoder = new Encoder();
const encoded = encoder.generateBlocks(text);
console.log(encoded)

const decoder = new Decoder();


while (true) {
    const next = encoded.next();
    const has_finished = decoder.decode(next.value);

    if (has_finished) {
        break;
    }
}

console.log(decoder.result().toString());
