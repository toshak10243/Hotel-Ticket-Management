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

    // Guest Request Form Header & Tabs
    portalTag: 'Guest Self-Service Portal',
    portalHeading: 'Hotel Arya Niwas Guest Portal',
    portalWelcome: 'Welcome! Scan from your room standee gives you instant access to lodge requests, report issues, and track your active room tickets in real-time.',
    tabLodge: 'Lodge Request / Complaint',
    tabMyTickets: 'My Room Tickets',
    roomBadge: 'Room',

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
    catHousekeeping: 'Housekeeping',
    catHousekeepingDesc: 'Cleaning, linen & towels',
    catMaintenance: 'Maintenance',
    catMaintenanceDesc: 'AC, plumbing & electricity',
    catFood: 'Food & Dining',
    catFoodDesc: 'Room service & beverages',
    catSafety: 'Safety & Security',
    catSafetyDesc: 'Door locks, keycard & safety',
    catFrontOffice: 'Front Office',
    catFrontOfficeDesc: 'Luggage & wake-up calls',
    catOther: 'Other Inquiries',
    catOtherDesc: 'General assistance',

    // Room Tickets Tab
    searchTicketLabel: 'Search by Ticket ID (Optional)',
    searchTicketPlaceholder: 'Enter Ticket ID (e.g. AN-2026-7724)...',
    trackActionBtn: 'Track',
    ticketsForRoomTitle: 'Active & Past Tickets for Room {room}',
    ticketsForRoomSubtitle: 'Track the real-time progress of all issues submitted from this room.',
    refreshBtn: 'Refresh',
    loadingTickets: 'Loading tickets for Room {room}...',
    noTicketsFound: 'No active service requests or complaints found for Room {room}.',
    submitNewLink: '+ Submit a New Request',
    slaAlertBadge: '30m SLA Alert',
    submittedAt: 'Submitted',
    viewTimelineLink: 'View Full Timeline & Audit Log →',

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
    enterTicketPlaceholder: 'Enter Ticket ID (e.g. AN-2026-1011)',
    stepPending: 'Pending',
    stepAssigned: 'Assigned',
    stepInProgress: 'In Progress',
    stepResolved: 'Resolved',
    stepClosed: 'Closed',
    roomCardLabel: 'Room Number',
    categoryCardLabel: 'Category',
    assignedDeptCardLabel: 'Assigned Dept',
    pendingAssignmentText: 'Pending Assignment',
    descriptionCardLabel: 'Description',
    escalatedBadge: 'Escalated (30-min SLA)',
    statusLabel: 'Status',
    noHistoryYet: 'No history updates logged yet.',
    statusUpdatedByStaff: 'Status updated by hotel personnel.',

    // QR Standee Generator
    qrStandeeTag: 'Room QR Standee Generator',
    qrStandeeTitle: 'Hotel Room QR Code Configuration',
    qrStandeeDesc: 'Print or display this QR code in individual guest rooms. When guests scan this code with their smartphone camera, the request form automatically opens with the room number pre-populated.',
    targetRoomLabel: 'Target Room Number',
    quickPickLabel: 'Quick Pick Room',
    guestServiceMaintenance: 'Guest Service & Maintenance',
    scanHelpText: 'Scan with any phone camera to request housekeeping, room service, or report an issue.',
    printQrBtn: 'Print QR Standee',
    testOpenLink: 'Test Scan / Open Link Directly',
    qrDestinationHeading: 'QR Code Destination Link',
    qrDestinationDesc: 'This is the exact deep-link encoded in the QR code:',
    howItWorksHeading: 'How It Works:',
    howItWorksStep1: 'Hotel places the printable standee in Room {room}.',
    howItWorksStep2: 'The guest points their smartphone camera at the QR code.',
    howItWorksStep3: 'The browser automatically opens the service request portal.',
    howItWorksStep4: 'Room {room} is pre-populated in the form.',
    howItWorksStep5: 'The guest submits their request or complaint without login.',

    // Confirmation details
    roomSummaryLabel: 'Room',
    currentStatusLabel: 'Current Status',
    departmentLabel: 'Department',
    priorityLabelTag: 'Priority',
    detailsRemarksLabel: 'Details & Remarks',
    noTicketProvidedTitle: 'No Ticket Provided',
    noTicketProvidedDesc: 'Please submit a new request or use the tracking page to look up an existing ticket.',
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

    // Guest Request Form Header & Tabs
    portalTag: 'अतिथि स्वयं सेवा पोर्टल',
    portalHeading: 'होटल आर्य निवास अतिथि सेवा पोर्टल',
    portalWelcome: 'स्वागतम्! कमरे में लगे क्यूआर कोड को स्कैन करके आप सीधे अनुरोध दर्ज कर सकते हैं, समस्या बता सकते हैं और तुरंत लाइव स्टेटस देख सकते हैं।',
    tabLodge: 'अनुरोध / शिकायत दर्ज करें',
    tabMyTickets: 'मेरे कमरे के टिकट',
    roomBadge: 'कमरा संख्या',

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
    catHousekeeping: 'हाउसकीपिंग (सफाई)',
    catHousekeepingDesc: 'कमरे की सफाई, चादरें, तौलिए',
    catMaintenance: 'रखरखाव (मेंटेनेंस)',
    catMaintenanceDesc: 'एसी, नल, प्लंबिंग व बिजली',
    catFood: 'भोजन एवं रूम सर्विस',
    catFoodDesc: 'खाना, चाय/कॉफी, नाश्ता',
    catSafety: 'सुरक्षा एवं हिफाजत',
    catSafetyDesc: 'कमरा लॉक, चाबी कार्ड व सुरक्षा',
    catFrontOffice: 'फ्रंट ऑफिस',
    catFrontOfficeDesc: 'सामान सहायता, वेक-अप कॉल',
    catOther: 'अन्य पूछताछ',
    catOtherDesc: 'सामान्य सहायता व मार्गदर्शन',

    // Room Tickets Tab
    searchTicketLabel: 'टिकट संख्या द्वारा खोजें (वैकल्पिक)',
    searchTicketPlaceholder: 'टिकट संख्या दर्ज करें (जैसे AN-2026-7724)...',
    trackActionBtn: 'खोजें',
    ticketsForRoomTitle: 'कमरा नं. {room} के सभी सक्रिय व पूर्व टिकट',
    ticketsForRoomSubtitle: 'इस कमरे से दर्ज सभी समस्याओं और सेवाओं की लाइव प्रगति देखें।',
    refreshBtn: 'ताज़ा करें (Refresh)',
    loadingTickets: 'कमरा नं. {room} के टिकट लोड हो रहे हैं...',
    noTicketsFound: 'कमरा नं. {room} के लिए कोई सक्रिय अनुरोध या शिकायत नहीं मिली।',
    submitNewLink: '+ नया अनुरोध दर्ज करें',
    slaAlertBadge: '30 मिनट SLA अलर्ट',
    submittedAt: 'दर्ज किया गया',
    viewTimelineLink: 'पूरी टाइमलाइन और विवरण देखें →',

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
    enterTicketPlaceholder: 'टिकट संख्या दर्ज करें (उदा. AN-2026-1011)',
    stepPending: 'लंबित (Pending)',
    stepAssigned: 'आवंटित (Assigned)',
    stepInProgress: 'प्रगति पर (In Progress)',
    stepResolved: 'समाधान हुआ (Resolved)',
    stepClosed: 'बंद हुआ (Closed)',
    roomCardLabel: 'कमरा संख्या',
    categoryCardLabel: 'विभाग / श्रेणी',
    assignedDeptCardLabel: 'आवंटित विभाग',
    pendingAssignmentText: 'आवंटन की प्रतीक्षा में',
    descriptionCardLabel: 'विवरण',
    escalatedBadge: 'एस्केलेटेड (30 मिनट SLA)',
    statusLabel: 'स्थिति',
    noHistoryYet: 'अभी तक कोई प्रगति विवरण दर्ज नहीं है।',
    statusUpdatedByStaff: 'होटल स्टाफ द्वारा स्थिति अपडेट की गई।',

    // QR Standee Generator
    qrStandeeTag: 'कमरा क्यूआर स्टैंडी जनरेटर',
    qrStandeeTitle: 'होटल रूम क्यूआर कोड कॉन्फ़िगरेशन',
    qrStandeeDesc: 'प्रत्येक अतिथि कक्ष के लिए यह क्यूआर कोड प्रिंट करके लगाएं। जब मेहमान अपने फोन कैमरे से इसे स्कैन करेंगे, तो कमरा नंबर स्वतः भरा हुआ खुलेगा।',
    targetRoomLabel: 'कमरा संख्या चुनें',
    quickPickLabel: 'त्वरित कमरा चुनें',
    guestServiceMaintenance: 'अतिथि सेवा एवं रखरखाव',
    scanHelpText: 'हाउसकीपिंग, रूम सर्विस या शिकायत के लिए किसी भी फोन कैमरे से स्कैन करें।',
    printQrBtn: 'क्यूआर स्टैंडी प्रिंट करें',
    testOpenLink: 'कमरा लिंक खोलकर देखें',
    qrDestinationHeading: 'क्यूआर कोड गंतव्य लिंक (Destination Link)',
    qrDestinationDesc: 'यह क्यूआर कोड में एन्कोड किया गया सटीक वेब लिंक है:',
    howItWorksHeading: 'यह कैसे कार्य करता है:',
    howItWorksStep1: 'होटल स्टाफ कमरा नं. {room} में यह प्रिंटेड स्टैंडी लगाता है।',
    howItWorksStep2: 'अतिथि अपने स्मार्टफोन कैमरे से क्यूआर कोड स्कैन करता है।',
    howItWorksStep3: 'ब्राउज़र में सेवा पोर्टल सीधे स्वतः खुल जाता है।',
    howItWorksStep4: 'कमरा नं. {room} फॉर्म में अपने-आप भरा हुआ आता है।',
    howItWorksStep5: 'अतिथि बिना किसी लॉगिन के तुरंत अनुरोध या शिकायत दर्ज कर सकता है।',

    // Confirmation details
    roomSummaryLabel: 'कमरा',
    currentStatusLabel: 'वर्तमान स्थिति',
    departmentLabel: 'विभाग',
    priorityLabelTag: 'प्राथमिकता',
    detailsRemarksLabel: 'विवरण एवं टिप्पणी',
    noTicketProvidedTitle: 'कोई टिकट नहीं मिला',
    noTicketProvidedDesc: 'कृपया नया अनुरोध दर्ज करें या ट्रैकिंग पृष्ठ से टिकट खोजें।',
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

