import type { Client, NewNotification, Package } from '@/types';
import { PACKAGE_STATUS_LABELS } from '@/types';
import { formatPrice } from '@/utils/formatters';

// Un seul endroit décrit le texte de chaque événement : la cloche et la page l'affichent tel quel.

function packageReference(pkg: Package) {
  return { package_id: pkg.id, tracking_number: pkg.tracking_number };
}

export function packageCreatedNotification(pkg: Package): NewNotification {
  return {
    category: 'package',
    title: 'Nouveau colis enregistré',
    message: `${pkg.client_name ?? 'Client'}, ${pkg.origin} vers ${pkg.destination}.`,
    ...packageReference(pkg),
  };
}

export function statusChangedNotification(pkg: Package): NewNotification {
  return {
    category: 'package',
    title: `Statut : ${PACKAGE_STATUS_LABELS[pkg.status]}`,
    message: `${pkg.client_name ?? 'Client'}, destination ${pkg.destination}.`,
    ...packageReference(pkg),
  };
}

export function paymentReceivedNotification(pkg: Package, amount: number): NewNotification {
  return {
    category: 'payment',
    title: 'Paiement reçu',
    message: `${pkg.client_name ?? 'Client'} a réglé ${formatPrice(amount)}.`,
    ...packageReference(pkg),
  };
}

/** E-mail de suivi au client : mis en file s'il a une adresse, signalé sinon. */
export function clientEmailNotification(pkg: Package, client: Client | undefined): NewNotification {
  const email = client?.email?.trim();
  if (!email) {
    return {
      category: 'email',
      title: 'Client non notifié',
      message: `Aucune adresse e-mail sur la fiche de ${pkg.client_name ?? 'ce client'}. Transmettez le lien de suivi autrement.`,
      delivery: 'skipped',
      ...packageReference(pkg),
    };
  }
  return {
    category: 'email',
    title: 'E-mail de suivi en attente d’envoi',
    message: `Destinataire : ${email}.`,
    delivery: 'queued',
    ...packageReference(pkg),
  };
}
