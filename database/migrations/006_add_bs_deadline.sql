-- Preserve the exact Nepali date selected in the finding form.
ALTER TABLE corrective_actions
ADD COLUMN IF NOT EXISTS deadline_bs VARCHAR(10);