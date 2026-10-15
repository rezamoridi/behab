// src/services/api/permissionApi.js
import apiClient from './apiClient';

const ADMIN_BASE = '/admin';

// ═══════════════════════════════════════════════════════════
// RolePolicy API
// ═══════════════════════════════════════════════════════════
export const rolePolicyApi = {
  list: async () => {
    const response = await apiClient.get(
      `${ADMIN_BASE}/role-policies`,
    );
    return response.data;
  },

  get: async (role) => {
    if (!role) throw new Error('نقش معتبر نیست');
    const response = await apiClient.get(
      `${ADMIN_BASE}/role-policies/${role}`,
    );
    return response.data;
  },

  update: async (role, data) => {
    if (!role) throw new Error('نقش معتبر نیست');
    const response = await apiClient.put(
      `${ADMIN_BASE}/role-policies/${role}`,
      data,
    );
    return response.data;
  },
};

// ═══════════════════════════════════════════════════════════
// UserPermissionGrant API
// ═══════════════════════════════════════════════════════════
export const userGrantApi = {
  list: async ({
    includeRevoked = false,
    granteeUserId = null,
    resourceType = null,
    resourceId = null,
  } = {}) => {
    const params = new URLSearchParams();
    if (includeRevoked) params.append('include_revoked', 'true');
    if (granteeUserId != null)
      params.append('grantee_user_id', String(granteeUserId));
    if (resourceType) params.append('resource_type', resourceType);
    if (resourceId) params.append('resource_id', resourceId);

    const response = await apiClient.get(
      `${ADMIN_BASE}/user-grants${
        params.toString() ? `?${params}` : ''
      }`,
    );
    return response.data;
  },

  create: async ({
    granteeUserId,
    resourceType,
    resourceId,
    permissions,
    reason = null,
    expiresAt = null,
  }) => {
    const response = await apiClient.post(
      `${ADMIN_BASE}/user-grants`,
      {
        grantee_user_id: granteeUserId,
        resource_type: resourceType,
        resource_id: String(resourceId),
        permissions,
        reason,
        expires_at: expiresAt,
      },
    );
    return response.data;
  },

  revoke: async (grantId, reason = null) => {
    if (!grantId) throw new Error('شناسه معتبر نیست');
    const params = new URLSearchParams();
    if (reason) params.append('reason', reason);

    const response = await apiClient.delete(
      `${ADMIN_BASE}/user-grants/${grantId}${
        params.toString() ? `?${params}` : ''
      }`,
    );
    return response.data;
  },

  checkAccess: async ({ userId, farmId, action = 'view' }) => {
    const params = new URLSearchParams({
      user_id: String(userId),
      farm_id: farmId,
      action,
    });

    const response = await apiClient.get(
      `${ADMIN_BASE}/user-grants/check-access?${params}`,
    );
    return response.data;
  },
};

// ═══════════════════════════════════════════════════════════
// Combined
// ═══════════════════════════════════════════════════════════
export const permissionApi = {
  rolePolicy: rolePolicyApi,
  userGrant: userGrantApi,
};

export default permissionApi;