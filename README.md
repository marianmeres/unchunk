# @marianmeres/unchunk

Little DRY utility for reconstructing chunks into messages.

## Use case

A server is streaming **multiple messages** (eg `csv` rows, `json` objects...) via `Transfer-Encoding: 'chunked'`...

While the client's [`reader.read`](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams) does glue the low level transport chunks for us, we still need to restore the higher level "domain messages". This is where this tool comes in handy.

## Delimiter

The chunked data must have a _delimiter_ appended at the end for this to work. And of course, both sides (client and server) must use the same _delimiter_.

You can use any _delimiter_ (eg `,`, `\n`, `\r\n`, `\n\n`, `💩`, ...) unless it does not conflict with the data. By default it uses single [ASCII Record Separator](https://en.wikipedia.org/wiki/C0_and_C1_control_codes#Field_separators) char `\x1E` which should be safe for general usage.

## Usage

Installation:

```bash
npm i @marianmeres/unchunk
```

Signature:

```typescript
createUnchunk(
    onMessage: (message: string) => void,
    recordDelimiter: string = createUnchunk.DELIMITER
): (chunk: string) => void;
```

Illustration example:

```javascript
import { createUnchunk } from '@marianmeres/unchunk';

const messages = [];

// we're using a custom "\n\n" delimiter here
const unchunk = createUnchunk((d) => messages.push(d), '\n\n');

// Note that the delimiter is split into multiple chunks here for illustration
const chunks = ['1', '2\n', '\n', '34\n\n'];

// actual work
chunks.forEach(unchunk);

assert(messages.join() === '12,34');
```
