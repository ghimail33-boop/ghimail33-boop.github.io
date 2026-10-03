export interface GuideOpinion {
  src: string;
  no: number;
  date: string;
  subject: string;
  opinion: string;
  stageIds: string[];
  references: string[];
  text: string;
  tokens: string[];
}

export interface GuideDecision {
  no: string;
  app: string;
  resp: string;
  subject: string;
  type: string;
  act: string;
  rule: string;
  use?: string;
  decision: string;
  stageIds: string[];
  references: string[];
  text: string;
  tokens: string[];
}

export interface GuideDataPayload {
  ops: Array<Omit<GuideOpinion, 'stageIds' | 'references' | 'text' | 'tokens'>>;
  pp: Array<Omit<GuideDecision, 'stageIds' | 'references' | 'text' | 'tokens'>>;
}

export interface GuideStage {
  id: string;
  name: string;
  keywords: string[];
  tip: string;
}

export interface SearchableGuideRecord {
  stageIds: string[];
  references: string[];
  text: string;
  tokens: string[];
}

export const GUIDE_STAGES: GuideStage[] = [
  { id: 'plan', name: 'खरिद योजना', keywords: ['खरिद योजना', 'गुरुयोजना', 'बहुवर्षीय', 'खरिद इकाई', 'बजेट', 'कार्यक्रम स्वीकृत', 'खरिद विधि छनोट', 'खरिद विधि'], tip: 'खरिद गुरुयोजना र वार्षिक योजनासँग प्याकेज तथा खरिद विधि मिलाउनुहोस्; सीमा वा प्रतिस्पर्धा छल्ने गरी टुक्रा नगर्नुहोस्।' },
  { id: 'est', name: 'लागत अनुमान', keywords: ['लागत अनुमान', 'दररेट', 'दर विश्लेषण', 'नर्म्स', 'भ्याट', 'लागत अनुमानभन्दा', 'स्वीकृत लागत'], tip: 'लागत अनुमानको परिमाण, दरको स्रोत, लागू नर्म्स र स्वीकृति जाँच्नुहोस्; बोलपत्र आह्वानअघि अद्यावधिक अनुमान स्वीकृत गराउनुहोस्।' },
  { id: 'doc', name: 'बोलपत्र कागजात / स्पेसिफिकेसन', keywords: ['बोलपत्र कागजात', 'स्पेसिफिकेसन', 'ब्रान्ड', 'योग्यताको आधार', 'पूर्वयोग्यता', 'पूर्व योग्यता', 'नमुना', 'मूल्य सूची', 'बोलपत्र सम्बन्धी कागजात', 'प्राविधिक विशिष्टता'], tip: 'योग्यता, स्पेसिफिकेसन र मूल्याङ्कन आधार कागजातमै स्पष्ट राख्नुहोस्; प्रकाशित मापदण्डबाहिरको आधारबाट मूल्याङ्कन नगर्नुहोस्।' },
  { id: 'call', name: 'बोलपत्र आह्वान', keywords: ['सूचना प्रकाशन', 'आव्हान', 'आह्वान', 'पुन: आव्हान', 'पुनः आव्हान', 'दोस्रो पटक', 'तेस्रो पटक', 'सूचना अवधि', 'म्याद', 'राष्ट्रिय स्तरको पत्रिका', 'अन्तर्राष्ट्रिय बोलपत्र'], tip: 'सूचना अवधि, प्रकाशन माध्यम, संशोधन र अन्तिम मिति लागू ऐन, नियम तथा छनोट गरिएको विधिसँग मिलाउनुहोस्।' },
  { id: 'sub', name: 'बोलपत्र दाखिला / खोल्ने', keywords: ['दाखिला', 'खामबन्दी', 'सिलबन्दी', 'बोलपत्र जमानत', 'बिड बण्ड', 'जमानत', 'ई-बिडिङ', 'e-bid', 'इ-बिडिङ', 'submission', 'खोल्ने', 'खोल्दा', 'अन्तिम मिति', 'बोलपत्र खोली'], tip: 'प्राप्ति समय, e-GP अभिलेख, फिर्ता/संशोधित प्रस्ताव, खोल्ने मुचुल्का र अधिकारप्राप्त प्रतिनिधिको विवरण सुरक्षित राख्नुहोस्।' },
  { id: 'eval', name: 'बोलपत्र परीक्षण / मूल्याङ्कन', keywords: ['परीक्षण', 'मूल्याङ्कन', 'मूल्यांकन', 'सारभूत', 'प्रभावग्राही', 'न्यूनतम मूल्याङ्कित', 'अङ्कगणितीय', 'अयोग्य', 'अनुभव', 'कारोबार', 'टर्न', 'टर्नओभर', 'संयुक्त उपक्रम', 'जे.भी', 'कर चुक्ता', 'सानातिना', 'त्रुटि', 'अख्तियारी', 'भ्याट दर्ता'], tip: 'सबै प्रस्तावमा प्रकाशित मापदण्ड समान रूपमा लागू गर्नुहोस्; सारभूत विचलन र सच्याउन मिल्ने सानातिना त्रुटि छुट्याई कारण लेख्नुहोस्।' },
  { id: 'intent', name: 'आशयको सूचना / स्वीकृति / पुनरावलोकन', keywords: ['आशयको सूचना', 'स्वीकृत', 'स्वीकृति', 'पुनरावलोकन', 'निवेदन', 'स्थगन', 'सात दिन', '७ दिन', 'सम्झौता गर्न आउन', 'अस्वीकृत', 'रद्द', 'बदर'], tip: 'आशयको सूचना, पुनरावलोकन म्याद/निवेदन र कुनै स्थगन आदेशको अवस्था जाँचेर मात्र सम्झौता अघि बढाउनुहोस्।' },
  { id: 'con', name: 'सम्झौता व्यवस्थापन', keywords: ['सम्झौता', 'कार्य सम्पादन जमानत', 'कार्यसम्पादन', 'म्याद थप', 'मूल्य समायोजन', 'भेरियसन', 'ठेक्का', 'क्षतिपूर्ति', 'पेस्की', 'भुक्तानी', 'धरौटी', 'हर्जाना', 'अन्तिम भुक्तानी', 'ठेक्का तोड', 'कालोसूची', 'कालो सूची'], tip: 'सम्झौता, स्वीकृत प्रस्ताव र लागू नियमसँग मूल्य समायोजन, भेरिएसन, म्याद थप, भुक्तानी तथा दण्डसम्बन्धी निर्णय मिलाउनुहोस्।' },
  { id: 'spec', name: 'विशेष विधि (सोझै / उपभोक्ता समिति / सिलबन्दी दरभाउपत्र आदि)', keywords: ['सोझै', 'प्रोप्राइटरी', 'उपभोक्ता समिति', 'सिलबन्दी दरभाउपत्र', 'दरभाउपत्र', 'लिज', 'एकल स्रोत', 'आकस्मिक', 'स्वदेशी उत्पादन', 'सशस्त्र', 'रासन', 'साझेदारी', 'प्रत्यक्ष', 'गैरसरकारी', 'वस्तु विनिमय', 'लिलाम', 'उपभोक्ता'], tip: 'अपवाद/विशेष विधिको कानूनी शर्त, रकम/कारणको सीमा, स्वीकृति र प्रतिस्पर्धा अभिलेखले पुष्टि गर्नुहोस्।' },
  { id: 'cons', name: 'परामर्श सेवा खरिद', keywords: ['परामर्श सेवा', 'परामर्शदाता', 'आशयपत्र', 'सङ्क्षिप्त सूची', 'संक्षिप्त सूची', 'प्रस्ताव', 'RFP', 'SRFP', 'प्राविधिक प्रस्ताव', 'आर्थिक प्रस्ताव', 'गुणस्तर', 'कन्सल्टेन्ट', 'consult', 'प्रस्तावदाता', 'वार्ता'], tip: 'ToR, छनोट विधि, प्रस्ताव मूल्याङ्कन र वार्ता लागू नमुना कागजातअनुसार चलाउनुहोस्; प्राविधिक मूल्याङ्कनअघि आर्थिक प्रस्ताव नखोल्नुहोस्।' }
];

const STOP_WORDS = new Set('र यो सो त पनि वा तथा गर्न गर्ने गरी भएको भएका भने हो हुने हुन छ छन् थियो नै लागि बमोजिम अनुसार सम्बन्धमा सम्बन्धी विषयमा मिल्ने नमिल्ने एक दुई तर कुनै के कस्तो'.split(' '));
const SUFFIX_PATTERN = /(हरूको|हरुको|हरूले|हरुले|हरूलाई|हरुलाई|हरू|हरु|लाई|बाट|मा|को|का|की|ले|मै|नै|सँग|संग)$/;
const REFERENCE_PATTERN = /(दफा|नियम)\s*([०-९]{1,3})/g;

export const tokenizeGuideText = (text: string): string[] => text
  .toLocaleLowerCase()
  .replace(/[^\u0900-\u097F\w]+/g, ' ')
  .split(/\s+/)
  .filter((word) => word.length > 1)
  .map((word) => word.length > 3 ? word.replace(SUFFIX_PATTERN, '') : word)
  .filter((word) => word.length > 1 && !STOP_WORDS.has(word));

export const extractGuideReferences = (text: string): string[] => {
  const references = new Set<string>();
  for (const match of text.matchAll(REFERENCE_PATTERN)) {
    references.add(`${match[1]} ${match[2]}`);
  }
  return [...references];
};

const getStageIds = (subject: string, text: string): string[] => {
  const stageIds = GUIDE_STAGES
  .map((stage) => {
    let score = 0;
    for (const keyword of stage.keywords) {
      if (subject.includes(keyword)) score += 3;
      score += Math.min(text.split(keyword).length - 1, 3);
    }
    return { id: stage.id, score };
  })
  .filter((stage) => stage.score >= 3)
  .sort((first, second) => second.score - first.score)
  .slice(0, 2)
  .map((stage) => stage.id);
  return stageIds.length ? stageIds : ['eval'];
};

export const prepareGuideData = (payload: GuideDataPayload) => ({
  opinions: payload.ops.map((record): GuideOpinion => {
    const text = `${record.subject} ${record.opinion}`;
    return { ...record, stageIds: getStageIds(record.subject, text), references: extractGuideReferences(text), text, tokens: tokenizeGuideText(text) };
  }),
  decisions: payload.pp.map((record): GuideDecision => {
    const text = [record.subject, record.decision, record.act, record.rule].join(' ');
    return { ...record, stageIds: getStageIds(record.subject, text), references: extractGuideReferences(text), text, tokens: tokenizeGuideText(text) };
  })
});

export const rankGuideRecords = <T extends SearchableGuideRecord>(records: T[], query: string): T[] => {
  const queryTokens = [...new Set(tokenizeGuideText(query))];
  if (!queryTokens.length) return [];

  const documentFrequency = new Map<string, number>();
  let averageLength = 0;
  for (const record of records) {
    averageLength += record.tokens.length;
    for (const token of new Set(record.tokens)) {
      documentFrequency.set(token, (documentFrequency.get(token) || 0) + 1);
    }
  }
  averageLength = averageLength / Math.max(records.length, 1);

  return records
    .map((record) => {
      const frequencies = new Map<string, number>();
      for (const token of record.tokens) frequencies.set(token, (frequencies.get(token) || 0) + 1);
      let score = 0;
      for (const token of queryTokens) {
        const frequency = frequencies.get(token) || 0;
        if (!frequency) continue;
        const count = documentFrequency.get(token) || 0;
        const inverseFrequency = Math.log(1 + (records.length - count + 0.5) / (count + 0.5));
        score += inverseFrequency * frequency * 2.2 / (frequency + 1.2 * (0.25 + 0.75 * record.tokens.length / averageLength));
      }
      const subjectTokens = tokenizeGuideText(record.text);
      if (score && queryTokens.some((token) => subjectTokens.includes(token))) score *= 1.15;
      return { record, score };
    })
    .filter((result) => result.score > 0)
    .sort((first, second) => second.score - first.score)
    .map((result) => result.record);
};