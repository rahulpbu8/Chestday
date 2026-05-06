import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { Address } from './address.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('addresses')
@UseGuards(AuthGuard('jwt'))
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  async create(@Request() req, @Body() addressData: Partial<Address>) {
    return this.addressesService.create(req.user.id, addressData);
  }

  @Get()
  async findAll(@Request() req) {
    return this.addressesService.findAllByUserId(req.user.id);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.addressesService.findOne(id, req.user.id);
  }

  @Put(':id')
  async update(@Request() req, @Param('id') id: string, @Body() addressData: Partial<Address>) {
    return this.addressesService.update(id, req.user.id, addressData);
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    return this.addressesService.remove(id, req.user.id);
  }

  @Post(':id/set-default')
  async setDefault(@Request() req, @Param('id') id: string) {
    return this.addressesService.setDefault(id, req.user.id);
  }
}
