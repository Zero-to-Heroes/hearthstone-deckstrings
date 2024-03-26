import {
	DeckDefinition,
	DeckList,
	MercenariesTeamDefinition,
	MercenaryDefinition,
	Sideboard,
} from "../types";
import { BufferReader, BufferWriter } from "./buffer";
import { DECKSTRING_VERSION, FormatType } from "./constants";
import { sorted_cards } from "./utils";

export { encode } from "./encode";

export function decode(deckstring: string): DeckDefinition {
	const reader = new BufferReader(deckstring);

	const nextByte = reader.nextByte();
	if (nextByte !== 0) {
		throw new Error("Invalid deckstring " + nextByte);
	}

	const version = reader.nextVarint();
	if (version !== DECKSTRING_VERSION) {
		throw new Error(`Unsupported deckstring version ${version}`);
	}

	const format = reader.nextVarint();
	if (
		format !== FormatType.FT_WILD &&
		format !== FormatType.FT_STANDARD &&
		format !== FormatType.FT_TWIST &&
		format !== FormatType.FT_CLASSIC
	) {
		throw new Error(`Unsupported format ${format} in deckstring`);
	}

	const heroes = new Array(reader.nextVarint());
	for (let i = 0; i < heroes.length; i++) {
		heroes[i] = reader.nextVarint();
	}
	heroes.sort();

	const cards: DeckList = [];
	for (let i = 1; i <= 3; i++) {
		for (let j = 0, c = reader.nextVarint(); j < c; j++) {
			cards.push([
				reader.nextVarint(),
				i === 1 || i === 2 ? i : reader.nextVarint(),
			]);
		}
	}
	sorted_cards(cards);

	let sideboards: Sideboard[] | undefined = undefined;
	const hasSideboard = reader.nextByte();
	if (hasSideboard === 1) {
		sideboards = [];
		for (let i = 1; i <= 3; i++) {
			// 1 = single cards, 2 = two copies, 3 = more than 2
			const numberOfEntries = reader.nextVarint();
			// The last ID is the sideboard's key card
			for (let j = 0; j < numberOfEntries; j++) {
				const cardId = reader.nextVarint();
				const numberOfCopies =
					i === 1 || i === 2 ? i : reader.nextVarint();
				const keyCardId = reader.nextVarint();
				let sideboard = sideboards.find(
					s => s.keyCardDbfId === keyCardId
				);
				if (!sideboard) {
					sideboard = {
						cards: [],
						keyCardDbfId: keyCardId,
					};
					sideboards.push(sideboard);
				}
				sideboard.cards.push([cardId, numberOfCopies]);
			}
		}
		for (const sideboard of sideboards) {
			sideboard.cards = sorted_cards(sideboard.cards);
		}
	}

	return {
		cards,
		heroes,
		format,
		sideboards,
	};
}

export function encodeMercs(deck: MercenariesTeamDefinition): string {
	const writer = new BufferWriter();
	writer.varint(8);
	writer.varint(deck.teamId);
	writer.varint(18);

	const teamNameArray = new TextEncoder().encode(deck.name);
	const bufferSize = teamNameArray.length;
	// const teamNameWriter = new BufferWriter();
	// for (let i = 0; i < bufferSize; i++) {
	// 	teamNameWriter.byte(teamNameArray[i]);
	// }
	writer.varint(bufferSize);
	for (let i = 0; i < bufferSize; i++) {
		writer.byte(teamNameArray[i]);
	}

	writer.varint(24);
	writer.varint(deck.type != null ? deck.type : 1);

	writer.varint(34);

	const teamWriter = new BufferWriter();
	writeTeamInfo(teamWriter, deck.mercenaries);

	const mercenaryListBlockSize = teamWriter.buffer.length;
	writer.varint(mercenaryListBlockSize);
	writeTeamInfo(writer, deck.mercenaries);

	writer.varint(40);
	writer.varint(10);

	return writer.toString();
}

function writeTeamInfo(
	teamWriter: BufferWriter,
	team: MercenaryDefinition[]
): void {
	for (let i = 0; i < team.length; i++) {
		const merc = team[i];

		const mercWriter = new BufferWriter();
		writeMercInfo(mercWriter, merc);

		const mercenaryFieldSize = mercWriter.buffer.length;
		teamWriter.varint(10);
		teamWriter.varint(mercenaryFieldSize);
		writeMercInfo(teamWriter, merc);
	}
}

function writeMercInfo(
	mercWriter: BufferWriter,
	merc: MercenaryDefinition
): void {
	mercWriter.varint(8);
	mercWriter.varint(merc.mercenaryId);
	mercWriter.varint(16);
	mercWriter.varint(merc.selectedEquipmentId);
	mercWriter.varint(24);
	mercWriter.varint(merc.selectedArtVariationId);
	mercWriter.varint(32);
	mercWriter.varint(merc.selectedArtVariationPremium);
}

export function decodeMercs(deckstring: string): MercenariesTeamDefinition {
	const reader = new BufferReader(deckstring);

	const hasTeamId = reader.nextByte();
	if (hasTeamId !== 8) {
		throw new Error("Invalid deckstring " + hasTeamId);
	}

	const teamId = reader.nextVarint();

	const hasName = reader.nextByte();
	const teamNameSize = reader.nextByte();
	const teamNameArray = [];
	for (let i = 0; i < teamNameSize; i++) {
		teamNameArray.push(reader.nextByte());
	}
	const teamName = new TextDecoder().decode(new Uint8Array(teamNameArray));

	const hasType = reader.nextByte();
	const type = reader.nextByte();

	const hasMercenaryList = reader.nextByte();
	const mercenaryListBlockSize = reader.nextByte();
	const startListPosition = reader.index;
	const endListPosition = startListPosition + mercenaryListBlockSize;

	const team: MercenaryDefinition[] = [];
	// Read all the heroes
	while (true) {
		if (reader.index >= endListPosition) {
			break;
		}
		const mercenary: MercenaryDefinition = {} as MercenaryDefinition;
		team.push(mercenary);
		const encodingType = reader.nextByte();
		if (encodingType !== 10) {
			throw new Error(
				"non-length delimited encoding not supported yet " +
					encodingType
			);
		}
		const fieldsForMerc = reader.nextByte();
		const positionAtStart = reader.index;
		const positionAtEnd = positionAtStart + fieldsForMerc;

		// Read all fields
		while (true) {
			if (reader.index >= positionAtEnd) {
				break;
			}
			const nextInfo = reader.nextByte();
			switch (nextInfo) {
				case 8:
					mercenary.mercenaryId = reader.nextByte();
					continue;
				case 16:
					mercenary.selectedEquipmentId = reader.nextByte();
					continue;
				case 24:
					mercenary.selectedArtVariationId = reader.nextByte();
					continue;
				case 32:
					mercenary.selectedArtVariationPremium = reader.nextByte();
					continue;
				case 40:
					mercenary.sharedTeamMercenaryXp = reader.nextByte();
					continue;
				case 48:
					mercenary.sharedTeamMercenaryIsFullyUpgraded = reader.nextByte();
					continue;
				default:
					// skip, no idea what these are
					continue;
			}
		}
	}

	return {
		teamId: teamId,
		name: teamName,
		type: type,
		mercenaries: team,
	};
}

export { FormatType };
