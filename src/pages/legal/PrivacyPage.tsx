import { CONTACT } from '@/features/portal/portal.content';
import { LegalLayout } from './LegalLayout';

const LAST_UPDATE = '2026-10-19';

export function PrivacyPage() {
  return (
    <LegalLayout
      title="Politique de confidentialité"
      updatedAt={LAST_UPDATE}
      description="Données personnelles traitées par BTS Logistique, finalités, durée de conservation et droits des clients."
    >
      <section>
        <h2>Responsable du traitement</h2>
        <p>
          Les données personnelles collectées sur ce site sont traitées par BTS Logistique,{' '}
          {CONTACT.address}. Pour toute question :{' '}
          <a className="text-bts-blue underline" href={`mailto:${CONTACT.email}`}>
            {CONTACT.email}
          </a>{' '}
          ou {CONTACT.phoneDisplay}.
        </p>
      </section>

      <section>
        <h2>Données collectées</h2>
        <ul>
          <li>
            Identité et coordonnées des clients : nom, téléphone, adresse e-mail, adresse postale.
          </li>
          <li>
            Informations sur les colis : description, dimensions, poids, origine, destination,
            statut.
          </li>
          <li>
            Informations de paiement : montants réglés, mode de règlement et référence. Aucune
            donnée de carte bancaire n’est conservée.
          </li>
          <li>
            Comptes du personnel et des collecteurs : nom, adresse e-mail, rôle, historique des
            actions.
          </li>
        </ul>
        <p>
          La recherche d’un numéro de suivi sur le site ne demande aucune donnée personnelle au
          visiteur.
        </p>
      </section>

      <section>
        <h2>Finalités</h2>
        <ul>
          <li>Enregistrer, transporter et remettre les colis.</li>
          <li>Informer le client de l’avancement de son colis, notamment par e-mail.</li>
          <li>Établir les factures et suivre les paiements.</li>
          <li>Permettre au client de consulter le suivi de son colis en ligne.</li>
        </ul>
      </section>

      <section>
        <h2>Destinataires</h2>
        <p>
          Les données sont accessibles au personnel habilité de BTS Logistique et, pour les seules
          informations nécessaires, aux partenaires qui participent au transport et au dédouanement.
          Elles ne sont ni vendues ni louées.
        </p>
      </section>

      <section>
        <h2>Durée de conservation</h2>
        <p>
          Les données sont conservées pendant la durée nécessaire à l’exécution du transport, puis
          pendant les durées imposées par les obligations comptables et fiscales.
        </p>
      </section>

      <section>
        <h2>Vos droits</h2>
        <p>
          Vous pouvez demander l’accès, la rectification ou la suppression de vos données, ainsi que
          vous opposer à leur traitement, en écrivant à{' '}
          <a className="text-bts-blue underline" href={`mailto:${CONTACT.email}`}>
            {CONTACT.email}
          </a>
          .
        </p>
      </section>

      <section>
        <h2>Cookies</h2>
        <p>
          Le site public n’utilise pas de cookie publicitaire ni de mesure d’audience. L’espace de
          gestion utilise uniquement les éléments techniques nécessaires à la connexion du
          personnel.
        </p>
      </section>
    </LegalLayout>
  );
}
