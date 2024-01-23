const ROUTE_SEGMENT = {
  login: 'login',
  search: 'search',
  home: 'home',
  assignments: 'assignments',
  libraries: 'libraries',
  liveEvents: 'live-events',
  workGroups: 'workgroups',
  bookmarks: 'bookmarks',
  myDocuments: 'my-documents',
  manage: 'manage',
  assignmentManagement: 'assignments-management',
  autoAssignments: 'auto-assignments',
  content: 'content',
  reporting: 'reporting',
  externalLearning: 'external-learning',
  records: 'records',
  setup: 'setup',
  users: 'users',
  branding: 'branding',
  knowledgeSmart: 'ks',
  settings: 'settings',
  general: 'general',
  groups: 'groups',
  security: 'security',
  integrations: 'integrations',
  subscriptions: 'subscriptions',
  profile: 'profile'
}

export const APP_ROUTES = {
  login: `${ROUTE_SEGMENT.login}`,
  search: `${ROUTE_SEGMENT.search}`,
  content: `${ROUTE_SEGMENT.content}`,
  home: `${ROUTE_SEGMENT.home}`,
  assignments: `${ROUTE_SEGMENT.assignments}`,
  libraries: `${ROUTE_SEGMENT.libraries}`,
  liveEvents: `${ROUTE_SEGMENT.liveEvents}`,
  workGroups: `${ROUTE_SEGMENT.workGroups}`,
  bookmarks: `${ROUTE_SEGMENT.bookmarks}`,
  myDocuments: `${ROUTE_SEGMENT.myDocuments}`,
  profile: `${ROUTE_SEGMENT.profile}`,
  manage: {
    assignments: {
      assignments: `${ROUTE_SEGMENT.manage}/${ROUTE_SEGMENT.assignments}/${ROUTE_SEGMENT.assignmentManagement}`,
      autoAssignments: `${ROUTE_SEGMENT.manage}/${ROUTE_SEGMENT.assignments}/${ROUTE_SEGMENT.autoAssignments}`
    },
    content: `${ROUTE_SEGMENT.manage}/${ROUTE_SEGMENT.content}`,
    liveEvents: `${ROUTE_SEGMENT.manage}/${ROUTE_SEGMENT.liveEvents}`,
    libraries: `${ROUTE_SEGMENT.manage}/${ROUTE_SEGMENT.libraries}`,
    workGroups: `${ROUTE_SEGMENT.manage}/${ROUTE_SEGMENT.workGroups}`,
    reporting: `${ROUTE_SEGMENT.manage}/${ROUTE_SEGMENT.reporting}`,
    externalLearning: {
      records: `${ROUTE_SEGMENT.manage}/${ROUTE_SEGMENT.externalLearning}/${ROUTE_SEGMENT.records}`,
      setup: `${ROUTE_SEGMENT.manage}/${ROUTE_SEGMENT.externalLearning}/${ROUTE_SEGMENT.setup}`,
    },
    users: `${ROUTE_SEGMENT.manage}/${ROUTE_SEGMENT.users}`,
    groups: `${ROUTE_SEGMENT.manage}/${ROUTE_SEGMENT.groups}`,
    branding: `${ROUTE_SEGMENT.manage}/${ROUTE_SEGMENT.branding}`,
    knowledgeSmart: `${ROUTE_SEGMENT.manage}/${ROUTE_SEGMENT.knowledgeSmart}`,
    settings: {
      general: `${ROUTE_SEGMENT.manage}/${ROUTE_SEGMENT.settings}/${ROUTE_SEGMENT.general}`,
      users: `${ROUTE_SEGMENT.manage}/${ROUTE_SEGMENT.settings}/${ROUTE_SEGMENT.users}`,
      groups: `${ROUTE_SEGMENT.manage}/${ROUTE_SEGMENT.settings}/${ROUTE_SEGMENT.groups}`,
    },
    security: `${ROUTE_SEGMENT.manage}/${ROUTE_SEGMENT.security}`,
    integrations: `${ROUTE_SEGMENT.manage}/${ROUTE_SEGMENT.integrations}`,
    subscriptions: `${ROUTE_SEGMENT.manage}/${ROUTE_SEGMENT.subscriptions}`,
  }
};

// Prefixes route string with a '/' - for use with routerLink or router.navigate()
export const NAVIGATION_ROUTES = routeMapper(APP_ROUTES, (s) => `/${s}`);

// Removes 'manage/' prefix - for use in child routing module
export const APP_ROUTES_MANAGE = routeMapper(APP_ROUTES.manage, (s) => s.replace('manage/', ''));

// Used in page titles
export const ROUTE_TITLE_MAP = {
  // GENERAL
  [NAVIGATION_ROUTES.home]: 'Home',
  [NAVIGATION_ROUTES.assignments]: 'Assignments',
  [NAVIGATION_ROUTES.libraries]: 'Libraries',
  [NAVIGATION_ROUTES.liveEvents]: 'Live Events',
  [NAVIGATION_ROUTES.workGroups]: 'Work Groups',
  [NAVIGATION_ROUTES.bookmarks]: 'Bookmarks',
  [NAVIGATION_ROUTES.myDocuments]: 'My Documents',
  [NAVIGATION_ROUTES.content]: 'Content',
  [NAVIGATION_ROUTES.profile]: 'My Account',

  // MANAGE
  [NAVIGATION_ROUTES.manage.assignments.assignments]: 'Manage Assignments',
  [NAVIGATION_ROUTES.manage.assignments.autoAssignments]: 'Auto Assignments',
  [NAVIGATION_ROUTES.manage.content]: 'Manage Content',
  [NAVIGATION_ROUTES.manage.liveEvents]: 'Manage Live Events',
  [NAVIGATION_ROUTES.manage.libraries]: 'Manage Libraries',
  [NAVIGATION_ROUTES.manage.workGroups]: 'Manage Work Groups',
  [NAVIGATION_ROUTES.manage.reporting]: 'Manage Reporting',
  [NAVIGATION_ROUTES.manage.externalLearning.records]: 'Manage External Learning Records',
  [NAVIGATION_ROUTES.manage.externalLearning.setup]: 'Manage External Learning Setup',
  [NAVIGATION_ROUTES.manage.users]: 'Manage Users',
  [NAVIGATION_ROUTES.manage.groups]: 'Manage Groups',
  [NAVIGATION_ROUTES.manage.branding]: 'Customization',
  [NAVIGATION_ROUTES.manage.knowledgeSmart]: 'Manage KnowledgeSmart',
  [NAVIGATION_ROUTES.manage.settings.general]: 'Manage General Settings',
  [NAVIGATION_ROUTES.manage.settings.users]: 'Manage Users Settings',
  [NAVIGATION_ROUTES.manage.settings.groups]: 'Manage Group Settings',
  [NAVIGATION_ROUTES.manage.security]: 'Manage Security',
  [NAVIGATION_ROUTES.manage.integrations]: 'Manage Integrations',
  [NAVIGATION_ROUTES.manage.subscriptions]: 'Manage Subscriptions',
};

// used in browser title
export const ROUTE_TITLES = routeMapper(ROUTE_TITLE_MAP, (s) => `Pinnacle Series - ${s}`);



/***
 * Takes a routes object (from APP_ROUTES) and a mapping function.
 * Recursively applies function to each property
 * Returns mapped route object
 * @param routesObject
 * @param mappingFunction
 */
function routeMapper(routesObject, mappingFunction): any {
  const res = {};

  Object.keys(routesObject).map(key => {
    if ( typeof routesObject[key] === 'string') {
      res[key] = mappingFunction(routesObject[key]);
    } else if (typeof routesObject[key] === 'object') {
      res[key] = routeMapper(routesObject[key], mappingFunction);
    }
  })

  return res;
}
