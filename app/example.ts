import {Decoder} from "./decode";
import {Encoder} from "./encode";



const text = "Hello, World! This is a test message to be encoded and decoded.";
const encoder = new Encoder();

const encoded = encoder.encode(text);
const decoder = new Decoder();


while (true) {
    const next = encoded.next();
    const has_finished = decoder.decode(next.value);

    if (has_finished) {
        break;
    }
}

console.log(decoder.result().toString());
