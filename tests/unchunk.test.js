import { TestRunner } from '@marianmeres/test-runner';
import { strict as assert } from 'node:assert';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createUnchunk } from '../dist/index.js';

const suite = new TestRunner(path.basename(fileURLToPath(import.meta.url)));

suite.test('unchunk', () => {
	const D = '\n\n'; // human readable delimiter
	const json = { foo: { bar: { baz: 'bat' } }, hey: 'ho', n: 123, x: null };

	//
	const jsonString = JSON.stringify(json);
	const jsonStringPretty = JSON.stringify(json, null, 4);

	// helper to explode string into 3 char chunks
	const toChunks = (s) => s.match(/[\s\S]{1,3}/g);

	const poo = '💩'; // poo.length === 2

	// prettier-ignore
	[
		// single chunk
		{ chunks: [``],                               expected: '' },
		{ chunks: [D],                                expected: '' },
		{ chunks: [`1${D}`],                          expected: '1' },
		{ chunks: [`1`],                              expected: '' }, // not ended (no trailing record delimiter)
		{ chunks: [`${D}1`],                          expected: '' }, // not ended (no trailing record delimiter)
		{ chunks: [`${D}1${D}`],                      expected: ',1' },
		// mulitple chunks          
		{ chunks: [D, D, D],                          expected: ',,' },
		{ chunks: [D, `1`, D, `2`, D],                expected: ',1,2' },
		{ chunks: [D, `12`, `3`, D],                  expected: ',123' },
		// chunked delimiter  
		{ chunks: ['1', '2\n', '\n', '34\n\n'],       expected: '12,34' },
		{ chunks: ['1\n', '2\n', '\n34', '\n', '\n'], expected: '1\n2,34' },
		// unicode emoji delimiter
		{
			chunks: ['pile', '💩', `of${poo[0]}`, `${poo[1]}poo${poo[0]}`, poo[1]],
			expected: 'pile,of,poo',
			delimiter: '💩',
		},
		// json
		{
			// if not pretty-printed, we can use the human readable "\n\n"
			chunks: [...toChunks(jsonString), D],
			expected: jsonString,
		},
		// for pretty-printed json chunks we must not use "\n\n" as it would colide...
		// (we still could use "\r\n\n" for example...)
		{
			chunks: [...toChunks(jsonStringPretty), createUnchunk.DELIMITER],
			expected: jsonStringPretty,
			delimiter: createUnchunk.DELIMITER,
		},
	].forEach(({ chunks, expected, delimiter }, i) => {
		const _data = [];
		const unchunk = createUnchunk((d) => _data.push(d), delimiter || D);
		chunks.forEach(unchunk);
		const actual = _data.join();

		assert(
			actual === expected,
			`Error in ${i}\nExpected: ${expected}\nActual: ${actual}`
		);
	});
});

//
export default suite;
