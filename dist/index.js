function createUnchunk(onMessage, messageDelimiter = createUnchunk.DELIMITER) {
    let buffer = '';
    let delimiterCursor = -1;
    // sanity checks
    if (typeof onMessage !== 'function') {
        throw new TypeError('Expecting `onMessage` callback as a first argument.');
    }
    if (typeof messageDelimiter !== 'string' || !messageDelimiter.length) {
        throw new TypeError('The delimiter is expected to be a non-empty string.');
    }
    // return the `unchunk` worker fn
    return (chunk) => {
        if (typeof chunk !== 'string') {
            throw new TypeError(`Expecting the chunk to be a string (got '${typeof chunk}').`);
        }
        // walk the chunk...
        for (let cursor = 0; cursor < chunk.length; ++cursor) {
            const char = chunk[cursor];
            // simply appending chunk char to buffer...
            buffer += char;
            // unless delimiter is reached
            if (
            // maybe start of the delimiter, or...
            (delimiterCursor === -1 && char === messageDelimiter[0]) ||
                // still inside of the multichar delimiter
                (delimiterCursor > -1 && char === messageDelimiter[delimiterCursor + 1])) {
                // move internal pointer...
                delimiterCursor++;
                // if we've reached the end of the delimiter...
                if (messageDelimiter.length === delimiterCursor + 1) {
                    // emit buffered data excluding the trailing delimiter
                    onMessage(buffer.slice(0, -messageDelimiter.length));
                    // and reset internal state
                    buffer = '';
                    delimiterCursor = -1;
                }
            }
            // we are not within delimiter (anymore), so make sure the cursor is reset
            else {
                delimiterCursor = -1;
            }
        }
    };
}
// https://en.wikipedia.org/wiki/C0_and_C1_control_codes#Field_separators
createUnchunk.DELIMITER = '\x1E';

export { createUnchunk };
