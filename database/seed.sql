-- ====================================================================
-- NVC Public Procurement Monitoring & Inspection System
-- Master Data and Seed Records
-- ====================================================================

-- 1. Roles
INSERT INTO roles (name, display_name, description) VALUES
('admin', 'प्रशासक (Administrator)', 'पूर्ण प्रशासनिक अधिकार, चेकलिस्ट मास्टर, प्रयोगकर्ता तथा अडिट व्यवस्थापन'),
('inspector', 'निरीक्षक (Inspector)', 'खरिद दर्ता, अनुगमन तथा निरीक्षण, चेकलिस्ट भर्ने, प्रमाण तथा Findings दर्ता'),
('reviewer', 'पुनरावलोकनकर्ता/सुपरभाइजर (Reviewer/Supervisor)', 'निरीक्षण प्रतिवेदन समीक्षा, प्रमाणीकरण, फिर्ता वा बन्द गर्ने अधिकार'),
('viewer', 'अवलोकनकर्ता (Viewer)', 'मात्र हेर्न मिल्ने अधिकार (Read-only)')
ON CONFLICT (name) DO NOTHING;

-- 2. Provinces
INSERT INTO provinces (id, name_en, name_ne) VALUES
(1, 'Koshi Province', 'कोशी प्रदेश'),
(2, 'Madhesh Province', 'मधेश प्रदेश'),
(3, 'Bagmati Province', 'बागमती प्रदेश'),
(4, 'Gandaki Province', 'गण्डकी प्रदेश'),
(5, 'Lumbini Province', 'लुम्बिनी प्रदेश'),
(6, 'Karnali Province', 'कर्णाली प्रदेश'),
(7, 'Sudurpashchim Province', 'सुदूरपश्चिम प्रदेश')
ON CONFLICT (id) DO NOTHING;

-- 3. Districts
INSERT INTO districts (id, province_id, name_en, name_ne) VALUES
(1, 3, 'Kathmandu', 'काठमाडौं'),
(2, 3, 'Lalitpur', 'ललितपुर'),
(3, 3, 'Bhaktapur', 'भक्तपुर'),
(4, 1, 'Jhapa', 'झापा'),
(5, 1, 'Morang', 'मोरङ'),
(6, 4, 'Kaski', 'कास्की'),
(7, 5, 'Rupandehi', 'रुपन्देही')
ON CONFLICT (id) DO NOTHING;

-- 4. Municipalities
INSERT INTO municipalities (id, district_id, name_en, name_ne, type) VALUES
(1, 1, 'Kathmandu Metropolitan City', 'काठमाडौं महानगरपालिका', 'Metropolitan'),
(2, 4, 'Damak Municipality', 'दमक नगरपालिका', 'Municipality'),
(3, 6, 'Pokhara Metropolitan City', 'पोखरा महानगरपालिका', 'Metropolitan'),
(4, 5, 'Biratnagar Metropolitan City', 'विराटनगर महानगरपालिका', 'Metropolitan')
ON CONFLICT (id) DO NOTHING;

-- 5. Ministries
INSERT INTO ministries (id, name_en, name_ne) VALUES
(1, 'Ministry of Physical Infrastructure and Transport', 'भौतिक पूर्वाधार तथा यातायात मन्त्रालय'),
(2, 'Ministry of Water Supply', 'खानेपानी मन्त्रालय'),
(3, 'Ministry of Urban Development', 'शहरी विकास मन्त्रालय'),
(4, 'Ministry of Energy, Water Resources and Irrigation', 'ऊर्जा, जलस्रोत तथा सिंचाइ मन्त्रालय'),
(5, 'Office of the Prime Minister and Council of Ministers', 'प्रधानमन्त्री तथा मन्त्रिपरिषद्को कार्यालय')
ON CONFLICT (id) DO NOTHING;

-- 6. Offices (3 Primary Offices)
INSERT INTO offices (id, ministry_id, province_id, district_id, name, code, address, is_active) VALUES
(1, 1, 3, 1, 'सडक डिभिजन काठमाडौं', 'RD-KTM-01', 'मीनभवन, काठमाडौं', TRUE),
(2, 2, 1, 4, 'संघीय खानेपानी तथा ढल व्यवस्थापन आयोजना झापा', 'FWSS-JHP-02', 'भद्रपुर, झापा', TRUE),
(3, 3, 4, 6, 'शहरी विकास तथा भवन निर्माण विभाग डिभिजन कार्यालय पोखरा', 'DUDBC-PKR-03', 'गैह्रापाटन, पोखरा', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 7. Fiscal Years
INSERT INTO fiscal_years (id, name, is_current) VALUES
(1, '२०८२/८३', FALSE),
(2, '२०८३/८४', FALSE),
(3, '२०८४/८५', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 8. Users
INSERT INTO users (id, username, password_hash, full_name, email, role, office_id, designation, phone, is_active) VALUES
(1, 'admin', '$2b$10$2lXnAaDQSvyVq2BWJFCT5uH9844NvH.kXMwXLHayGd5jUXaAZ3Jl6', 'प्रशासक (NVC Admin)', 'admin@nvc.gov.np', 'admin', 1, 'उप-सचिव / प्राविधिक निर्देशक', '9851000001', TRUE),
(2, 'inspector', '$2b$10$qMpPVm7ip44C0Eh7HXMI1eBYqdwoBh5zuaXZrGz9X/iA14oZUBGim', 'पुरुषोत्तम प्रसाद (Lead Inspector)', 'inspector@nvc.gov.np', 'inspector', 1, 'सिनियर डिभिजनल इन्जिनियर (CDE)', '9851000002', TRUE),
(3, 'reviewer', '$2b$10$JH4Papu8iW4vX/lSr6llxuiIPmuCNw8ZBWEZYEEYwA.kqtOk.qKVW', 'सुजन अधिकारी (Supervisor/Reviewer)', 'reviewer@nvc.gov.np', 'reviewer', 1, 'सि.डि.ई. / महाशाखा प्रमुख', '9851000003', TRUE),
(4, 'viewer', '$2b$10$wJC0yU52ke3fu6kEhGxBxO2VWeBxcCEKadF4ILUBaR48ZBIF887G.', 'साजन लवट (NVC Observer)', 'viewer@nvc.gov.np', 'viewer', 1, 'अधिकृत (अनुसन्धान शाखा)', '9851000004', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 9. Master Checklist Stages + 10. Master Checklist Items (३४ चरण / १४२ बुँदा)
-- पूर्ण मास्टर चेकलिस्ट अब database/migrations/002_full_checklist_34_stages.sql बाट
-- स्वतः लोड हुन्छ (checklist.md — सार्वजनिक खरिद ऐन, २०६३ / नियमावली, २०६४ बमोजिम)।
-- पुरानो १२-चरण/५५-बुँदे सूची यहाँबाट हटाइसकिएको छ (migration ले data-preserving remap गर्छ)।

-- 11. Demo Procurements (5 Realistic Procurements marked DEMO DATA)
INSERT INTO procurements (
    id, procurement_id_code, procurement_number, office_id, ministry_id, province_id, district_id, municipality_id, ward,
    title, procurement_type, procurement_method, fiscal_year_id, budget_source, estimated_cost, contract_amount,
    contract_number, contract_date, contractor_name, contract_start_date, contract_completion_date,
    current_status, inspection_date, inspection_team, lead_inspector, remarks
) VALUES
(
    1, 'DEMO-PROC-2083-001', 'DROKTM/337144/2080/081/W-12', 1, 1, 3, 1, 1, '४',
    'काठमाडौं चक्रपथ सुधार तथा अस्फाल्ट ओभरले निर्माण कार्य (DEMO DATA)', 'Works', 'Open Competitive Bidding', 3, 'नेपाल सरकार (GoN)',
    45000000.00, 38500000.00, 'DROKTM-CONT-081-12', '2026-01-15', 'युनाइटेड-स्वच्छन्द जे.भी., काठमाडौं', '2026-02-01', '2027-01-31',
    'संचालनमा', '2026-05-10', 'उपसचिव (लेखा) शिवहरी न्यौपाने, ई. साजन लवट,  कानून अधिकृत अजित केशरी', 'पोषराज बुढाथोकी',
    'चक्रपथ सडक स्तरोन्नति खरिद अनुगमन तथा स्थलगत निरीक्षण (DEMO DATA)'
),
(
    2, 'DEMO-PROC-2083-002', 'FWSS-JHP-SQ-080-81-G-05', 2, 2, 1, 4, 2, '३',
    'दमक खानेपानी आयोजनाको लागि उच्च घनत्व पोलिथिन पाइप (HDPE) खरिद (DEMO DATA)', 'Goods', 'Sealed Quotation', 3, 'नेपाल सरकार (GoN)',
    1850000.00, 1680000.00, 'FWSS-SQ-05-2080', '2026-02-10', 'पूर्वाञ्चल पाइप इन्डस्ट्रिज प्रा.लि., इटहरी', '2026-02-20', '2026-04-20',
    'सम्पन्न', '2026-06-15', 'ई. ज्योति कार्की, शाखा अधिकृत शोभित रिजाल', 'भावना पुडासैनी',
    'सिलबन्दी दरभाउपत्र मार्फत सामग्री खरिद अनुगमन (DEMO DATA)'
),
(
    3, 'DEMO-PROC-2083-003', 'DUDBC-PKR-DIR-080-81-02', 3, 3, 4, 6, 3, '८',
    'पोखरा अन्तर्राष्ट्रिय सभाहल पहुँचमार्ग संरक्षण तथा आपत्कालीन तटबन्ध निर्माण (DEMO DATA)', 'Works', 'Direct Procurement', 3, 'आन्तरिक स्रोत (GoN)',
    9500000.00, 9250000.00, 'DUDBC-DP-02-81', '2026-03-01', 'फेवा कन्स्ट्रक्सन प्रा.लि., पोखरा', '2026-03-05', '2026-06-30',
    'संचालनमा', '2026-07-02', 'ई. पुरुषोत्तम प्रसाद, ई. ज्योति कार्की', 'ई. विभूति पोखरेल',
    'सोझै खरिद विधिको कानूनी औचित्य तथा दररेट अनुगमन (DEMO DATA)'
),
(
    4, 'DEMO-PROC-2083-004', 'MORANG-IRR-UC-2080-08', 2, 4, 1, 5, 4, '७',
    'सुनसरी-मोरङ सिंचाइ नहर मर्मत तथा तटबन्ध निर्माण (उपभोक्ता समिति) (DEMO DATA)', 'Works', 'Consumer Committee', 3, 'नेपाल सरकार / प्रदेश',
    7200000.00, 6800000.00, 'UC-AGR-080-81-19', '2026-01-20', 'नहर सुधार उपभोक्ता समिति, रतुवामाई', '2026-02-01', '2026-05-30',
    'सम्पन्न', '2026-06-20', 'ई. ज्योति कार्की, लेखापाल पोषराज बुढाथोकी', 'सुरेन्द्र गौतम',
    'उपभोक्ता समिति मार्फत निर्माण कार्य तथा जनसहभागिता अनुगमन (DEMO DATA)'
),
(
    5, 'DEMO-PROC-2083-005', 'MOPIT-CS-RFP-080-81-01', 1, 1, 3, 1, 1, '२',
    'बागमती प्रदेश रणनीतिक सडक सञ्जाल गुरुयोजना विस्तृत सम्भाव्यता अध्ययन (DEMO DATA)', 'Consultancy Services', 'Consultancy Selection', 3, 'नेपाल सरकार',
    12000000.00, 10800000.00, 'MOPIT-CS-080-01', '2026-11-15', 'नेपाल इन्जिनियरिङ कन्सल्ट्यान्ट्स प्रा.लि., ललितपुर', '2026-12-01', '2027-11-30',
    'संचालनमा', '2027-04-18', 'ई. ज्योति कार्की, शाखा अधिकृत योगराज अर्याल', 'सुरेन्द्र गौतम',
    'परामर्श सेवा खरिद तथा डेलिभरेबल्स गुणस्तर अनुगमन (DEMO DATA)'
)
ON CONFLICT (id) DO NOTHING;

-- 12. Demo Inspections
INSERT INTO inspections (
    id, inspection_code, procurement_id, inspection_date, status, lead_inspector_id, inspection_team,
    summary_notes, risk_score, completion_percentage, created_by
) VALUES
(
    1, 'INSP-2083-001', 1, '2026-05-10', 'In Progress', 2,
    'ई. पुरुषोत्तम प्रसाद, ई. ज्योति कार्की',
    'काठमाडौं चक्रपथ सुधार कार्यको प्रारम्भिक तयारीदेखि सम्झौता कार्यान्वयन तथा भुक्तानीसम्मका चरणहरूको विस्तृत स्थलगत अनुगमन। ल्याब रिपोर्ट र नापी किताब रुजु गर्दा परिमाणमा केही विचलन देखिएको। (DEMO DATA)',
    2.8, 85.0, 2
),
(
    2, 'INSP-2083-002', 2, '2026-06-15', 'Verified', 3,
    'ई. विभूति पोखरेल, ई. ज्योति कार्की',
    'दमक खानेपानी पाइप खरिद प्रक्रियाको प्रारम्भिक तयारी देखि भुक्तानी सम्मको अनुगमन। दरभाउपत्र प्रक्रिया सामान्यतया सन्तोषजनक। (DEMO DATA)',
    1.2, 100.0, 3
),
(
    3, 'INSP-2083-003', 3, '2026-07-02', 'Under Review', 2,
    'ई. पुरुषोत्तम प्रसाद, ई. ज्योति कार्की',
    'सोझै खरिद विधि प्रयोग गरिएकोमा ऐनको दफा ४१ अनुसारको औचित्य पुष्ट्याइँ अपूर्ण देखिएको र दर विश्लेषण बजार भाउ भन्दा उच्च रहेको। (DEMO DATA)',
    3.4, 75.0, 2
)
ON CONFLICT (id) DO NOTHING;

-- 13. Demo Inspection Checklist Results (Sample Results for Inspection 1)
INSERT INTO inspection_checklist_results (
    inspection_id, checklist_item_id, compliance_status, risk_level, evidence_reference,
    observation, financial_impact, inspector_comment, completed_by, completed_at
) VALUES
(1, 1, 'परिपालन', 'न्यून', 'माग फाराम दर्ता नं. १४५, डिभिजन प्रमुख निर्णय', 'खरिद आवश्यकता र औचित्य स्पष्ट रूपमा पुष्टि भएको।', 0, 'स्वीकृत योजना अनुरुप रहेको।', 2, CURRENT_TIMESTAMP),
(1, (SELECT id FROM checklist_items WHERE checklist_code = 'PROC-011'), 'आंशिक परिपालन', 'मध्यम', 'स्पेसिफिकेसन पाना नं. १२-१८', 'स्पेसिफिकेसनमा केही प्राविधिक मापदण्ड निश्चित आयातकर्तासँग मेल खाने देखिएको।', 0, 'भविष्यमा मानक SBD को जेनेरिक विवरण मात्र राख्न निर्देशन।', 2, CURRENT_TIMESTAMP),
(1, (SELECT id FROM checklist_items WHERE checklist_code = 'PROC-017'), 'परिपालन', 'मध्यम', 'लागत अनुमान फाइल, दर विश्लेषण भौचर २३', 'जिल्ला दररेट अनुसार लागत अनुमान तयार भएको।', 0, 'नर्म्स अनुसार ठीक रहेको।', 2, CURRENT_TIMESTAMP),
(1, (SELECT id FROM checklist_items WHERE checklist_code = 'PROC-024'), 'परिपालन', 'न्यून', 'बजेट शीर्षक ३३७१४४/४, बजेट विनियोजन पत्र', 'बजेट सुनिश्चितता रहेको र साइट बाधाअवरोधरहित उपलब्ध।', 0, 'साइट हस्तान्तरण मुचुल्का संलग्न।', 2, CURRENT_TIMESTAMP),
(1, (SELECT id FROM checklist_items WHERE checklist_code = 'PROC-046'), 'परिपालन नभएको', 'उच्च', 'बोलपत्र कागजात खण्ड ३, योग्यता सर्त ४.२', 'विगतको अनुभवमा अस्वाभाविक रूपमा एउटै प्याकेजमा रु. ३० करोडको सडक काम मागेर अन्य व्यवसायीलाई रोक्न खोजेको।', 0, 'खुला प्रतिस्पर्धा संकुचित भएको देखिएको।', 2, CURRENT_TIMESTAMP),
(1, (SELECT id FROM checklist_items WHERE checklist_code = 'PROC-091'), 'आंशिक परिपालन', 'उच्च', 'ल्याब रजिस्टर पृष्ठ ४४, टेस्ट रिपोर्ट नं. १०२', 'अस्फाल्ट कंक्रिटको कोर-कटर टेस्ट समयमै गरिएको नदेखिएको र कम्प्याक्सन रिपोर्ट अपुग।', 250000.00, 'थप स्थलगत नमुना परीक्षण गराउन सिफारिस।', 2, CURRENT_TIMESTAMP),
(1, (SELECT id FROM checklist_items WHERE checklist_code = 'PROC-093'), 'परिपालन नभएको', 'अत्यन्त उच्च', 'MB नं. ०४, पृष्ठ २८-३५ र स्थलगत नाप', 'नापी किताबमा प्रविष्ट गरिएको सब-बेस थिकनेस (१५ सेमी) र स्थलगत चेक गर्दा (१२ सेमी मात्र) पाइएको, बढी परिमाण चढाएको।', 650000.00, 'बढी नाप देखिएकोले रनिङ बिलबाट रु. ६,५०,००० कट्टी गर्न सिफारिस।', 2, CURRENT_TIMESTAMP),
(1, (SELECT id FROM checklist_items WHERE checklist_code = 'PROC-096'), 'परिपालन', 'मध्यम', 'बैंक ग्यारेन्टी नं. BG-8821, पेश्की खाता', '१०% मोबिलाइजेसन पेश्की सम्झौता बमोजिम सुरक्षित ग्यारेन्टी राखी दिएको।', 0, 'पेश्की जमानत २०८१ पुस सम्म मान्य रहेको।', 2, CURRENT_TIMESTAMP),
(1, (SELECT id FROM checklist_items WHERE checklist_code = 'PROC-100'), 'परिपालन नभएको', 'उच्च', 'भेरिएसन टिप्पणी नं. २, साइड ड्रेन परिमार्जन', 'विना पूर्व-स्वीकृति साइटमा भेरिएसन कार्य गराई पछि टिप्पणी उठाइएको।', 800000.00, 'सार्वजनिक खरिद ऐन दफा ५४ को उल्लङ्घन।', 2, CURRENT_TIMESTAMP)
ON CONFLICT (inspection_id, checklist_item_id) DO NOTHING;

-- 14. Demo Findings (Sample Findings from Inspection 1 and 3)
INSERT INTO findings (
    id, finding_code, inspection_id, procurement_id, checklist_item_id,
    title, description, legal_reference, evidence_summary, possible_irregularity,
    risk_level, estimated_financial_impact, responsible_office, responsible_officer,
    recommended_corrective_action, deadline, status, inspector_remarks, created_by
) VALUES
(
    1, 'FND-2083-001', 1, 1, (SELECT id FROM checklist_items WHERE checklist_code = 'PROC-093'),
    'नापी किताबमा वास्तविक भन्दा बढी परिमाण प्रविष्ट (Excess Measurement in MB) (DEMO DATA)',
    'सडक सब-बेस निर्माण कार्यको स्थलगत प्राविधिक जाँच गर्दा औषत मोटाइ १२ सेमी मात्र पाइएकोमा नापी किताबमा १५ सेमी चढाएर बढी परिमाण दाबी गरिएको।',
    'सार्वजनिक खरिद नियमावली नियम २९',
    'MB नं. ०४ पृष्ठ २८-३५, संयुक्त स्थलगत नापजाँच मुचुल्का मिति २०८१/०२/०५',
    'वास्तविक सम्पन्न काम भन्दा बढी नाप देखाई भुक्तानी लिने प्रयास',
    'अत्यन्त उच्च', 650000.00, 'सडक डिभिजन काठमाडौं', 'साइट इन्जिनियर प्रकाश थापा',
    'नापी किताब तुरुन्त सच्याउने, बढी चढाएको परिमाण वापतको रकम रु. ६,५०,००० आगामी रनिङ बिलबाट कट्टी गर्ने।',
    '2026-06-30', 'Corrective Action Required', 'गम्भीर प्रकृतिको अनियमितता देखिएकोले तत्काल असुलउपर गर्नुपर्ने।', 2
),
(
    2, 'FND-2083-002', 1, 1, (SELECT id FROM checklist_items WHERE checklist_code = 'PROC-100'),
    'पूर्व-स्वीकृति विना गैरकानूनी भेरिएसन कार्य संचालन (Variation without Prior Approval) (DEMO DATA)',
    'साइड ड्रेनको आकार परिवर्तन गर्दा अधिकारप्राप्त अधिकारीबाट पूर्व-स्वीकृति नलिई निर्माण व्यवसायीलाई काम गर्न दिई पछि मात्र भेरिएसन टिप्पणी उठाएको।',
    'सार्वजनिक खरिद ऐन दफा ५४ / नियमावली नियम ३१',
    'डिभिजन कार्यालय टिप्पणी नं. ०२, साइट लग बुक',
    'पूर्व-स्वीकृति नलिई काम गराउने र आर्थिक दायित्व सिर्जना गर्ने',
    'उच्च', 800000.00, 'सडक डिभिजन काठमाडौं', 'डिभिजन प्रमुख तथा आयोजना प्रमुख',
    'प्राविधिक औचित्य पुष्टि विना भेरिएसन भुक्तानी नगर्ने, सक्षम अधिकारीबाट छानबिन गराउने।',
    '2026-07-15', 'Open', 'नियम ३१ को स्पष्ट उल्लङ्घन।', 2
),
(
    3, 'FND-2083-003', 3, 3, (SELECT id FROM checklist_items WHERE checklist_code = 'PROC-115'),
    'खुला प्रतिस्पर्धा छल्न सोझै खरिद विधिको दुरुपयोग (Misuse of Direct Procurement) (DEMO DATA)',
    'पोखरा सभाहल पहुँचमार्ग निर्माणमा विपद् वा आपत्कालीन अवस्था प्रमाणित नहुँदै ऐनको दफा ४१ को अपवादात्मक व्यवस्था प्रयोग गरी सोझै खरिद गरिएको।',
    'सार्वजनिक खरिद ऐन दफा ४१ / नियमावली नियम ३७',
    'खरिद निर्णय मिसिल, बजार दर विश्लेषण कागजात',
    'खुला प्रतिस्पर्धा संकुचित गरी राज्यलाई बढी मूल्यको भार पार्ने',
    'अत्यन्त उच्च', 1200000.00, 'शहरी विकास तथा भवन निर्माण डिभिजन कास्की', 'डिभिजनल इन्जिनियर',
    'सोझै खरिदको दररेट प्रचलित बजार दरसँग तुलना गरी बढी मूल्याङ्कन भएको रकम असुलउपर गर्ने।',
    '2026-08-01', 'Open', 'सार्वजनिक खरिद अनुगमन कार्यालयमा समेत जानकारी गराउने।', 2
)
ON CONFLICT (id) DO NOTHING;

-- 15. Demo Corrective Actions
INSERT INTO corrective_actions (
    id, finding_id, inspection_id, corrective_action_text, responsible_office,
    responsible_officer, deadline, progress_notes, status, verification_status
) VALUES
(
    1, 1, 1,
    'नापी किताब MB नं. ०४ सच्याई बढी देखाइएको परिमाण बराबरको रकम रु. ६,५०,००० रनिङ बिल नं. ३ बाट कट्टा गरी दाखिला गर्ने।',
    'सडक डिभिजन काठमाडौं', 'लेखा अधिकृत तथा साइट इन्जिनियर', '2026-06-30',
    'साइट इन्जिनियरले संयुक्त नाप पुनः प्रमाणित गरी रनिङ बिलबाट कट्टा गर्ने प्रक्रिया सुरु गरेको छ।',
    'प्रक्रियामा', 'Unverified'
),
(
    2, 2, 1,
    'साइड ड्रेनको प्राविधिक औचित्य जाँच समिति गठन गरी प्रतिवेदन पेश गर्ने तथा पूर्व स्वीकृति विना भएको कामको भुक्तानी रोक्का राख्ने।',
    'सडक डिभिजन काठमाडौं', 'डिभिजन प्रमुख', '2026-07-15',
    'प्राविधिक उप-समिति गठन भएको र प्रतिवेदन आउन बाँकी छ।',
    'बाँकी', 'Unverified'
),
(
    3, 3, 3,
    'सोझै खरिद सम्झौताको दर विश्लेषणको बाह्य प्राविधिक पुनरावलोकन गरी बजार दर भन्दा बढी दररेट समायोजन गर्ने।',
    'शहरी विकास डिभिजन कास्की', 'डिभिजन प्रमुख', '2026-08-01',
    'म्याद नाघेको - हालसम्म कुनै जवाफ प्राप्त नभएको।',
    'समयसीमा नाघेको', 'Rejected'
)
ON CONFLICT (id) DO NOTHING;

-- 16. Demo Procurement Documents Checklist for Procurement 1
INSERT INTO procurement_documents (procurement_id, document_title, document_type, status, remarks) VALUES
(1, 'खरिद माग फाराम तथा औचित्य', 'Preparation', 'उपलब्ध छ', 'सक्षम अधिकारीबाट स्वीकृत'),
(1, 'बजेट विनियोजन तथा स्रोत सुनिश्चितता पत्र', 'Budget', 'उपलब्ध छ', 'मन्त्रालयको बजेट सहमति पत्र'),
(1, 'विस्तृत लागत अनुमान तथा दर विश्लेषण', 'Estimate', 'उपलब्ध छ', 'डिभिजन प्रमुखबाट स्वीकृत'),
(1, 'स्वीकृत वार्षिक खरिद योजना', 'Planning', 'उपलब्ध छ', 'वार्षिक योजना कोड सहित'),
(1, 'मानक बोलपत्र कागजात (SBD)', 'Bidding', 'उपलब्ध छ', 'PPMO मानक अनुसार'),
(1, 'बोलपत्र आह्वानको राष्ट्रिय दैनिक पत्रिका सूचना', 'Notice', 'उपलब्ध छ', 'गोरखापत्रमा ३० दिने म्याद'),
(1, 'पूर्व-बोलपत्र बैठकको निर्णय माइन्युट', 'Pre-Bid', 'उपलब्ध छ', 'e-GP मा अपलोड गरिएको'),
(1, 'बोलपत्र खोल्ने मुचुल्का (Opening Minutes)', 'Opening', 'उपलब्ध छ', '३ बोलपत्रदाताको रोहवरमा'),
(1, 'मूल्याङ्कन समितिको पूर्ण प्रतिवेदन', 'Evaluation', 'उपलब्ध छ', 'सर्वसम्मत सिफारिस'),
(1, 'आशयको सूचना (LOI)', 'Award', 'उपलब्ध छ', '७ दिने सार्वजनिक सूचना'),
(1, 'कार्यसम्पादन बैंक जमानत (Performance Guarantee)', 'Security', 'उपलब्ध छ', '५% ग्यारेन्टी दाखिला'),
(1, 'द्विपक्षीय सम्झौता पत्र', 'Contract', 'उपलब्ध छ', 'मानक सम्झौता सम्पन्न'),
(1, 'बीमा पोलिसी (Contractor All Risk)', 'Insurance', 'अपूर्ण', 'कामदार दुर्घटना बीमा नवीकरण बाँकी'),
(1, 'साइट हस्तान्तरण मुचुल्का तथा कार्यादेश', 'Site', 'उपलब्ध छ', 'विवादरहित हस्तान्तरण'),
(1, 'प्रयोगशाला परीक्षण प्रतिवेदन (Lab Reports)', 'Quality', 'अपूर्ण', 'कम्प्याक्सन टेस्ट अपुग'),
(1, 'नापी किताब (Measurement Book)', 'Measurement', 'उपलब्ध छ', 'MB नं. ०४'),
(1, 'रनिङ बिल तथा भुक्तानी भौचर', 'Payment', 'उपलब्ध छ', 'रनिङ बिल १ र २ भुक्तानी भएको'),
(1, 'भेरिएसन अर्डर कागजात', 'Variation', 'अपूर्ण', 'पूर्व स्वीकृति विना काम भएको'),
(1, 'सार्वजनिक परीक्षण प्रतिवेदन', 'Transparency', 'उपलब्ध छैन', 'आयोजना स्थलमा सार्वजनिक परीक्षण नभएको')
ON CONFLICT DO NOTHING;

-- 17. Initial Audit Log
INSERT INTO audit_logs (user_id, username, action, entity_type, entity_id, new_values, ip_address) VALUES
(1, 'admin', 'SYSTEM_INITIALIZATION', 'System', '0', '{"message": "प्रणाली प्रारम्भिक डाटाबेस सिड तथा ३४-चरण/१४२-बुँदे मास्टर चेकलिस्ट लोड सम्पन्न।"}'::jsonb, '127.0.0.1');
