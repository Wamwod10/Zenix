// CRM Permissions
export const CRM_PERMISSIONS = {
  VIEW_CUSTOMERS: 'crm.view_customers',
  CREATE_CUSTOMER: 'crm.create_customer',
  EDIT_CUSTOMER: 'crm.edit_customer',
  DELETE_CUSTOMER: 'crm.delete_customer',
  VIEW_ANALYTICS: 'crm.view_analytics',
  VIEW_CAMPAIGNS: 'crm.view_campaigns',
};

export const checkPermission = (userPermissions, requiredPermission) => {
  return userPermissions.includes(requiredPermission);
};
