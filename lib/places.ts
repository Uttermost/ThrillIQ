import { Adventure, Category } from './types';

// "Places" aren't a real Firestore collection — there's no place/location
// entity in the data model, no curated list of Nairobi-area spots, and no
// coordinates I could responsibly assert are accurate. This derives places
// entirely from the location string organizers already type into real
// adventures, same "real data or nothing" rule as the rest of the public
// site. Two adventures with slightly different location text (e.g. "Ngong
// Hills, Nairobi" vs "Ngong Hills, Kajiado") are treated as different real
// places rather than silently merged — that would require geocoding this
// app doesn't have.
export function slugifyPlace(location: string): string {
  return location
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '');
}

export interface Place {
  location: string;
  slug: string;
  adventures: Adventure[];
  dominantCategory: Category;
}

export function derivePlaces(adventures: Adventure[]): Place[] {
  const byLocation = new Map<string, Adventure[]>();
  adventures.forEach((a) => {
    const loc = a.location.trim();
    if (!loc) return;
    const list = byLocation.get(loc);
    if (list) list.push(a);
    else byLocation.set(loc, [a]);
  });

  return Array.from(byLocation.entries())
    .map(([location, list]) => ({
      location,
      slug: slugifyPlace(location),
      adventures: list,
      dominantCategory: dominantCategoryOf(list),
    }))
    .sort((a, b) => b.adventures.length - a.adventures.length);
}

export function findPlace(adventures: Adventure[], slug: string): Place | undefined {
  return derivePlaces(adventures).find((p) => p.slug === slug);
}

function dominantCategoryOf(list: Adventure[]): Category {
  const counts = new Map<Category, number>();
  list.forEach((a) => counts.set(a.category, (counts.get(a.category) ?? 0) + 1));
  let best: Category = list[0]?.category ?? 'Other';
  let bestCount = 0;
  counts.forEach((count, category) => {
    if (count > bestCount) {
      best = category;
      bestCount = count;
    }
  });
  return best;
}
