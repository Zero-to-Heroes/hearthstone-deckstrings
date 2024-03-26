import { DeckList } from "../types";

export function sorted_cards(cards: DeckList) {
	return cards.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
}

export function trisort_cards(cards: DeckList): any {
	const single: DeckList = [],
		double: DeckList = [],
		n: DeckList = [];
	for (const tuple of cards) {
		let list;
		const [card, count] = tuple;
		verifyDbfId(card, "card");
		if (count === 0) {
			continue;
		}
		if (count === 1) {
			list = single;
		} else if (count === 2) {
			list = double;
		} else if (isPositiveNaturalNumber(count)) {
			list = n;
		} else {
			throw new Error(
				`Invalid count ${count} (expected positive natural number)`
			);
		}
		list.push(tuple);
	}
	return [single, double, n];
}

export function verifyDbfId(id: any, name?: string): void {
	name = name ? name : "dbf id";
	if (!isPositiveNaturalNumber(id)) {
		throw new Error(`Invalid ${name} ${id} (expected valid dbf id)`);
	}
}

function isPositiveNaturalNumber(n: any): boolean {
	if (typeof n !== "number" || !isFinite(n)) {
		return false;
	}
	if (Math.floor(n) !== n) {
		return false;
	}
	return n > 0;
}
