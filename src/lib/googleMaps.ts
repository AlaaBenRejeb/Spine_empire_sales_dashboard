type GoogleMapsParts = {
  existingUrl?: string | null;
  practiceName?: string | null;
  city?: string | null;
  state?: string | null;
};

const GOOGLE_MAPS_SEARCH_BASE = "https://www.google.com/maps/search/?api=1&query=";

const normalizePart = (value?: string | null) => value?.trim() || "";

export function buildGoogleMapsUrl({
  practiceName,
  city,
  state,
}: Omit<GoogleMapsParts, "existingUrl">): string | null {
  const query = [normalizePart(practiceName), normalizePart(city), normalizePart(state)]
    .filter(Boolean)
    .join(" ");

  return query ? `${GOOGLE_MAPS_SEARCH_BASE}${encodeURIComponent(query)}` : null;
}

export function resolveGoogleMapsUrl({
  existingUrl,
  practiceName,
  city,
  state,
}: GoogleMapsParts): string | null {
  const trimmedExistingUrl = normalizePart(existingUrl);
  if (trimmedExistingUrl) {
    return trimmedExistingUrl;
  }

  return buildGoogleMapsUrl({ practiceName, city, state });
}
