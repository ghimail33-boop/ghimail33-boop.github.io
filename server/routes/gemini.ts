import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

const router = Router();

// System prompt giving the assistant the authoritative role of NVC Procurement Compliance Specialist
const NVC_SYSTEM_INSTRUCTION = `तपाईं नेपाल सरकार, राष्ट्रिय सतर्कता केन्द्र (National Vigilance Centre - NVC), सिंहदरबारको "सार्वजनिक खरिद अनुगमन तथा प्राविधिक निरीक्षण परामर्शदाता" (Public Procurement Compliance & Technical Audit AI Assistant) हुनुहुन्छ।

तपाईंको मुख्य उद्देश्य:
१. सार्वजनिक खरिद ऐन, २०६३ (संशोधन सहित) र सार्वजनिक खरिद नियमावली, २०६४ (१३औं संशोधन सम्म) अनुसार सरकारी निकाय, खरिद अधिकृत, इन्जिनियर, प्राविधिक परीक्षक, निर्माण व्यवसायी र सचेत नागरिकहरूलाई कानुनी, प्राविधिक र प्रक्रियागत परामर्श उपलब्ध गराउनु।
२. राष्ट्रिय सतर्कता केन्द्रको ३४-चरण सार्वजनिक खरिद प्रक्रिया र १८०-बुँदे प्राविधिक निरीक्षण चेकलिस्ट (चरण १ देखि ३४ सम्म) मा आधारित भएर परीक्षण, कागजात प्रमाणीकरण र कैफियत पहिचानमा मार्गदर्शन दिनु।

तपाईंको ज्ञानको मुख्य क्षेत्रहरू:
- ३४ चरण खरिद प्रक्रिया: खरिद योजना (चरण १), गुरुयोजना, लागत अनुमान तयारी (चरण ९), बोलपत्र कागजात स्वीकृति (चरण ११), सूचना प्रकाशन (चरण १२), प्रि-बिड बैठक (चरण १३), बोलपत्र दर्ता र खोल्ने (चरण १६-१७), प्राविधिक तथा आर्थिक मूल्याङ्कन (चरण १८-२१), आशयको सूचना (Letter of Intent - चरण २२), सम्झौता (चरण २६), पेश्की भुक्तानी (चरण २८), गुणस्तर नियन्त्रण र ल्याब टेस्ट (चरण २९), भेरिएसन (Variation Order - चरण ३०), म्याद थप (चरण ३१), बिल भुक्तानी (चरण ३२), हस्तान्तरण र अन्तिम फरफारक (चरण ३३-३४)।
- खरिद विधि र सीमा:
  * सोझै खरिद (Direct Purchase): ५ लाख वा १० लाख (विशिष्ट अवस्था) सम्म।
  * सिलबन्दी दरभाउ (Sealed Quotation): २० लाख रुपैयाँ सम्म।
  * राष्ट्रिय स्तरको खुला बोलपत्र (NCB): २० लाख रुपैयाँ भन्दा माथि।
  * अन्तर्राष्ट्रिय स्तरको खुला बोलपत्र (ICB): ५ अर्ब रुपैयाँ भन्दा माथि (निर्माण कार्यका लागि)।
  * उपभोक्ता समिति (Users Committee): १ करोड रुपैयाँ सम्मको लागत अनुमान भएको श्रममूलक कार्य (उपकरणको प्रयोग बाहेक)।
- कानुनी दफा र नियम: PPA 2063 का दफाहरू (जस्तै: दफा ५ लागत अनुमान, दफा ६ खरिद योजना, दफा १५ बोलपत्र योग्यता, दफा २७ सम्झौता, दफा ५२ भेरिएसन) र PPR 2064 का नियमहरू (जस्तै: नियम ७० मूल्याङ्कन, नियम ११० सम्झौता, नियम ११२ कार्यसम्पादन जमानत, नियम ११८ भेरिएसन, नियम १२० म्याद थप)।
- धरौटी र जमानत: बिड सेक्युरिटी (२ देखि ३ प्रतिशत), कार्यसम्पादन जमानत (Performance Security - ५ प्रतिशत, असामान्य कम कबोलमा थप धरौटी)।

प्रस्तुतीकरण शैली:
- जवाफ नेपाली भाषामा आधिकारिक, विनम्र, स्पष्ट र बुँदागत (Bullet Points) रूपमा दिनुहोस्। आवश्यक परे कानुनी दफा र नियमावलीका नियमहरू उद्धृत गर्नुहोस्।
- यदि प्रयोगकर्ताले अंग्रेजीमा प्रश्न सोधेमा अंग्रेजीमै जवाफ दिनुहोस्।
- संवेदनशील वा कानुनी विवादित विषयहरूमा सार्वजनिक खरिद अनुगमन कार्यालय (PPMO) वा राष्ट्रिय सतर्कता केन्द्रको आधिकारिक निर्देशन लिन समेत सल्लाह दिनुहोस्।`;

function buildLocalFallbackReply(prompt: string, context?: string) {
  const normalizedPrompt = prompt.toLowerCase();
  const stageContext = context ? `\n\nसन्दर्भ: ${context}` : '';

  if (prompt.includes('सम्बन्धित स्रोत-अंश:')) {
    const sourceExcerpt = prompt
      .split('सम्बन्धित स्रोत-अंश:')[1]
      ?.split('\n\nलागू संशोधनसहितको')[0]
      ?.trim();
    if (sourceExcerpt && !sourceExcerpt.includes('अहिले चयन गरिएको सारांश उपलब्ध छैन')) {
      return `**संलग्न राय/निर्णय सन्दर्भ**\n${sourceExcerpt}\n\nयो स्रोतमा उल्लिखित तथ्यविशेषको सार हो; हाल लागू ऐन, नियमावली र खरिद कागजातसँग मिलाएर मात्र निर्णय गर्नुहोस्।${stageContext}`;
    }
  }

  if (normalizedPrompt.includes('धरौटी') || normalizedPrompt.includes('performance security') || normalizedPrompt.includes('bid security')) {
    return `**धरौटी / जमानत**\n- बिड सेक्युरिटी सामान्यतया **२–३%** को दरमा रहने र बोलीदाता/प्रदायकको बोलीद्वारा निर्धारण हुने मानदण्डमा आधारित हुन्छ।\n- Performance Security / कार्यसम्पादन जमानत सामान्यतया **५%** हुन सक्छ।\n- यदि कार्यमूल्य वा प्राविधिक जोखिम बढी छ भने अधिक सुरक्षा माग गर्न सकिन्छ।${stageContext}`;
  }

  if (normalizedPrompt.includes('म्याद थप') || normalizedPrompt.includes('time extension') || normalizedPrompt.includes('extension')) {
    return `**म्याद थप**\n- म्याद थप सामान्यतया **नियमानुसार योग्य कारण** हुँदा गरिन्छ, जस्तै मौसम, सामग्री आपूर्ति दिगो हुनु, छुट्टी, अथवा फर्म/प्रदायकको कारणले बाधा परे।\n- थप म्यादको लागि **सक्षम निकायको लिखित स्वीकृति** आवश्यक हुन्छ।\n- म्याद थपले सम्झौतामा लगाएको समय र लागतको पुनर्रचना गर्न सक्दैन, यदि नियममा स्पष्ट आधार नहुँदैन भने सावधानी अपनाउनुहोस्।${stageContext}`;
  }

  if (normalizedPrompt.includes('सिलबन्दी') || normalizedPrompt.includes('sealed quotation') || normalizedPrompt.includes('quotation')) {
    return `**सिलबन्दी दरभाउ / Sealed Quotation**\n- सामान्यतया **२० लाख रुपैयाँसम्म**को लागतमा यस विधि प्रयोग गर्न सकिन्छ।\n- यो विधि मुख्यतया साना र सरल वस्तु, सेवा वा काममा प्रयोग गरिन्छ।\n- बोलपत्र खोल्ने, मूल्याङ्कन र योग्यताको जाँचमा नियम र शर्तहरूको पालना गर्नुपर्छ।${stageContext}`;
  }

  if (normalizedPrompt.includes('३४') || normalizedPrompt.includes('चरण') || normalizedPrompt.includes('checklist')) {
    return `**३४-चरण खरिद प्रक्रिया**\n- खरिद योजना र लागत अनुमानको तयारीदेखि शुरू भएर, बोलपत्र प्रकाशन, बिड खुल्ने, मूल्याङ्कन, आशय सूचना, सम्झौता, कार्य सम्पादन, बिल भुक्तानी, र अन्तिम फरफारकसम्मको प्रक्रिया समावेश हुन्छ।\n- मुख्य प्रस्तुतिकरणको आधारमा चरण ९ (लागत अनुमान), चरण १८–२१ (मूल्याङ्कन), चरण २२ (आशयको सूचना), चरण ३० (भेरिएसन), चरण ३१ (म्याद थप) जस्ता चरणहरूमा विशेष ध्यान दिनुपर्छ।${stageContext}`;
  }

  if (normalizedPrompt.includes('भेरिएसन') || normalizedPrompt.includes('variation order')) {
    return `**भेरिएसन अर्डर / Variation Order**\n- कार्यको दायरा, मात्रा वा शर्तमा परिवर्तन आउँदा **भेरिएसन आदेश** जारी गर्न सकिन्छ।\n- यसमा प्रायः सहमति, लागत प्रभाव, र समय प्रभावको मूल्याङ्कन आवश्यक हुन्छ।\n- स्वीकृति सहजतापूर्वक गर्न नपर्ने; नियम अनुसार अधिकार र सीमाहरू जाँच्नुहोस्।${stageContext}`;
  }

  return `**सार्वजनिक खरिद परामर्श**\n- सार्वजनिक खरिद ऐन, नियमावली र ३४-चरण चेकलिस्टको आधारमा प्रक्रियागत र कानूनी मार्गदर्शन दिनुहोस्।\n- यस समय Gemini API कन्फिगरेशन उपलब्ध नभएकोले स्थानीय पूर्वपरिभाषित नक्कल-रूप उत्तर दिइएको छ।\n- वास्तविक API प्रयोग गर्न **GEMINI_API_KEY** सेट गरिसकेपछि सहायक स्वतः सच्याइनेछ।\n- यदि तपाईंकहाँ विशेष चरण, विधि, म्याद, धरौटी वा भेरिएसनबारे प्रश्न छ भने त्यो प्रश्न फेरि सोध्नुहोस्।${stageContext}`;
}

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
  if (!apiKey) {
    return null;
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { messages, mode = 'general', context } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const lastUserMessage = [...messages].reverse().find((m: { role?: string; content?: string }) =>
      (m.role === 'user' || m.role === 'model') && typeof m.content === 'string' && m.content.trim()
    );
    const promptText = lastUserMessage?.content || 'सार्वजनिक खरिद सम्बन्धी परामर्श';

    let modelName = 'gemini-2.5-flash';
    if (mode === 'fast') {
      modelName = 'gemini-2.5-flash-lite';
    } else if (mode === 'complex') {
      modelName = 'gemini-2.5-pro';
    }

    const ai = getAiClient();
    if (!ai) {
      return res.json({
        reply: buildLocalFallbackReply(promptText, context),
        model: 'local-fallback',
        timestamp: new Date().toISOString(),
      });
    }

    // Enrich system instruction with any page or stage context
    let enrichedSystemInstruction = NVC_SYSTEM_INSTRUCTION;
    if (context && typeof context === 'string') {
      enrichedSystemInstruction += `\n\n[हालको पृष्ठ सन्दर्भ (Current Page Context)]: ${context}`;
    }

    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction: enrichedSystemInstruction,
        temperature: 0.6,
      },
    });

    const reply = response.text || 'माफ गर्नुहोस्, प्रतिक्रिया उत्पन्न हुन सकेन। कृपया पुनः प्रयास गर्नुहोस्।';

    return res.json({
      reply,
      model: modelName,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[GEMINI ROUTE ERROR]', error);

    const errorMessage = error?.message || '';
    const fallback = buildLocalFallbackReply(
      Array.isArray(req.body?.messages)
        ? req.body.messages.map((m: { content?: string }) => m?.content || '').join('\n')
        : 'सार्वजनिक खरिद परामर्श',
      req.body?.context
    );

    if (errorMessage.includes('API_KEY') || errorMessage.includes('key')) {
      return res.json({
        error: 'Gemini API Key missing or invalid.',
        reply: fallback,
        model: 'local-fallback',
        timestamp: new Date().toISOString(),
      });
    }

    return res.json({
      error: 'Failed to generate response from Gemini API.',
      details: errorMessage,
      reply: fallback,
      model: 'local-fallback',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
