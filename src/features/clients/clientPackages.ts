import type { Client, Package } from '@/types';

/** Un colis appartient au client par son identifiant, ou par son nom pour les colis anciens. */
export function isClientPackage(pkg: Package, client: Client): boolean {
  return pkg.client_id === client.id || Boolean(pkg.client_name?.includes(client.name));
}

export interface ClientWithBalance extends Client {
  balance: number;
}

/**
 * Calcule le reste à payer de chaque client à partir de ses colis. Sans colis chargé, les
 * totaux enregistrés sur la fiche client sont utilisés.
 */
export function withBalances(clients: Client[], packages: Package[]): ClientWithBalance[] {
  return clients.map((client) => {
    const clientPkgs = packages.filter((pkg) => isClientPackage(pkg, client));
    const totalBilled =
      clientPkgs.reduce((acc, pkg) => acc + pkg.final_price, 0) || client.total_billed;
    const amountPaid =
      clientPkgs.reduce((acc, pkg) => acc + (pkg.amount_paid || 0), 0) || client.amount_paid;
    return { ...client, balance: Math.max(0, totalBilled - amountPaid) };
  });
}
