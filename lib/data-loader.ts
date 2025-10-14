// Dynamic data loader based on language
import dataEn from '@/public/assets/data-en.json';
import dataDe from '@/public/assets/data-de.json';
import dataHr from '@/public/assets/data-hr.json';
import dataHu from '@/public/assets/data-hu.json';
import dataSl from '@/public/assets/data.json'; // Original Slovenian

export type SiteData = typeof dataSl;

const dataMap: Record<string, SiteData> = {
  sl: dataSl,
  en: dataEn,
  de: dataDe,
  hr: dataHr,
  hu: dataHu,
};

export function getDataForLanguage(language: string): SiteData {
  return dataMap[language] || dataSl;
}
