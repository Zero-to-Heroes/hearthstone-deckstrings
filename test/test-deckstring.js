const {
	decode,
	decodeMercs,
	encode,
	encodeMercs,
	FormatType,
	DeckDefinition,
} = require("../dist/index");
const { expect } = require("chai");

describe.only("simple test", () => {
	const deckstring =
		"AAECAa0GDq2KBOWwBKi2BLjZBJfvBP3EBc/GBcbHBa3tBc/2BdiBBqmVBtGbBs2eBg3wnwShtgT52wS43AS63ASGgwXgpAW7xAW7xwXt9wX7+AW4ngbRngYAAQP/4QT9xAXvkQX9xAXFpQX9x";

	it("should decode properly", () => {
		const result = decode(deckstring);
		expect(result).to.not.be.null;
	});
});
