-- शब्दावली एकरूपता: 'अनुपालन' को सबै रूपलाई 'परिपालन' मा रूपान्तरण।
-- पहिले सुरक्षित भइसकेका compliance_status मानहरू अद्यावधिक गरिन्छ,
-- त्यसैले server र frontend को नयाँ तुलना ('परिपालन' आदि) सँग डाटा मिल्छ।
UPDATE inspection_checklist_results
SET compliance_status = 'परिपालन',
    updated_at = CURRENT_TIMESTAMP
WHERE compliance_status = 'अनुपालन';

UPDATE inspection_checklist_results
SET compliance_status = 'आंशिक परिपालन',
    updated_at = CURRENT_TIMESTAMP
WHERE compliance_status = 'आंशिक अनुपालन';

UPDATE inspection_checklist_results
SET compliance_status = 'परिपालन नभएको',
    updated_at = CURRENT_TIMESTAMP
WHERE compliance_status = 'अनुपालन नभएको';
