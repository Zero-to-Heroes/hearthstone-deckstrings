const {
	decode,
	decodeMercs,
	encode,
	encodeMercs,
	FormatType,
	DeckDefinition,
} = require("../dist/index");
const { expect } = require("chai");

describe("decode without sideboards", () => {
	const deckstring =
		"AAECAR8E1/kF6KkG/eUG5uYGDebKBeT1BZf2Bcj2BdL4BcuOBtKOBpCeBvGlBvKlBv+lBpKmBtfzBgAA";

	it("should decode properly", () => {
		const result = decode(deckstring);
		expect(result).to.not.be.null;
	});
});

describe("decode two sideboards", () => {
	const deckstring =
		"AAECAfHhBAr9xAX8+QWT+wXt/wWLkgb/lwbNngbHpAa7sQa9sQYK9eMEkOQEhY4GlJUGl5UGkZcG0Z4GkqAG1uUG2OUGAAEGgvgF/cQFy7AG/cQFu7EG/cQF8LMGx6QG97MGx6QG7t4Gx6QGAAA=";

	it("should decode= properly", () => {
		const result = decode(deckstring);
		expect(result).to.not.be.null;
		expect(result.sideboards).to.have.length(2);
	});
	it("should decode and encode properly", () => {
		const result = decode(deckstring);
		const encoded = encode(result);
		expect(encoded).to.equal(deckstring);
		const result2 = decode(encoded);
		expect(result2).to.not.be.null;
		expect(result2.sideboards).to.have.length(2);
	});
});
