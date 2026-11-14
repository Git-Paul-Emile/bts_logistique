import { useQuery } from '@tanstack/react-query';
import { locationsApi } from '@/api/endpoints/locations.api';
import { queryKeys } from '@/api/queryKeys';
import type { SelectOption } from '@/components/ui/SearchableSelect';
import { countryName } from '@/utils/countryOptions';
import type { NetworkLocation } from '@/types';

/** Le réseau change rarement : la liste est gardée cinq minutes, comme côté serveur. */
const LOCATIONS_STALE_TIME_MS = 5 * 60_000;

export interface Agency {
  code: string;
  name: string;
}

/** Pays du réseau, leurs rôles (départ, arrivée) et leur agence. */
export function useLocations() {
  const query = useQuery({
    queryKey: queryKeys.locations,
    queryFn: locationsApi.list,
    staleTime: LOCATIONS_STALE_TIME_MS,
  });
  const locations = query.data ?? [];
  return {
    ...query,
    locations,
    origins: locations.filter((location) => location.is_origin),
    destinations: locations.filter((location) => location.is_destination),
    agencies: agenciesOf(locations),
  };
}

/** Agences du réseau, sans doublon, dans l'ordre des pays. */
export function agenciesOf(locations: readonly NetworkLocation[]): Agency[] {
  const byCode = new Map<string, Agency>();
  for (const { agency } of locations) {
    if (agency && !byCode.has(agency.code)) byCode.set(agency.code, agency);
  }
  return [...byCode.values()];
}

/**
 * Options d'une liste de pays : la valeur est le code ISO alpha-2, le libellé est
 * le nom en français résolu via Intl.DisplayNames (country-list fournit la source des codes).
 */
export function locationOptions(locations: readonly NetworkLocation[]): SelectOption<string>[] {
  return locations
    .map((location) => ({
      value: location.code,
      label: countryName(location.code),
    }))
    .sort((a, b) => a.label.localeCompare(b.label, 'fr'));
}

export function agencyOptions(agencies: readonly Agency[]): SelectOption<string>[] {
  return agencies.map((agency) => ({ value: agency.code, label: agency.name }));
}
