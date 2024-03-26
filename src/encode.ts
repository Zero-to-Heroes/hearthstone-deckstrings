import { DeckDefinition, Sideboard } from "../types";
import { BufferWriter } from "./buffer";
import { DECKSTRING_VERSION, FormatType } from "./constants";
import { sorted_cards, trisort_cards, verifyDbfId } from "./utils";

// See ShareableDeck#SerializeToVersion_1
export const encode = (deck: DeckDefinition): string => {
	if (
		typeof deck !== "object" ||
		(deck.format !== FormatType.FT_WILD &&
			deck.format !== FormatType.FT_STANDARD &&
			deck.format !== FormatType.FT_TWIST &&
			deck.format !== FormatType.FT_CLASSIC) ||
		!Array.isArray(deck.heroes) ||
		!Array.isArray(deck.cards)
	) {
		throw new Error("Invalid deck definition");
	}

	const writer = new BufferWriter();

	const format = deck.format;
	const heroes = deck.heroes.slice().sort();
	const cards = sorted_cards(deck.cards.slice());

	writer.null();
	writer.varint(DECKSTRING_VERSION);
	writer.varint(format);
	writer.varint(heroes.length);
	for (let hero of heroes) {
		verifyDbfId(hero, "hero");
		writer.varint(hero);
	}

	for (let list of trisort_cards(cards)) {
		writer.varint(list.length);
		for (let tuple of list) {
			const [card, count] = tuple;
			writer.varint(card);
			if (count !== 1 && count !== 2) {
				writer.varint(count);
			}
		}
	}

	const hasSideboard =
		!!deck.sideboards && deck.sideboards.length > 0 ? 1 : 0;
	writer.byte(hasSideboard);

	if (hasSideboard && deck.sideboards != undefined) {
		serialize_WriteSideBoardCards(writer, deck);
	}

	return writer.toString();
};

// ShareableDeck#Serialize_WriteSideBoardCards()
const serialize_WriteSideBoardCards = (
	writer: BufferWriter,
	deck: DeckDefinition
) => {
	// For now, a single sideboard is supported
	// TODO: Support multiple sideboards
	// const sideboard = deck.sideboards[i];
	const sideboardCards = deck
		.sideboards!.flatMap(s => buildSideBoardCardData(s))
		.sort((a, b) => (a.dbfId < b.dbfId ? -1 : a.dbfId > b.dbfId ? 1 : 0));
	const cards = sideboardCards.filter(c => c.quantity === 1);
	const cards2 = sideboardCards.filter(c => c.quantity === 2);
	const array = sideboardCards.filter(c => c.quantity > 2);
	serialize_WriteArrayOfSideBoardCards(writer, cards);
	serialize_WriteArrayOfSideBoardCards(writer, cards2);
	writer.varint(array.length);
	for (const card of array) {
		writer.varint(card.quantity);
		writer.varint(card.dbfId);
		writer.varint(card.linkedCardDbfId);
	}
};

const serialize_WriteArrayOfSideBoardCards = (
	writer: BufferWriter,
	cards: SideBoardCardData[]
) => {
	writer.varint(cards.length);
	for (const card of cards) {
		writer.varint(card.dbfId);
		writer.varint(card.linkedCardDbfId);
	}
};

const buildSideBoardCardData = (sideboard: Sideboard): SideBoardCardData[] => {
	return sideboard.cards.map(c => {
		return {
			quantity: c[1],
			dbfId: c[0],
			linkedCardDbfId: sideboard.keyCardDbfId,
		};
	});
};

interface SideBoardCardData {
	quantity: number;
	dbfId: number;
	linkedCardDbfId: number;
}
