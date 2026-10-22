import { Link } from 'react-router';
import { CONTACT } from '@/features/portal/portal.content';
import { PATHS } from '@/router/paths';
import { LegalLayout } from './LegalLayout';

const LAST_UPDATE = '2026-10-19';

export function TermsPage() {
  return (
    <LegalLayout
      title="Conditions générales d’utilisation"
      updatedAt={LAST_UPDATE}
      description="Conditions d’utilisation du site BTS Logistique : simulateur de prix, suivi de colis et espace de gestion."
    >
      <section>
        <h2>Objet</h2>
        <p>
          Les présentes conditions encadrent l’utilisation du site de BTS Logistique : présentation
          des services, simulateur de prix et suivi de colis en ligne. Utiliser le site vaut
          acceptation de ces conditions.
        </p>
      </section>

      <section>
        <h2>Éditeur</h2>
        <p>
          BTS Logistique, {CONTACT.address}. Téléphone : {CONTACT.phoneDisplay}. E-mail :{' '}
          <a className="text-bts-blue underline" href={`mailto:${CONTACT.email}`}>
            {CONTACT.email}
          </a>
          .
        </p>
      </section>

      <section>
        <h2>Simulateur de prix</h2>
        <p>
          Le prix affiché par le simulateur est une estimation indicative calculée à partir des
          dimensions saisies. Le prix définitif est établi après mesure du colis en entrepôt et
          confirmé au client avant l’expédition.
        </p>
      </section>

      <section>
        <h2>Suivi de colis</h2>
        <p>
          Le suivi en ligne affiche les étapes enregistrées par les équipes de BTS Logistique. Les
          dates indiquées peuvent évoluer selon les contraintes des transporteurs et des services
          douaniers. Toute personne disposant du numéro de suivi peut consulter les informations du
          colis : ne communiquez ce numéro qu’aux personnes concernées.
        </p>
      </section>

      <section>
        <h2>Espace de gestion</h2>
        <p>
          L’espace de gestion est réservé au personnel et aux collecteurs de BTS Logistique. Chaque
          utilisateur est responsable de la confidentialité de ses identifiants.
        </p>
      </section>

      <section>
        <h2>Propriété intellectuelle</h2>
        <p>
          Le nom, le logo et les contenus de BTS Logistique ne peuvent pas être reproduits sans
          autorisation écrite.
        </p>
      </section>

      <section>
        <h2>Données personnelles</h2>
        <p>
          Le traitement des données personnelles est décrit dans la{' '}
          <Link className="text-bts-blue underline" to={PATHS.privacy}>
            politique de confidentialité
          </Link>
          .
        </p>
      </section>
    </LegalLayout>
  );
}
