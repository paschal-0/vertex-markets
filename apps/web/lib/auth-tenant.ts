const LAST_TENANT_ID_KEY = "vunex_tenant_id";
const TENANT_BY_EMAIL_PREFIX = "vunex_tenant_for_email:";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function rememberTenantForEmail(email: string, tenantId: string) {
  if (!canUseStorage()) return;
  const normalized = normalizeEmail(email);
  if (!normalized || !tenantId) return;
  window.localStorage.setItem(LAST_TENANT_ID_KEY, tenantId);
  window.localStorage.setItem(`${TENANT_BY_EMAIL_PREFIX}${normalized}`, tenantId);
}

export function getTenantForEmail(email: string): string | null {
  if (!canUseStorage()) return null;
  const normalized = normalizeEmail(email);
  if (!normalized) return null;
  return window.localStorage.getItem(`${TENANT_BY_EMAIL_PREFIX}${normalized}`);
}

export function getLastTenantId(): string | null {
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(LAST_TENANT_ID_KEY);
}
