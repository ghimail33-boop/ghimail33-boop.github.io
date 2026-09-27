const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

export function toNepaliDigits(value: number | string): string {
  return String(value).replace(/[0-9]/g, (digit) => nepaliDigits[Number(digit)]);
}

export function formatNepaliNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '०';

  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return toNepaliDigits(String(value));

  return toNepaliDigits(
    numberValue.toLocaleString('en-US', { maximumFractionDigits: 2 }),
  );
}
