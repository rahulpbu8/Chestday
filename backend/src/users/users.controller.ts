import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard, RolesGuard } from '../auth/guards/auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string = '',
    @Req() req: any,
  ) {
    return this.usersService.findAll(+page, +limit, search, req.user?.id);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.USER)
  getProfile(@Req() req: any) {
    return this.usersService.findById(req.user.id);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.USER)
  updateProfile(@Req() req: any, @Body() userData: any) {
    delete userData.role;
    return this.usersService.update(req.user.id, userData);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.USER)
  async changePassword(@Req() req: any, @Body() data: any) {
    const { oldPassword, newPassword } = data;
    const isMatch = await this.usersService.verifyPassword(req.user.id, oldPassword);
    if (!isMatch) {
      throw new Error('Invalid old password');
    }
    return this.usersService.update(req.user.id, { password: newPassword });
  }

  @Get('members')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  findMembers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string = '',
  ) {
    return this.usersService.findMembers(+page, +limit, search);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  // Public registration endpoint
  create(@Body() userData: any) {
    // If we're not an admin/super_admin, we must force role to USER
    // However, since this endpoint is now public, we should probably always force USER here
    // or use a separate admin-only create method?
    // For now, let's just force USER to be safe.
    userData.role = UserRole.USER;
    return this.usersService.create(userData);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() userData: any) {
    return this.usersService.update(id, userData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
