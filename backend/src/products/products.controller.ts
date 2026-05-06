import { 
    Controller, Get, Post, Body, Patch, Param, Delete, 
    UseInterceptors, UploadedFile, UseGuards, Query 
  } from '@nestjs/common';
  import { ProductsService } from './products.service';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { diskStorage } from 'multer';
  import { extname } from 'path';
  import { JwtAuthGuard, RolesGuard } from '../auth/guards/auth.guard';
  import { Roles } from '../auth/decorators/roles.decorator';
  import { UserRole } from '../users/user.entity';
  
  @Controller('products')
  export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}
  
  @Get()
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search: string = ''
  ) {
    return this.productsService.findAll(+page, +limit, search);
  }
  
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.productsService.findOne(id);
    }
  
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @UseInterceptors(FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }))
    create(@Body() productData: any, @UploadedFile() file: Express.Multer.File) {
      const product = {
        ...productData,
        image: file ? `/uploads/products/${file.filename}` : productData.image,
        price: parseFloat(productData.price),
        stock: parseInt(productData.stock || '0'),
      };
      return this.productsService.create(product);
    }
  
    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @UseInterceptors(FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }))
    update(@Param('id') id: string, @Body() productData: any, @UploadedFile() file: Express.Multer.File) {
      const updateData = { ...productData };
      if (file) {
        updateData.image = `/uploads/products/${file.filename}`;
      }
      if (productData.price) updateData.price = parseFloat(productData.price);
      if (productData.stock) updateData.stock = parseInt(productData.stock);
      
      return this.productsService.update(id, updateData);
    }
  
    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    remove(@Param('id') id: string) {
      console.log(`DELETE request received for product ID: ${id}`);
      return this.productsService.remove(id);
    }
  }
