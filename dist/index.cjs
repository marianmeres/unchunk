'use strict';

function createUnchunk(onData, recordDelimiter = createUnchunk.DELIMITER) {
    let buffer = '';
    let delimiterCursor = -1;
    // sanity checks
    if (typeof onData !== 'function')
        throw new TypeError('Expecting callback as a second argument.');
    if (!recordDelimiter.length)
        throw new TypeError(`Delimiter must not be empty.`);
    //
    return (chunk) => {
        if (typeof chunk !== 'string')
            throw new TypeError(`Expecting chunk to be a string (got ${typeof chunk}).`);
        for (let cursor = 0; cursor < chunk.length; ++cursor) {
            const char = chunk[cursor];
            // simply just appending chunk chars to buffer...
            buffer += char;
            // unless delimiter is reached
            if (
            // maybe start of the delimiter, or...
            (delimiterCursor === -1 && char === recordDelimiter[0]) ||
                // still inside of the multichar delimiter
                (delimiterCursor > -1 && char === recordDelimiter[delimiterCursor + 1])) {
                // move internal pointer...
                delimiterCursor++;
                // if we've reached the end of the delimiter...
                if (recordDelimiter.length === delimiterCursor + 1) {
                    // emit buffered data excluding the trailing delimiter
                    onData(buffer.slice(0, -recordDelimiter.length));
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

exports.createUnchunk = createUnchunk;
