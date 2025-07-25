import {Decoder} from "./decode";
import {Encoder} from "./encode";



const text = "Hello, World! ".repeat(10000);

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

console.log(decoder.result());
