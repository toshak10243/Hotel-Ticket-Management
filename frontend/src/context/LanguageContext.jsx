import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    // Nav
    submitRequest: 'Submit Request',
    trackRequest: 'Track Request',
    qrGenerator: 'QR Generator',
    staffLogin: 'Staff Login',
    hotelName: 'Hotel Arya Niwas',
    hotelSub: 'Jaipur, Rajasthan',
    langToggle: 'हिंदी',

    // Guest Request Form
    portalTag: 'Guest Self-Service Portal',
    howMayWeHelp: 'How May We Assist You Today?',
    formSubtitle: 'Submit your room service request or maintenance complaint directly to our hotel department. Our staff receives instant WhatsApp & dashboard notifications.',
    roomNumber: 'Room Number',
    roomPlaceholder: 'e.g. 101, 204, 305',
    roomHelp: 'Room number is remembered and pre-filled automatically for this session.',
    requestType: 'Request Type',
    serviceRequest: 'Service Request',
    serviceDesc: 'Linen, cleaning, amenities, water, food orders',
    complaint: 'Complaint',
    complaintDesc: 'Broken appliance, AC issue, plumbing fault, noise, safety concern',
    categoryDept: 'Department / Category',
    priorityLevel: 'Priority Level',
    low: 'Low',
    lowDesc: 'Standard turnaround',
    medium: 'Medium',
    mediumDesc: 'Needs attention soon',
    high: 'High',
    highDesc: 'Urgent (15-min SLA response)',
    description: 'Details / Description',
    descPlaceholder: 'Please detail your request or describe any issue in detail...',
    submitBtn: 'Submit Request',
    submitting: 'Submitting Request...',

    // Categories
    catHousekeeping: 'Housekeeping (Cleaning, towels, bed linen, toiletries)',
    catMaintenance: 'Maintenance (Air conditioner, TV, electrical, plumbing)',
    catSafety: 'Safety & Security (Lock issues, fire safety, emergency, keycards)',
    catFood: 'Food & Room Service (Dining, snacks, breakfast, beverages)',
    catFrontOffice: 'Front Office (Wake up calls, luggage assistance, billing)',
    catOther: 'Other / General inquiry',

    // Confirmation
    reqReceived: 'Request Successfully Received',
    reqReceivedSubtitle: 'Our front desk and maintenance team have received your ticket and will attend to Room {room} shortly.',
    expectedSla: 'Estimated First Response Time: {time}',
    ticketIdTag: 'Your Ticket ID',
    copy: 'Copy',
    submittedSummary: 'Submitted Request Summary',
    refreshStatus: 'Refresh Status',
    liveTrackingBtn: 'Live Tracking View',
    submitAnother: 'Submit Another Request',

    // Tracking
    trackTitle: 'Track Your Request Status',
    trackSubtitle: 'Enter your unique Ticket ID (e.g. AN-2026-1011) to view real-time SLA and resolution updates.',
    trackBtn: 'Track Status',
    ticketRef: 'Ticket Reference',
    progressLog: 'Request Progress & Timestamp Log',
  },
  hi: {
    // Nav
    submitRequest: 'अनुरोध दर्ज करें',
    trackRequest: 'स्टेटस ट्रैक करें',
    qrGenerator: 'क्यूआर जनरेटर',
    staffLogin: 'स्टाफ लॉगिन',
    hotelName: 'होटल आर्य निवास',
    hotelSub: 'जयपुर, राजस्थान',
    langToggle: 'English',

    // Guest Request Form
    portalTag: 'अतिथि स्वयं सेवा पोर्टल',
    howMayWeHelp: 'आज हम आपकी क्या सहायता कर सकते हैं?',
    formSubtitle: 'अपने कमरे से हाउसकीपिंग, रखरखाव या भोजन सेवा का अनुरोध सीधे संबंधित विभाग को भेजें। हमारे स्टाफ को तुरंत सूचना प्राप्त होती है।',
    roomNumber: 'कमरा संख्या (Room Number)',
    roomPlaceholder: 'जैसे 101, 204, 305',
    roomHelp: 'इस सत्र के लिए कमरा संख्या स्वतः याद रखी जाएगी।',
    requestType: 'अनुरोध का प्रकार',
    serviceRequest: 'सेवा अनुरोध (Service Request)',
    serviceDesc: 'सफाई, तौलिए, चादरें, पानी, भोजन का आर्डर',
    complaint: 'शिकायत (Complaint)',
    complaintDesc: 'खराब उपकरण, एसी की समस्या, नल खराबी, सुरक्षा चिंता',
    categoryDept: 'विभाग / श्रेणी',
    priorityLevel: 'प्राथमिकता स्तर',
    low: 'सामान्य (Low)',
    lowDesc: 'सामान्य समय में समाधान',
    medium: 'मध्यम (Medium)',
    mediumDesc: 'जल्द ध्यान देने योग्य',
    high: 'अति आवश्यक (High)',
    highDesc: 'तत्काल 15 मिनट में समाधान',
    description: 'समस्या या आवश्यकता का विवरण',
    descPlaceholder: 'कृपया अपनी आवश्यकता या समस्या का विवरण यहाँ लिखें...',
    submitBtn: 'अनुरोध सबमिट करें',
    submitting: 'अनुरोध भेजा जा रहा है...',

    // Categories
    catHousekeeping: 'हाउसकीपिंग (सफाई, तौलिए, बिस्तर की चादर, प्रसाधन)',
    catMaintenance: 'रखरखाव / मेंटेनेंस (एसी, टीवी, बिजली, नल की खराबी)',
    catSafety: 'सुरक्षा (दरवाजा लॉक, फायर अलार्म, चाबी कार्ड)',
    catFood: 'भोजन एवं रूम सर्विस (खाना, चाय/कॉफी, नाश्ता)',
    catFrontOffice: 'फ्रंट ऑफिस (वेक-अप कॉल, सामान सहायता, पूछताछ)',
    catOther: 'अन्य / सामान्य पूछताछ',

    // Confirmation
    reqReceived: 'अनुरोध सफलतापूर्वक दर्ज हुआ',
    reqReceivedSubtitle: 'हमारे स्टाफ को आपका टिकट मिल गया है और वे कमरा नं. {room} में शीघ्र उपस्थित होंगे।',
    expectedSla: 'अनुमानित प्रतिक्रिया समय: {time}',
    ticketIdTag: 'आपकी टिकट संख्या (Ticket ID)',
    copy: 'कॉपी करें',
    submittedSummary: 'दर्ज किए गए अनुरोध का विवरण',
    refreshStatus: 'ताज़ा करें (Refresh)',
    liveTrackingBtn: 'लाइव ट्रैकिंग देखें',
    submitAnother: 'नया अनुरोध दर्ज करें',

    // Tracking
    trackTitle: 'अनुरोध स्थिति ट्रैक करें',
    trackSubtitle: 'अपनी टिकट संख्या (जैसे AN-2026-1011) दर्ज करके रीयल-टाइम स्थिति देखें।',
    trackBtn: 'स्टेटस देखें',
    ticketRef: 'टिकट संदर्भ संख्या',
    progressLog: 'समयबद्ध प्रगति व इतिहास (Timestamp Log)',
  },
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('guest_lang') || 'en');

  const toggleLang = () => {
    setLang((prev) => {
      const next = prev === 'en' ? 'hi' : 'en';
      localStorage.setItem('guest_lang', next);
      return next;
    });
  };

  const t = (key, params = {}) => {
    let str = translations[lang]?.[key] || translations['en']?.[key] || key;
    Object.keys(params).forEach((p) => {
      str = str.replace(`{${p}}`, params[p]);
    });
    return str;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
