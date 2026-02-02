/**
 * Privacy Policy Page - FlitCar
 * Politique de Confidentialité
 *
 * This page details how FlitCar collects, uses, and protects user data.
 * Compliant with Moroccan Law 09-08 and CNDP regulations.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FlitCarColors } from '../constants/colors';

const Privacy: React.FC = () => {
  const { t, i18n } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            {t('privacyPage.title')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('privacyPage.subtitle')}
          </p>
          <p className="text-sm text-gray-500 mt-4">
            {t('privacyPage.effectiveDate')} : {new Date().toLocaleDateString(
              i18n.language === 'ar' ? 'ar-MA' : i18n.language === 'fr' ? 'fr-FR' : 'en-US'
            )}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm p-8 prose prose-lg max-w-none">
          {/* Préambule */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ color: FlitCarColors.primary }}>
              {t('privacyPage.preamble.title')}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t('privacyPage.preamble.text')}
            </p>
          </section>

          {/* Section 1 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ color: FlitCarColors.primary }}>
              {t('privacyPage.section1.title')}
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('privacyPage.section1.subsection1.title')}</h3>
                <p className="text-gray-700 leading-relaxed">
                  {t('privacyPage.section1.subsection1.text')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('privacyPage.section1.subsection2.title')}</h3>
                <p className="text-gray-700 leading-relaxed">
                  {t('privacyPage.section1.subsection2.text')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('privacyPage.section1.subsection3.title')}</h3>
                <p className="text-gray-700 leading-relaxed">
                  {t('privacyPage.section1.subsection3.text')}
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ color: FlitCarColors.primary }}>
              {t('privacyPage.section2.title')}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t('privacyPage.section2.intro')}
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>
                <strong>{t('privacyPage.section2.item1Title')}</strong> {t('privacyPage.section2.item1Text')}
              </li>
              <li>
                <strong>{t('privacyPage.section2.item2Title')}</strong> {t('privacyPage.section2.item2Text')}
              </li>
              <li>
                <strong>{t('privacyPage.section2.item3Title')}</strong> {t('privacyPage.section2.item3Text')}
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ color: FlitCarColors.primary }}>
              {t('privacyPage.section3.title')}
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('privacyPage.section3.subsection1.title')}</h3>
                <p className="text-gray-700 leading-relaxed mb-2">{t('privacyPage.section3.subsection1.intro')}</p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>{t('privacyPage.section3.subsection1.item1')}</li>
                  <li>{t('privacyPage.section3.subsection1.item2')}</li>
                  <li>{t('privacyPage.section3.subsection1.item3')}</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('privacyPage.section3.subsection2.title')}</h3>
                <p className="text-gray-700 leading-relaxed mb-2">{t('privacyPage.section3.subsection2.intro')}</p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>{t('privacyPage.section3.subsection2.item1')}</li>
                  <li>{t('privacyPage.section3.subsection2.item2')}</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('privacyPage.section3.subsection3.title')}</h3>
                <p className="text-gray-700 leading-relaxed">
                  {t('privacyPage.section3.subsection3.text')}
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ color: FlitCarColors.primary }}>
              {t('privacyPage.section4.title')}
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('privacyPage.section4.subsection1.title')}</h3>
                <p className="text-gray-700 leading-relaxed mb-2">
                  {t('privacyPage.section4.subsection1.intro')}
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>{t('privacyPage.section4.subsection1.item1')}</li>
                  <li>{t('privacyPage.section4.subsection1.item2')}</li>
                  <li>{t('privacyPage.section4.subsection1.item3')}</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('privacyPage.section4.subsection2.title')}</h3>
                <p className="text-gray-700 leading-relaxed">
                  {t('privacyPage.section4.subsection2.text')} <strong>{t('privacyPage.section4.subsection2.bold')}</strong> {t('privacyPage.section4.subsection2.textEnd')}
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ color: FlitCarColors.primary }}>
              {t('privacyPage.section5.title')}
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('privacyPage.section5.subsection1.title')}</h3>
                <p className="text-gray-700 leading-relaxed">
                  {t('privacyPage.section5.subsection1.text1')}
                  <strong> {t('privacyPage.section5.subsection1.duration')}</strong> {t('privacyPage.section5.subsection1.text2')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('privacyPage.section5.subsection2.title')}</h3>
                <p className="text-gray-700 leading-relaxed">
                  {t('privacyPage.section5.subsection2.text')}
                </p>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ color: FlitCarColors.primary }}>
              {t('privacyPage.section6.title')}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t('privacyPage.section6.paragraph1')}
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t('privacyPage.section6.paragraph2')}
            </p>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-gray-900 font-semibold">
                {t('privacyPage.section6.emailLabel')} <a href="mailto:privacy@flit.ma" className="text-primary hover:underline">privacy@flit.ma</a>
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ color: FlitCarColors.primary }}>
              {t('privacyPage.section7.title')}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t('privacyPage.section7.text')}
            </p>
          </section>

          {/* Contact Section */}
          <section className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{t('privacyPage.contact.title')}</h3>
            <p className="text-gray-700 leading-relaxed">
              {t('privacyPage.contact.text')}
              <a href="/support" className="ml-1 font-semibold" style={{ color: FlitCarColors.primary }}>
                {t('privacyPage.contact.supportLink')}
              </a>.
            </p>
          </section>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105"
            style={{ backgroundColor: FlitCarColors.primary }}
          >
            {t('privacyPage.backButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
