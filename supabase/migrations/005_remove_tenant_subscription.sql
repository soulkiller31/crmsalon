-- Convert any older multi-tenant/subscription schema to this single-salon installation.
-- Every DROP uses IF EXISTS so this is safe when those objects were never created.

ALTER TABLE IF EXISTS admins DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE IF EXISTS customers DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE IF EXISTS invoices DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE IF EXISTS message_templates DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE IF EXISTS message_logs DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE IF EXISTS whatsapp_sessions DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE IF EXISTS app_settings DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE IF EXISTS services DROP COLUMN IF EXISTS tenant_id CASCADE;

ALTER TABLE IF EXISTS admins DROP COLUMN IF EXISTS subscription_id;
ALTER TABLE IF EXISTS customers DROP COLUMN IF EXISTS subscription_id;
ALTER TABLE IF EXISTS invoices DROP COLUMN IF EXISTS subscription_id;
ALTER TABLE IF EXISTS message_templates DROP COLUMN IF EXISTS subscription_id;
ALTER TABLE IF EXISTS message_logs DROP COLUMN IF EXISTS subscription_id;
ALTER TABLE IF EXISTS whatsapp_sessions DROP COLUMN IF EXISTS subscription_id;
ALTER TABLE IF EXISTS app_settings DROP COLUMN IF EXISTS subscription_id;
ALTER TABLE IF EXISTS services DROP COLUMN IF EXISTS subscription_id CASCADE;

DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS tenant_subscriptions CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS workspaces CASCADE;

DELETE FROM app_settings
WHERE key IN ('subscription', 'subscription_plan', 'plan', 'billing', 'tenant_id', 'organization_id', 'workspace_id');
