import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "nav": {
        "pdfToolkit": "PDF Toolkit",
        "imageStudio": "Image Studio",
        "aiAssistant": "AI Assistant",
        "mediaConverter": "Media Studio",
        "batchProcessing": "Batch Tools",
        "ocrScanner": "OCR Scanner",
        "webCapture": "Web to PDF",
        "textToSpeech": "Text to Speech",
        "pricing": "Pricing",
        "login": "Login",
        "signup": "Sign Up"
      },
      "home": {
        "hero_badge": "All-in-one File Suite",
        "hero_title_1": "Everything for your",
        "hero_title_2": "Files & Images.",
        "hero_desc": "Convert, compress, merge, and edit PDFs and Images in seconds using our advanced AI-powered tools.",
        "secure": "Secure Processing",
        "fast": "Fast Execution",
        "quality": "High Quality",
        "pro_title": "Ready to go PRO?",
        "pro_desc": "Get 100x higher limits, batch processing, and priority conversion speeds.",
        "check_pricing": "Check Pricing"
      }
    }
  },
  si: {
    translation: {
      "nav": {
        "pdfToolkit": "PDF මෙවලම්",
        "imageStudio": "පින්තූර සංස්කරණය",
        "aiAssistant": "AI සහායකයා",
        "mediaConverter": "මීඩියා ස්ටූඩියෝ",
        "batchProcessing": "එකවර ගොඩක්",
        "ocrScanner": "අකුරු කියවීම",
        "webCapture": "Website to PDF",
        "textToSpeech": "AI කටහඬ",
        "pricing": "මිල ගණන්",
        "login": "ඇතුල්වන්න",
        "signup": "ලියාපදිංචි වන්න"
      },
      "home": {
        "hero_badge": "සියලුම File පහසුකම් එකම තැනකින්",
        "hero_title_1": "ඔබගේ Files සඳහා",
        "hero_title_2": "සියල්ලම මෙතන.",
        "hero_desc": "තත්පර කිහිපයක් ඇතුළත PDF සහ පින්තූර Convert, Compress, සහ Edit කරගන්න.",
        "secure": "ආරක්ෂිතයි",
        "fast": "ඉතා වේගවත්",
        "quality": "ඉහළම ගුණාත්මක බව",
        "pro_title": "PRO පැකේජය ලබාගන්න",
        "pro_desc": "වැඩි පහසුකම්, එකවර ගොඩක් files හැදීම සහ වේගවත් සේවාවක් සඳහා PRO ලබාගන්න.",
        "check_pricing": "මිල ගණන් බලන්න"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
