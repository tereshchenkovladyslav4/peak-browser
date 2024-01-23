import { NavigationMenuItem } from '../../resources/models/navigation-menu-item';
import { NavigationMenuType } from '../../resources/enums/navigation-menu-type.enum';
import { NavigationImageType } from '../../resources/enums/navigation-image-type.enum';
import { NAVIGATION_ROUTES } from '../../resources/constants/app-routes';
import { AclRole } from '../../resources/enums/acl-role.enum';
import { PermissionKey } from '../../resources/enums/permission-key.enum';

export const DEFAULT_NAV_ITEMS: NavigationMenuItem[] = [
  {
    title: 'Home',
    image: NavigationImageType.HOME,
    navType: NavigationMenuType.route,
    navValue: NAVIGATION_ROUTES.home,
  },
  {
    title: 'Assignments',
    image: NavigationImageType.ASSIGNMENTS,
    navType: NavigationMenuType.route,
    navValue: NAVIGATION_ROUTES.assignments,
  },
  {
    title: 'Libraries',
    image: NavigationImageType.LIBRARY,
    navType: NavigationMenuType.route,
    navValue: NAVIGATION_ROUTES.libraries,
  },
  {
    title: 'Live Events',
    image: NavigationImageType.EVENT,
    navType: NavigationMenuType.route,
    navValue: NAVIGATION_ROUTES.liveEvents,
    roles: [AclRole.NotPinnacleLite],
  },
  {
    title: 'Work Groups',
    image: NavigationImageType.WORK_GROUP,
    navType: NavigationMenuType.route,
    navValue: NAVIGATION_ROUTES.workGroups,
    roles: [AclRole.NotPinnacleLite],
  },
  {
    title: 'Bookmarks',
    image: NavigationImageType.BOOKMARK,
    navType: NavigationMenuType.route,
    navValue: NAVIGATION_ROUTES.bookmarks,
  },
  {
    title: 'My Documents',
    image: NavigationImageType.DOCUMENT,
    navType: NavigationMenuType.route,
    navValue: NAVIGATION_ROUTES.myDocuments,
  },
];

const manageAssignments: NavigationMenuItem = {
  title: 'Assignments',
  image: NavigationImageType.MANAGE_ASSIGNMENT,
  navType: NavigationMenuType.none,
  isManagement: true,
  navValue: '',
  roles: [AclRole.NotPinnacleLite],
  permission: `${PermissionKey.DB_ASSIGNOR}|${PermissionKey.DB_ENROLL_LP}`,
  children: [
    {
      title: 'Assignment Management',
      image: null,
      navType: NavigationMenuType.route,
      navValue: NAVIGATION_ROUTES.manage.assignments.assignments,
      isManagement: true,
    },
    {
      title: 'Auto Assignments',
      image: null,
      navType: NavigationMenuType.route,
      navValue: NAVIGATION_ROUTES.manage.assignments.autoAssignments,
      isManagement: true,
    },
  ],
};

const manageContent: NavigationMenuItem = {
  title: 'Content',
  image: NavigationImageType.CONTENT,
  navType: NavigationMenuType.route,
  navValue: NAVIGATION_ROUTES.manage.content,
  isManagement: true,
  roles: [AclRole.NotPinnacleLite],
  permission: `${PermissionKey.DB_PROCESS_AUTHOR}|${PermissionKey.DB_CONTENT_PUBLISHER}|${PermissionKey.DB_CONTENT_AUTHOR}`,
};

const manageLiveEvents: NavigationMenuItem = {
  title: 'Live Events',
  image: NavigationImageType.MANAGE_EVENT,
  navType: NavigationMenuType.route,
  navValue: NAVIGATION_ROUTES.manage.liveEvents,
  isManagement: true,
  roles: [AclRole.NotPinnacleLite],
  permission: `${PermissionKey.DB_ASSIGNOR}|${PermissionKey.DB_ENROLL_LP}`,
};

const manageLibraries: NavigationMenuItem = {
  title: 'Libraries',
  image: NavigationImageType.MANAGE_LIBRARY,
  navType: NavigationMenuType.route,
  navValue: NAVIGATION_ROUTES.manage.libraries,
  isManagement: true,
  roles: [AclRole.NotPinnacleLite],
  permission: `${PermissionKey.DB_PROCESS_AUTHOR}|${PermissionKey.DB_CONTENT_PUBLISHER}`,
};

const manageWorkGroups: NavigationMenuItem = {
  title: 'Work Groups',
  image: NavigationImageType.MANAGE_WORK_GROUP,
  navType: NavigationMenuType.route,
  navValue: NAVIGATION_ROUTES.manage.workGroups,
  isManagement: true,
  roles: [AclRole.NotPinnacleLite],
  permission: `${PermissionKey.DB_WORKGROUP_ADMIN}`,
};

const manageReporting: NavigationMenuItem = {
  title: 'Reporting',
  image: NavigationImageType.REPORTING,
  navType: NavigationMenuType.route,
  navValue: NAVIGATION_ROUTES.manage.reporting,
  isManagement: true,
  roles: [AclRole.NotPinnacleLite],
  // TODO - Must work out the permissions for managing reporting
  // permission: `${PermissionKey.DB_WORKGROUP_ADMIN}`,
};

const manageExternalLearning: NavigationMenuItem = {
  title: 'External Learning',
  image: NavigationImageType.EXTERNAL_LEARNING,
  navType: NavigationMenuType.none,
  isManagement: true,
  navValue: '',
  roles: [AclRole.NotPinnacleLite],
  permission: `${PermissionKey.DB_ASSIGNOR}|${PermissionKey.DB_ENROLL_LP}`,
  children: [
    {
      title: 'Records Management',
      image: null,
      navType: NavigationMenuType.route,
      navValue: NAVIGATION_ROUTES.manage.externalLearning.records,
      isManagement: true,
    },
    {
      title: 'Setup',
      image: null,
      navType: NavigationMenuType.route,
      navValue: NAVIGATION_ROUTES.manage.externalLearning.setup,
      isManagement: true,
    },
  ],
};

const manageUsers: NavigationMenuItem = {
  title: 'Users',
  image: NavigationImageType.USER,
  navType: NavigationMenuType.route,
  navValue: NAVIGATION_ROUTES.manage.users,
  isManagement: true,
  roles: [AclRole.NotPinnacleLite],
  permission: `${PermissionKey.DB_ADMIN}`,
};

const manageGroups: NavigationMenuItem = {
  title: 'Groups',
  image: NavigationImageType.MANAGE_GROUP,
  navType: NavigationMenuType.route,
  navValue: NAVIGATION_ROUTES.manage.groups,
  isManagement: true,
  roles: [AclRole.NotPinnacleLite],
  permission: `${PermissionKey.DB_ADMIN}`,
};

const manageBranding: NavigationMenuItem = {
  title: 'Theme Customization',
  image: NavigationImageType.BRANDING,
  navType: NavigationMenuType.route,
  navValue: NAVIGATION_ROUTES.manage.branding,
  isManagement: true,
  roles: [AclRole.NotPinnacleLite],
  permission: `${PermissionKey.DB_MANAGE_BRANDING}`,
};

const manageKS: NavigationMenuItem = {
  title: 'KnowledgeSmart Admin',
  image: NavigationImageType.KNOWLEDGE_SMART,
  navType: NavigationMenuType.route,
  navValue: NAVIGATION_ROUTES.manage.knowledgeSmart,
  isManagement: true,
  roles: [AclRole.NotPinnacleLite],
  permission: `${PermissionKey.DB_ADMIN}`,
};

const manageSettings: NavigationMenuItem = {
  title: 'Settings',
  image: NavigationImageType.SETTINGS,
  navType: NavigationMenuType.none,
  isManagement: true,
  roles: [AclRole.NotPinnacleLite],
  permission: `${PermissionKey.DB_ADMIN}`,
  children: [
    {
      title: 'General',
      image: null,
      navType: NavigationMenuType.route,
      navValue: NAVIGATION_ROUTES.manage.settings.general,
      isManagement: true,
    },
    {
      title: 'Users',
      image: null,
      navType: NavigationMenuType.route,
      navValue: NAVIGATION_ROUTES.manage.settings.users,
      isManagement: true,
    },
    {
      title: 'Groups',
      image: null,
      navType: NavigationMenuType.route,
      navValue: NAVIGATION_ROUTES.manage.settings.groups,
      isManagement: true,
    },
  ],
};

const manageSecurity: NavigationMenuItem = {
  title: 'Security & Authentication',
  image: NavigationImageType.SECURITY,
  navType: NavigationMenuType.route,
  navValue: NAVIGATION_ROUTES.manage.security,
  isManagement: true,
  roles: [AclRole.NotPinnacleLite],
  permission: `${PermissionKey.DB_ADMIN}`,
};

const manageIntegrations: NavigationMenuItem = {
  title: 'Integrations',
  image: NavigationImageType.INTEGRATION,
  navType: NavigationMenuType.route,
  navValue: NAVIGATION_ROUTES.manage.integrations,
  isManagement: true,
  roles: [AclRole.NotPinnacleLite],
  permission: `${PermissionKey.DB_ADMIN}`,
};

const manageSubscriptions: NavigationMenuItem = {
  title: 'Subscriptions',
  image: NavigationImageType.SUBSCRIPTION,
  navType: NavigationMenuType.route,
  navValue: NAVIGATION_ROUTES.manage.subscriptions,
  isManagement: true,
  roles: [AclRole.NotPinnacleLite],
  permission: `${PermissionKey.DB_ADMIN}`,
};

const manageUsersLite: NavigationMenuItem = {
  title: 'Users',
  image: NavigationImageType.USER,
  navType: NavigationMenuType.route,
  // TODO Add the route for the Pinnacle lite user management
  // navValue: NAVIGATION_ROUTES.manage.users, // <-- route to regular Pinnacle Users (different from Pinnacle Lite Users)
  isManagement: true,
  roles: [AclRole.PinnacleLite],
  permission: `${PermissionKey.DB_ADMIN}`,
};

export function getManagementNavItems(showKS: boolean) {
  const managementItems: NavigationMenuItem[] = [];

  managementItems.push(manageAssignments);
  managementItems.push(manageContent);
  managementItems.push(manageLiveEvents);
  managementItems.push(manageLibraries);
  managementItems.push(manageWorkGroups);
  managementItems.push(manageReporting);
  managementItems.push(manageExternalLearning);
  managementItems.push(manageUsers);
  managementItems.push(manageGroups);
  managementItems.push(manageBranding);
  if (showKS) {
    managementItems.push(manageKS);
  }
  managementItems.push(manageSettings);
  managementItems.push(manageSecurity);
  managementItems.push(manageIntegrations);
  managementItems.push(manageSubscriptions);
  managementItems.push(manageUsersLite);

  return managementItems;
}
