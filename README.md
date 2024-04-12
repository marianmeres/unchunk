# @marianmeres/unchunk

Little DRY utility for reconstructing chunks into messages.

## Use case

A server is streaming **multiple** messages (eg `csv` rows, `json` objects...) via `Transfer-Encoding: 'chunked'`...

While the client's [`reader.read`](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams) helps us glue the low level transport chunks, we still need to restore the higher level messages ASAP while the chunks are still incoming. This is where this tool comes in handy.

## Delimiter

Each message (not chunk) must have a _delimiter_ appended at the end for this to work. And of course, both sides (client and server) must use the same _delimiter_.

You can use any _delimiter_ (eg `,`, `\n`, `\r\n`, `\n\n`, `💩`, ...) if you are sure that it does not conflict with the message. By default, this utility uses the single [ASCII Record Separator](https://en.wikipedia.org/wiki/C0_and_C1_control_codes#Field_separators) char `\x1E`, which should be safe for the majority of use cases.

## Usage

Installation:

```bash
npm i @marianmeres/unchunk
```

Signature:

```typescript
createUnchunk(
    onMessage: (message: string) => void,
    messageDelimiter: string = createUnchunk.DELIMITER
): (chunk: string) => void;
```

Illustration example:

```javascript
import { createUnchunk } from '@marianmeres/unchunk';

const messages = [];

// let's create the worker function with a custom "\n\n" delimiter
const unchunk = createUnchunk((message) => {
	// in the real world, we would probably be updating the UI right now...
	messages.push(message);
}, '\n\n');

// Note that the delimiter is split into multiple chunks here for the real
// world illustration. Also note, that in the real world, the chunks
// are streaming in and are not available in advance - which makes this
// example kind of stupid where one could just simply use:
// const messages = chunks.join('').split(delimiter)
const chunks = ['1', '2\n', '\n3', '4', '\n', '\n56\n\n'];

// actual work
chunks.forEach(unchunk);

// we have successfully reconstructed 3 messages
assert(messages.join() === '12,34,56');
```
