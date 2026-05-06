import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing-module';
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
import { AdminMemberships } from './admin-memberships/admin-memberships';
import { AdminOrderDetail } from './admin-order-detail/admin-order-detail';
import { PaginationComponent } from '../../shared/components/pagination/pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AdminLogin,
    AdminDashboard,
    AdminBranches,
    ProductForm,
    BranchForm,
    AdminPlans,
    PlanForm,
    AdminUsers,
    AdminUserForm,
    AdminMembers,
    AdminMemberForm,
    AdminProfile,
    AdminOrders,
    AdminOrderDetail,
    AdminMemberships,
    PaginationComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class AdminModule { }
