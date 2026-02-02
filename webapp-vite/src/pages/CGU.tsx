/**
 * CGU (Conditions Générales d'Utilisation) Page
 * FlitCar Terms of Service
 *
 * This page contains the complete terms and conditions for using the FlitCar platform.
 * All users must accept these terms before making a reservation.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FlitCarColors } from '../constants/colors';

const CGU: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            {t('cgu.title')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('cgu.subtitle')}
          </p>
          <p className="text-sm text-gray-500 mt-4">
            {t('cgu.lastUpdated')}: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm p-8 prose prose-lg max-w-none">
          {/* Préambule */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ color: FlitCarColors.primary }}>
              {t('cgu.preamble.title')}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t('cgu.preamble.paragraph1')}
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t('cgu.preamble.paragraph2')}
              <strong className="text-red-600"> {t('cgu.preamble.warning')}</strong> {t('cgu.preamble.paragraph3')}
            </p>
          </section>

          {/* Article 1 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ color: FlitCarColors.primary }}>
              {t('cgu.article1.title')}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">{t('cgu.article1.intro')}</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>{t('cgu.article1.item1')}</li>
              <li>{t('cgu.article1.item2')}</li>
              <li>{t('cgu.article1.item3')}</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              {t('cgu.article1.conclusion')}
            </p>
          </section>

          {/* Article 2 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ color: FlitCarColors.primary }}>
              {t('cgu.article2.title')}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">{t('cgu.article2.intro')}</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>{t('cgu.article2.item1')}</li>
              <li>{t('cgu.article2.item2')}</li>
              <li>{t('cgu.article2.item3')}</li>
            </ul>
          </section>

          {/* Article 3 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ color: FlitCarColors.primary }}>
              {t('cgu.article3.title')}
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('cgu.article3.section1.title')}</h3>
                <p className="text-gray-700 leading-relaxed">
                  {t('cgu.article3.section1.text')}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('cgu.article3.section2.title')}</h3>
                <p className="text-gray-700 leading-relaxed">
                  {t('cgu.article3.section2.text')}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('cgu.article3.section3.title')}</h3>
                <p className="text-gray-700 leading-relaxed">
                  {t('cgu.article3.section3.text')}
                </p>
              </div>
            </div>
          </section>

          {/* Article 4 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ color: FlitCarColors.primary }}>
              {t('cgu.article4.title')}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">{t('cgu.article4.intro')}</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>{t('cgu.article4.item1')}</li>
              <li>{t('cgu.article4.item2')}</li>
              <li>{t('cgu.article4.item3')}</li>
            </ul>
          </section>

          {/* Article 5 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ color: FlitCarColors.primary }}>
              {t('cgu.article5.title')}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">{t('cgu.article5.intro')}</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>{t('cgu.article5.item1')}</li>
              <li>{t('cgu.article5.item2')}</li>
              <li>
                {t('cgu.article5.item3')} <strong>{t('cgu.article5.item3Bold')}</strong>{t('cgu.article5.item3End')}
              </li>
            </ul>
          </section>

          {/* Article 6 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ color: FlitCarColors.primary }}>
              {t('cgu.article6.title')}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">{t('cgu.article6.intro')}</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>
                <strong>{t('cgu.article6.item1Title')}</strong> {t('cgu.article6.item1Text')}
              </li>
              <li>
                <strong>{t('cgu.article6.item2Title')}</strong> {t('cgu.article6.item2Text')}
              </li>
              <li>
                <strong>{t('cgu.article6.item3Title')}</strong> {t('cgu.article6.item3Text')}
              </li>
              <li>
                <strong>{t('cgu.article6.item4Title')}</strong> {t('cgu.article6.item4Text')}
              </li>
            </ul>
          </section>

          {/* Article 7 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ color: FlitCarColors.primary }}>
              {t('cgu.article7.title')}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">{t('cgu.article7.intro')}</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>{t('cgu.article7.item1')}</li>
              <li>{t('cgu.article7.item2')}</li>
              <li>{t('cgu.article7.item3')}</li>
            </ul>
          </section>

          {/* Article 8 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ color: FlitCarColors.primary }}>
              {t('cgu.article8.title')}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t('cgu.article8.intro')}
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>{t('cgu.article8.item1')}</li>
              <li>{t('cgu.article8.item2')}</li>
            </ul>
          </section>

          {/* Contact Section */}
          <section className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{t('cgu.contact.title')}</h3>
            <p className="text-gray-700 leading-relaxed">
              {t('cgu.contact.text')}
              <a href="/support" className="ml-1 font-semibold" style={{ color: FlitCarColors.primary }}>
                {t('cgu.contact.supportLink')}
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
            {t('cgu.backButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CGU;
