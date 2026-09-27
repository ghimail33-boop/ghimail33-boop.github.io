-- Seed data uses explicit IDs; align PostgreSQL sequences before new inserts.
SELECT setval(pg_get_serial_sequence('roles', 'id'), COALESCE(MAX(id), 0) + 1, FALSE) FROM roles;
SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE(MAX(id), 0) + 1, FALSE) FROM users;
SELECT setval(pg_get_serial_sequence('offices', 'id'), COALESCE(MAX(id), 0) + 1, FALSE) FROM offices;
SELECT setval(pg_get_serial_sequence('provinces', 'id'), COALESCE(MAX(id), 0) + 1, FALSE) FROM provinces;
SELECT setval(pg_get_serial_sequence('districts', 'id'), COALESCE(MAX(id), 0) + 1, FALSE) FROM districts;
SELECT setval(pg_get_serial_sequence('municipalities', 'id'), COALESCE(MAX(id), 0) + 1, FALSE) FROM municipalities;
SELECT setval(pg_get_serial_sequence('ministries', 'id'), COALESCE(MAX(id), 0) + 1, FALSE) FROM ministries;
SELECT setval(pg_get_serial_sequence('fiscal_years', 'id'), COALESCE(MAX(id), 0) + 1, FALSE) FROM fiscal_years;
SELECT setval(pg_get_serial_sequence('procurements', 'id'), COALESCE(MAX(id), 0) + 1, FALSE) FROM procurements;
SELECT setval(pg_get_serial_sequence('checklist_stages', 'id'), COALESCE(MAX(id), 0) + 1, FALSE) FROM checklist_stages;
SELECT setval(pg_get_serial_sequence('checklist_items', 'id'), COALESCE(MAX(id), 0) + 1, FALSE) FROM checklist_items;
SELECT setval(pg_get_serial_sequence('inspections', 'id'), COALESCE(MAX(id), 0) + 1, FALSE) FROM inspections;
SELECT setval(pg_get_serial_sequence('findings', 'id'), COALESCE(MAX(id), 0) + 1, FALSE) FROM findings;
SELECT setval(pg_get_serial_sequence('corrective_actions', 'id'), COALESCE(MAX(id), 0) + 1, FALSE) FROM corrective_actions;
SELECT setval(pg_get_serial_sequence('evidence_files', 'id'), COALESCE(MAX(id), 0) + 1, FALSE) FROM evidence_files;
SELECT setval(pg_get_serial_sequence('audit_logs', 'id'), COALESCE(MAX(id), 0) + 1, FALSE) FROM audit_logs;