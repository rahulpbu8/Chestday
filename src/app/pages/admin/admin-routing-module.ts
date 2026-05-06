import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLogin } from './admin-login/admin-login';
import { AdminDashboard } from './admin-dashboard/admin-dashboard';
import { AdminBranches } from './admin-branches/admin-branches';
import { ProductForm } from './product-form/product-form';
import { BranchForm } from './branch-form/branch-form';
import { AdminPlans } from './admin-plans/admin-plans';
import { PlanForm } from './plan-form/plan-form';
import { AdminUsers } from './admin-users/admin-users';
import { AdminUserForm } from './admin-user-form/admin-user-form';
import { AdminMembers } from './admin-members/admin-members';
import { AdminMemberForm } from './admin-member-form/admin-member-form';
import { AdminProfile } from './admin-profile/admin-profile';
import { AdminOrders } from './admin-orders/admin-orders';
import { AdminOrderDetail } from './admin-order-detail/admin-order-detail';
import { AdminMemberships } from './admin-memberships/admin-memberships';
import { adminAuthGuard } from '../../core/guards/admin-auth-guard';

const routes: Routes = [
  { path: 'login', component: AdminLogin },
  {
    path: '',
    component: AdminDashboard,
    pathMatch: 'full',
    canActivate: [adminAuthGuard]
  },
  {
    path: 'profile',
    component: AdminProfile,
    canActivate: [adminAuthGuard]
  },
  {
    path: 'products/new',
    component: ProductForm,
    canActivate: [adminAuthGuard]
  },
  {
    path: 'products/edit/:id',
    component: ProductForm,
    canActivate: [adminAuthGuard]
  },
  {
    path: 'branches',
    component: AdminBranches,
    canActivate: [adminAuthGuard]
  },
  {
    path: 'branches/new',
    component: BranchForm,
    canActivate: [adminAuthGuard]
  },
  {
    path: 'branches/edit/:id',
    component: BranchForm,
    canActivate: [adminAuthGuard]
  },
  {
    path: 'plans',
    component: AdminPlans,
    canActivate: [adminAuthGuard]
  },
  {
    path: 'plans/new',
    component: PlanForm,
    canActivate: [adminAuthGuard]
  },
  {
    path: 'plans/edit/:id',
    component: PlanForm,
    canActivate: [adminAuthGuard]
  },
  {
    path: 'members',
    component: AdminMembers,
    canActivate: [adminAuthGuard]
  },
  {
    path: 'members/edit/:id',
    component: AdminMemberForm,
    canActivate: [adminAuthGuard]
  },
  {
    path: 'orders',
    component: AdminOrders,
    canActivate: [adminAuthGuard]
  },
  {
    path: 'orders/:id',
    component: AdminOrderDetail,
    canActivate: [adminAuthGuard]
  },
  {
    path: 'memberships',
    component: AdminMemberships,
    canActivate: [adminAuthGuard]
  },
  {
    path: 'users',
    component: AdminUsers,
    canActivate: [adminAuthGuard]
  },
  {
    path: 'users/new',
    component: AdminUserForm,
    canActivate: [adminAuthGuard]
  },
  {
    path: 'users/edit/:id',
    component: AdminUserForm,
    canActivate: [adminAuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
