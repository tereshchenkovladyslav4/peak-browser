import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import {APP_ROUTES_MANAGE, NAVIGATION_ROUTES, ROUTE_TITLES} from "../../resources/constants/app-routes";
import {ManagementPortalComponent} from "./components/management-portal/management-portal.component";


const MANAGE_ROUTES: Routes = [
  { path: APP_ROUTES_MANAGE.assignments.assignments, component: ManagementPortalComponent, title: ROUTE_TITLES[NAVIGATION_ROUTES.manage.assignments.assignments], data: { name: "Assignments" } },
  { path: APP_ROUTES_MANAGE.assignments.autoAssignments, component: ManagementPortalComponent, title: ROUTE_TITLES[NAVIGATION_ROUTES.manage.assignments.assignments], data: { name: "AssignmentsAuto" } },
  { path: APP_ROUTES_MANAGE.content, component: ManagementPortalComponent, title: ROUTE_TITLES[NAVIGATION_ROUTES.manage.content], data: { name: "Content" } },
  { path: APP_ROUTES_MANAGE.liveEvents, component: ManagementPortalComponent, title: ROUTE_TITLES[NAVIGATION_ROUTES.manage.liveEvents], data: { name: "LiveEvents" } },
  { path: APP_ROUTES_MANAGE.libraries, component: ManagementPortalComponent, title: ROUTE_TITLES[NAVIGATION_ROUTES.manage.libraries], data: { name: "Libraries" } },
  { path: APP_ROUTES_MANAGE.workGroups, component: ManagementPortalComponent, title: ROUTE_TITLES[NAVIGATION_ROUTES.manage.workGroups] },
  { path: APP_ROUTES_MANAGE.reporting, component: ManagementPortalComponent, title: ROUTE_TITLES[NAVIGATION_ROUTES.manage.reporting] },
  { path: APP_ROUTES_MANAGE.externalLearning.records, component: ManagementPortalComponent, title: ROUTE_TITLES[NAVIGATION_ROUTES.manage.externalLearning.records], data: { name: "ELTRecords" } },
  { path: APP_ROUTES_MANAGE.externalLearning.setup, component: ManagementPortalComponent, title: ROUTE_TITLES[NAVIGATION_ROUTES.manage.externalLearning.setup], data: { name: "ELTSetup" } },
  { path: APP_ROUTES_MANAGE.users, component: ManagementPortalComponent, title: ROUTE_TITLES[NAVIGATION_ROUTES.manage.users], data: { name: "Users" } },
  { path: APP_ROUTES_MANAGE.groups, component: ManagementPortalComponent, title: ROUTE_TITLES[NAVIGATION_ROUTES.manage.groups], data: { name: "Groups" } },
  { path: APP_ROUTES_MANAGE.branding, component: ManagementPortalComponent, title: ROUTE_TITLES[NAVIGATION_ROUTES.manage.branding], data: { name: "Branding" }},
  { path: APP_ROUTES_MANAGE.knowledgeSmart, component: ManagementPortalComponent, title: ROUTE_TITLES[NAVIGATION_ROUTES.manage.knowledgeSmart] },
  { path: APP_ROUTES_MANAGE.settings.general, component: ManagementPortalComponent, title: ROUTE_TITLES[NAVIGATION_ROUTES.manage.settings.general], data: { name: "SettingsGeneral" } },
  { path: APP_ROUTES_MANAGE.settings.users, component: ManagementPortalComponent, title: ROUTE_TITLES[NAVIGATION_ROUTES.manage.settings.users], data: { name: "SettingsUsers" } },
  { path: APP_ROUTES_MANAGE.settings.groups, component: ManagementPortalComponent, title: ROUTE_TITLES[NAVIGATION_ROUTES.manage.settings.groups], data: { name: "SettingsGroups" } },
  { path: APP_ROUTES_MANAGE.security, component: ManagementPortalComponent, title: ROUTE_TITLES[NAVIGATION_ROUTES.manage.security], data: { name: "Security" } },
  { path: APP_ROUTES_MANAGE.integrations, component: ManagementPortalComponent, title: ROUTE_TITLES[NAVIGATION_ROUTES.manage.integrations], data: { name: "Integrations" } },
  { path: APP_ROUTES_MANAGE.subscriptions, component: ManagementPortalComponent, title: ROUTE_TITLES[NAVIGATION_ROUTES.manage.subscriptions], data: { name: "Subscriptions" } },
];

@NgModule({
  declarations: [
    ManagementPortalComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(MANAGE_ROUTES)
  ]
})
export class ManageModule {
}
