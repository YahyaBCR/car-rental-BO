/**
 * About Page - FlitCar
 * À propos de FLIT
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FlitCarColors } from '../constants/colors';
import { FaCircleCheck, FaShield, FaRocket, FaPhone } from 'react-icons/fa6';

const About: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 text-center">
          <h1 className="text-4xl font-black text-gray-900 mb-4">
            {t('about.title')}
          </h1>
          <p className="text-2xl font-bold" style={{ color: FlitCarColors.primary }}>
            {t('about.subtitle')}
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <p className="text-lg text-gray-700 leading-relaxed">
            FLIT est né d'un constat simple et frustrant : le marché de la location de voitures au Maroc, particulièrement
            pour les arrivées en aéroport, manquait cruellement de <strong>{t('about.intro.transparency')}</strong>, de <strong>{t('about.intro.reliability')}</strong> et
            de <strong>{t('about.intro.digitalization')}</strong>. Nous avons résolu ce problème.
          </p>
        </div>

        {/* Section 1 - Identité */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <FaCircleCheck className="mr-3" style={{ color: FlitCarColors.primary }} />
            {t('about.identity.title')}
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t('about.identity.trustedIntermediary')}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                FLIT est une plateforme technologique détenue et opérée par la société <strong>[Nom Légal de la Société S.A.R.L.]</strong>,
                enregistrée au Registre du Commerce de [Ville] sous le numéro [RC/ICE].
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                Notre mission est claire : devenir le point d'entrée numérique unique et le plus fiable pour la location de
                véhicules au Maroc, en garantissant une transaction sécurisée pour l'utilisateur.
              </p>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('about.identity.whatWeAreNot')}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Nous ne sommes pas une agence de location. Nous ne possédons pas la flotte. FLIT est l'outil numérique qui vous
                connecte exclusivement aux agences de location marocaines professionnelles et auditées. Nous gérons la transaction
                en ligne ; l'agence partenaire gère le véhicule sur place.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2 - Garantie */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <FaShield className="mr-3" style={{ color: FlitCarColors.primary }} />
            {t('about.guarantee.title')}
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t('about.guarantee.verifiedNetwork')}
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Contrairement aux plateformes généralistes, notre réseau de loueurs est soumis à un <strong>{t('about.guarantee.partnershipAgreement')}</strong>. Chaque loueur listé sur FLIT doit impérativement :
              </p>
              <ul className="space-y-3">
                {[
                  t('about.guarantee.requirements.license'),
                  t('about.guarantee.requirements.fleet'),
                  t('about.guarantee.requirements.pricing')
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <FaCircleCheck className="mr-3 mt-1 flex-shrink-0" style={{ color: FlitCarColors.success }} />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t('about.guarantee.priceTransparency')}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Le prix affiché sur FLIT est le <strong>{t('about.guarantee.finalPrice')}</strong> (hors caution et options additionnelles
                demandées par le client sur place). Nous éliminons la surprise du prix au comptoir.
              </p>
            </div>

            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('about.guarantee.disputeResolution.title')}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                En cas de litige avéré concernant la qualité du service ou le non-respect du tarif par le Loueur, FLIT agit en
                tant que <strong>{t('about.guarantee.disputeResolution.mediator')}</strong> et se réserve le droit d'intervenir financièrement (remboursement
                et déduction) pour protéger le client, conformément à nos Conditions Générales d'Utilisation.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3 - Technologie */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <FaRocket className="mr-3" style={{ color: FlitCarColors.primary }} />
            {t('about.technology.title')}
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t('about.technology.simplicity')}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Nous avons conçu le processus de réservation pour être terminé en <strong>{t('about.technology.bookingTime')}</strong>, depuis
                la sélection jusqu'au paiement de l'acompte. Votre temps est précieux, surtout après un vol.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t('about.technology.bankingSecurity')}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Toutes les transactions sont traitées via des solutions de paiement marocaines et internationales certifiées (ex : CMI).
                Vos informations bancaires ne sont <strong>jamais stockées</strong> sur nos serveurs.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4 - Contact */}
        <div className="bg-gradient-to-r from-primary to-primaryDark rounded-2xl shadow-sm p-8 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <FaPhone className="mr-3" />
            {t('about.contact.title')}
          </h2>

          <div className="space-y-4">
            <p className="leading-relaxed">
              Pour toute question ou demande d'information complémentaire, vous pouvez contacter notre service client au
              <strong> [Numéro de Téléphone]</strong> ou par e-mail à <strong>[Email de Contact]</strong>.
            </p>

            <div className="bg-white/10 backdrop-blur rounded-lg p-4 mt-6">
              <h3 className="text-lg font-semibold mb-3">{t('about.contact.legalInfo')}</h3>
              <ul className="space-y-2 text-sm">
                <li><strong>Dénomination :</strong> [Nom Légal de la Société]</li>
                <li><strong>Forme juridique :</strong> S.A.R.L.</li>
                <li><strong>Siège Social :</strong> [Adresse complète du siège]</li>
                <li><strong>R.C. / I.C.E. :</strong> [Numéro]</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105"
            style={{ backgroundColor: FlitCarColors.primary }}
          >
            {t('common.back')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default About;
