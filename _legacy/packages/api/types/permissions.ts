export interface UsersPermissionScope {
  view: boolean;
  edit: boolean;
  delete: boolean;
}

export interface UsersPermissionsNode {
  any: UsersPermissionScope;
  own: UsersPermissionScope;
}

export interface MediaPermissionScope {
  create: boolean;
  update: boolean;
  view: boolean;
  delete: boolean;
}

export interface MediaPermissionsNode {
  any: MediaPermissionScope;
  own: MediaPermissionScope;
}

export interface LandingsPermissionScope {
  view: boolean;
  edit: boolean;
  delete: boolean;
}

export interface LandingsPermissionsNode {
  create: boolean;
  any: LandingsPermissionScope;
  own: LandingsPermissionScope;
}

export interface AnalyticsViewPermission {
  view: boolean;
}

export interface PaymentsScope {
  view: boolean;
}

export interface PaymentsPermissionsNode {
  any: PaymentsScope;
  own: PaymentsScope;
}

export interface SubscriptionsScope {
  view: boolean;
  manage: boolean;
}

export interface SubscriptionsPermissionsNode {
  any: SubscriptionsScope;
  own: SubscriptionsScope;
}

export interface FeedbackPermissionsNode {
  view: boolean;
}

export interface BonusHistoryScope {
  view: boolean;
}

export interface BonusHistoryPermissions {
  any: BonusHistoryScope;
  own: BonusHistoryScope;
}

export interface BonusPermissionsNode {
  history: BonusHistoryPermissions;
  adjust: boolean;
}

export interface EmailPermissionsNode {
  one: boolean;
  broadcast: boolean;
}

export interface Permissions {
  users: UsersPermissionsNode;
  media: MediaPermissionsNode;
  landings: LandingsPermissionsNode;
  analitycs_traffic: AnalyticsViewPermission;
  analitycs_business: AnalyticsViewPermission;
  payments: PaymentsPermissionsNode;
  subscriptions: SubscriptionsPermissionsNode;
  feedback: FeedbackPermissionsNode;
  bonus: BonusPermissionsNode;
  email: EmailPermissionsNode;
}
