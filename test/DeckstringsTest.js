/*#if _PLATFORM === "browser"
import { decode, encode, FormatType } from "../dist/browser.mjs";
//#else */
const {
	decode,
	decodeMercs,
	encode,
	encodeMercs,
	FormatType,
	DeckDefinition,
} = require("../dist/index");
const { expect } = require("chai");
//#endif

const CANONICAL_DECKSTRING =
	"AAECAR8GxwPJBLsFmQfZB/gIDI0B2AGoArUDhwSSBe0G6wfbCe0JgQr+DAAA";

const NONCANONICAL_DECKSTRING =
	"AAECAR8GxwPJBLsFmQfZB/gIDJIF2AGoArUDhwSNAe0G6wfbCe0JgQr+DAAA";

const CANONICAL_DEFINITION = {
	cards: [
		[141, 2], // Hunter's Mark
		[216, 2], // Bloodfen Raptor
		[296, 2], // Kill Command
		[437, 2], // Animal Companion
		[455, 1], // Snake Trap
		[519, 2], // Freezing Trap
		[585, 1], // Explosive Trap
		[658, 2], // Leper Gnome
		[699, 1], // Tundra Rhino
		[877, 2], // Arcane Shot
		[921, 1], // Jungle Panther
		[985, 1], // Dire Wolf Alpha
		[1003, 2], // Houndmaster
		[1144, 1], // King Crush
		[1243, 2], // Unleash the Hounds
		[1261, 2], // Savannah Highmane
		[1281, 2], // Scavenging Hyena
		[1662, 2], // Eaglehorn Bow
	], // pairs of [dbfid, count], by ascending dbfId
	heroes: [31], // Rexxar
	format: FormatType.FT_STANDARD, // 1 for Wild, 2 for Standard
};

const NONCANONICAL_DEFINITION = Object.assign({}, CANONICAL_DEFINITION, {
	cards: CANONICAL_DEFINITION.cards.slice(),
	heros: CANONICAL_DEFINITION.heroes.slice(),
});

[
	NONCANONICAL_DEFINITION.cards[0],
	NONCANONICAL_DEFINITION.cards[7],
	NONCANONICAL_DEFINITION.cards[9],
] = [
	NONCANONICAL_DEFINITION.cards[7],
	NONCANONICAL_DEFINITION.cards[0],
	NONCANONICAL_DEFINITION.cards[9],
];

const CLASSIC_DECKSTRING =
	"AAEDAaa4AwTTlQSvlgT6oASPowQN25UE3JUEppYEsJYEtpYEvZYE1JYE3ZYE6aEE8KEE8aEE86EE1KIEAAA=";

const CLASSIC_DEFINITION = {
	cards: [
		[68307, 1],
		[68315, 2],
		[68316, 2],
		[68390, 2],
		[68399, 1],
		[68400, 2],
		[68406, 2],
		[68413, 2],
		[68436, 2],
		[68445, 2],
		[69754, 1],
		[69865, 2],
		[69872, 2],
		[69873, 2],
		[69875, 2],
		[69972, 2],
		[70031, 1],
	], // pairs of [dbfid, count], by ascending dbfId
	heroes: [56358], // Elise Starseeker
	format: FormatType.FT_CLASSIC, // 1 for Wild, 2 for Standard
};

const DECKSTRING_SIDEBOARD =
	"AAECAZyrBBCU6APd7AOo7gOG+gPTgATDkQTckgTblATboATL4gSFkgX0oAWDoQXmowWVqgX9xAUHlZIE1bIE4LUElrcEssEExc4EhaoFAAEDsIoE/cQFv84E/cQF4qQF/cQFAAA=";

const SIDEBOARD_DEFINITION = {
	cards: [
		[62484, 1],
		[63069, 1],
		[63272, 1],
		[64774, 1],
		[65619, 1],
		[67779, 1],
		[67861, 2],
		[67932, 1],
		[68187, 1],
		[69723, 1],
		[72021, 2],
		[72416, 2],
		[72598, 2],
		[73906, 2],
		[75589, 2],
		[78155, 1],
		[84229, 1],
		[86132, 1],
		[86147, 1],
		[86502, 1],
		[87301, 2],
		[87317, 1],
		[90749, 1],
	], // pairs of [dbfid, count], by ascending dbfId
	heroes: [71068],
	format: FormatType.FT_STANDARD, // 1 for Wild, 2 for Standard
	sideboards: [
		{
			cards: [
				[66864, 1],
				[75583, 1],
				[86626, 1],
			],
			keyCardDbfId: 90749,
		},
	],
};

const MERCS_DECKSTRING =
	"CKfwkRQSCk5hdHVyZWxpc2gYASJFCgoIQBC9ARiYASAACgkIFRC6ARgpIAAKCQg/EGAYlQEgAAoLCJ0BEKwBGO4BIAAKCQgWEK0BGCwgAAoJCGYQ0wEYByACKAo=";

const MERCS_DEFINITION = {
	teamId: 42235943,
	name: "Naturelish",
	type: 1,
	mercenaries: [
		{
			mercenaryId: 64,
			selectedEquipmentId: 189,
			selectedArtVariationId: 152,
			selectedArtVariationPremium: 0,
		},
		{
			mercenaryId: 21,
			selectedEquipmentId: 186,
			selectedArtVariationId: 41,
			selectedArtVariationPremium: 0,
		},
		{
			mercenaryId: 63,
			selectedEquipmentId: 96,
			selectedArtVariationId: 149,
			selectedArtVariationPremium: 0,
		},
		{
			mercenaryId: 157,
			selectedEquipmentId: 172,
			selectedArtVariationId: 238,
			selectedArtVariationPremium: 0,
		},
		{
			mercenaryId: 22,
			selectedEquipmentId: 173,
			selectedArtVariationId: 44,
			selectedArtVariationPremium: 0,
		},
		{
			mercenaryId: 102,
			selectedEquipmentId: 211,
			selectedArtVariationId: 7,
			selectedArtVariationPremium: 2,
		},
	],
};

describe("#encode", () => {
	describe("with a canonical deck definition", () => {
		let result;

		before("should encode without an error", () => {
			result = encode(CANONICAL_DEFINITION);
		});

		it("should return a string", () => {
			expect(result).to.be.a("string");
		});

		it("should return the expected deckstring", () => {
			expect(result).to.equal(CANONICAL_DECKSTRING);
		});
	});

	describe("with a non-canonical deck definition", () => {
		let result;

		before("should encode without an error", () => {
			result = encode(NONCANONICAL_DEFINITION);
		});

		it("should return a string", () => {
			expect(result).to.be.a("string");
		});

		it("should return the expected deckstring", () => {
			expect(result).to.equal(CANONICAL_DECKSTRING);
		});
	});

	describe("with a deck definition that has a sideboard", () => {
		let result;

		before("should encode without an error", () => {
			result = encode(SIDEBOARD_DEFINITION);
		});

		it("should return a string", () => {
			expect(result).to.be.a("string");
		});

		it("should return the expected deckstring", () => {
			expect(result).to.equal(DECKSTRING_SIDEBOARD);
		});
	});

	describe("with a classic deck definition", () => {
		let result;

		before("should encode without an error", () => {
			result = encode(CLASSIC_DEFINITION);
		});

		it("should return a string", () => {
			expect(result).to.be.a("string");
		});

		it("should return the expected deckstring", () => {
			expect(result).to.equal(CLASSIC_DECKSTRING);
		});
	});

	describe("with a mercs deck definition", () => {
		let result;

		before("should encode without an error", () => {
			result = encodeMercs(MERCS_DEFINITION);
		});

		it("should return a string", () => {
			expect(result).to.be.a("string");
		});

		it("should return the expected deckstring", () => {
			expect(result).to.equal(MERCS_DECKSTRING);
		});
	});

	it("should throw an error with an invalid deck definition", () => {
		expect(() => encode(477)).to.throw();
		expect(() => encode("somestring")).to.throw();
		expect(() => encode([1, 2, 3])).to.throw();
		expect(() =>
			encode(Object.assign({}, CANONICAL_DEFINITION, { heroes: null }))
		).to.throw();
	});

	it("should throw an error when format is not 1, 2 or 3", () => {
		expect(() =>
			encode(Object.assign({}, CANONICAL_DEFINITION, { format: "1" }))
		).to.throw();
		expect(() =>
			encode(Object.assign({}, CANONICAL_DEFINITION, { format: 8 }))
		).to.throw();
		expect(() =>
			encode(Object.assign({}, CANONICAL_DEFINITION, { format: [1] }))
		).to.throw();
	});

	it("should throw an error when heroes is not an array", () => {
		expect(() =>
			encode(Object.assign({}, CANONICAL_DEFINITION, { heroes: 42 }))
		).to.throw();
		expect(() =>
			encode(Object.assign({}, CANONICAL_DEFINITION, { heroes: "[]" }))
		).to.throw();
	});

	it("should throw an error when heroes contains an invalid dbf id", () => {
		expect(() =>
			encode(Object.assign({}, CANONICAL_DEFINITION, { heroes: ["a"] }))
		).to.throw();
		expect(() =>
			encode(
				Object.assign({}, CANONICAL_DEFINITION, { heroes: [42, "a"] })
			)
		).to.throw();
		expect(() =>
			encode(
				Object.assign({}, CANONICAL_DEFINITION, { heroes: [42, "1"] })
			)
		).to.throw();
		expect(() =>
			encode(Object.assign({}, CANONICAL_DEFINITION, { heroes: [-42] }))
		).to.throw();
	});

	it("should throw an error when cards is not an array", () => {
		expect(() =>
			encode(Object.assign({}, CANONICAL_DEFINITION, { cards: 2 }))
		).to.throw();
		expect(() =>
			encode(Object.assign({}, CANONICAL_DEFINITION, { cards: "[]" }))
		).to.throw();
	});

	it("should throw an error when cards contains a non-tuples", () => {
		expect(() =>
			encode(Object.assign({}, CANONICAL_DEFINITION, { cards: [3] }))
		).to.throw();
		expect(() =>
			encode(
				Object.assign({}, CANONICAL_DEFINITION, { cards: [[1, 2], 3] })
			)
		).to.throw();
		expect(() =>
			encode(Object.assign({}, CANONICAL_DEFINITION, { cards: ["a"] }))
		).to.throw();
		expect(() =>
			encode(
				Object.assign({}, CANONICAL_DEFINITION, { cards: [[1, "a"]] })
			)
		).to.throw();
		expect(() =>
			encode(
				Object.assign({}, CANONICAL_DEFINITION, { cards: [["a", 1]] })
			)
		).to.throw();
	});

	it("should throw an error when cards contains an invalid dbf id", () => {
		expect(() =>
			encode(
				Object.assign({}, CANONICAL_DEFINITION, { cards: [[-4, 1]] })
			)
		).to.throw();
		expect(() =>
			encode(
				Object.assign({}, CANONICAL_DEFINITION, { cards: [[NaN, 1]] })
			)
		).to.throw();
		expect(() =>
			encode(
				Object.assign({}, CANONICAL_DEFINITION, {
					cards: [[Infinity, 1]],
				})
			)
		).to.throw();
	});

	it("should throw an error when cards contains an invalid count", () => {
		expect(() =>
			encode(
				Object.assign({}, CANONICAL_DEFINITION, { cards: [[1, -5]] })
			)
		).to.throw();
		expect(() =>
			encode(
				Object.assign({}, CANONICAL_DEFINITION, { cards: [[1, NaN]] })
			)
		).to.throw();
		expect(() =>
			encode(
				Object.assign({}, CANONICAL_DEFINITION, {
					cards: [[1, Infinity]],
				})
			)
		).to.throw();
	});
});

describe("#decode", () => {
	it("should throw an error when the parameter is an empty string", () => {
		expect(() => decode("")).to.throw();
	});

	it("should throw an error when the parameter is an invalid deckstring", () => {
		expect(() => decode("123abc")).to.throw();
	});

	describe("with a canonical deckstring", () => {
		let result;

		before("should decode without an error", () => {
			result = decode(CANONICAL_DECKSTRING);
		});

		it("should return an object", () => {
			expect(result).to.be.a("object");
		});

		it("should return the expected deck definition", () => {
			expect(JSON.stringify(result)).to.equal(
				JSON.stringify(CANONICAL_DEFINITION)
			);
		});

		it("should return a numeric format", () => {
			expect(result.format).to.be.a("number");
		});

		it("should return a list of cards", () => {
			expect(result.cards).to.be.a("array");
		});

		it("should return a list of heroes", () => {
			expect(result.heroes).to.be.a("array");
		});

		it("should return the encoded format", () => {
			expect(result.format).to.equal(CANONICAL_DEFINITION.format);
		});

		it("should contain the encoded hero", () => {
			expect(result.cards).to.have.deep.members(
				CANONICAL_DEFINITION.cards
			);
		});

		it("should contain the encoded cards", () => {
			expect(result.cards).to.have.deep.members(
				CANONICAL_DEFINITION.cards
			);
		});
	});

	describe("with a non-canonical deckstring", () => {
		let result;

		before("should decode without an error", () => {
			result = decode(NONCANONICAL_DECKSTRING);
		});

		it("should return an object", () => {
			expect(result).to.be.a("object");
		});

		it("should return the expected deck definition", () => {
			expect(JSON.stringify(result)).to.equal(
				JSON.stringify(CANONICAL_DEFINITION)
			);
		});
	});

	describe("with a classic deckstring", () => {
		let result;

		before("should decode without an error", () => {
			result = decode(CLASSIC_DECKSTRING);
		});

		it("should return an object", () => {
			expect(result).to.be.a("object");
		});

		it("should return the expected deck definition", () => {
			expect(JSON.stringify(result)).to.equal(
				JSON.stringify(CLASSIC_DEFINITION)
			);
		});
	});

	describe("with a deckstring that has a sideboard", () => {
		let result;

		before("should decode without an error", () => {
			result = decode(DECKSTRING_SIDEBOARD);
		});

		it("should return an object", () => {
			expect(result).to.be.a("object");
		});

		it("should return the expected deck definition", () => {
			expect(JSON.stringify(result)).to.equal(
				JSON.stringify(SIDEBOARD_DEFINITION)
			);
		});
	});

	describe("with a mercs deckstring", () => {
		let result;

		before("should decode without an error", () => {
			result = decodeMercs(MERCS_DECKSTRING);
		});

		it("should return an object", () => {
			expect(result).to.be.a("object");
		});

		it("should return the expected deck definition", () => {
			expect(JSON.stringify(result)).to.equal(
				JSON.stringify(MERCS_DEFINITION)
			);
		});
	});
});
