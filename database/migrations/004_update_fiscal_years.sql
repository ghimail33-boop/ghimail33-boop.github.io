-- Keep fiscal-year options aligned with the current Nepali fiscal years.
UPDATE fiscal_years
SET name = '२०८२/८३', is_current = FALSE
WHERE id = 1;

UPDATE fiscal_years
SET name = '२०८३/८४', is_current = FALSE
WHERE id = 2;

UPDATE fiscal_years
SET name = '२०८४/८५', is_current = TRUE
WHERE id = 3;
