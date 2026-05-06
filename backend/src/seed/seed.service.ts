import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Product } from '../products/product.entity';
import { Branch } from '../branches/entities/branch.entity';
import { Plan } from '../plans/entities/plan.entity';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/user.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    private readonly dataSource: DataSource,
  ) { }

  async onModuleInit() {
    console.log('SeedService: Checking if seeding is required...');
    try {
      // Seed test customer user
      await this.seedTestUser();

      const productCount = await this.productRepository.count();
      if (productCount === 0) {
        await this.seedProducts();
      }

      const branchCount = await this.branchRepository.count();
      if (branchCount === 0) {
        await this.seedBranches();
      }

      const planCount = await this.planRepository.count();
      if (planCount === 0) {
        await this.seedPlans();
      }

      console.log('SeedService: Initialization completed');
    } catch (error) {
      console.error('SeedService: Initialization failed', error);
    }
  }

  public async runSeed(force: boolean = false) {
    if (force) {
      await this.resetData();
    }
    await this.seedProducts(force);
    await this.seedBranches(force);
    await this.seedPlans(force);
  }

  private async resetData() {
    console.log('SeedService: Resetting database...');
    try {
      const productTable = this.productRepository.metadata.tableName;
      const branchTable = this.branchRepository.metadata.tableName;
      const planTable = this.planRepository.metadata.tableName;

      await this.dataSource.query(`TRUNCATE TABLE "${productTable}" RESTART IDENTITY CASCADE`);
      await this.dataSource.query(`TRUNCATE TABLE "${branchTable}" RESTART IDENTITY CASCADE`);
      await this.dataSource.query(`TRUNCATE TABLE "${planTable}" RESTART IDENTITY CASCADE`);

      console.log(`SeedService: Tables truncated`);
    } catch (error) {
      console.error('SeedService: Error during reset', error.message);
      await this.productRepository.delete({});
      await this.branchRepository.delete({});
      await this.planRepository.delete({});
    }
  }

  private async seedProducts(force: boolean = false) {
    if (!force && (await this.productRepository.count()) > 0) return;

    console.log('SeedService: Seeding products...');
    try {
      const possiblePaths = [
        path.resolve(process.cwd(), '..', 'db.json'),
        path.resolve(process.cwd(), 'db.json'),
      ];

      const dbPath = possiblePaths.find(p => fs.existsSync(p));
      const uploadsDir = path.join(process.cwd(), 'uploads', 'products');

      if (!dbPath) return;

      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      const productsData = dbData.products || [];

      for (const p of productsData) {
        let imagePath = p.image;

        if (p.image && p.image.startsWith('http')) {
          // Consistent final filename based on product name
          const sanitizedName = p.name.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').toLowerCase();
          const finalImageName = `seed-${sanitizedName}.jpg`;
          const destPath = path.join(uploadsDir, finalImageName);

          imagePath = `/uploads/products/${finalImageName}`;

          // Skip download if image already exists
          if (!fs.existsSync(destPath)) {
            try {
              console.log(`SeedService: Downloading ${p.image} to ${finalImageName}`);
              const response = await axios.get(p.image, {
                responseType: 'arraybuffer',
                timeout: 10000
              });
              fs.writeFileSync(destPath, response.data);
            } catch (error) {
              console.error(`SeedService: Failed to download ${p.image}:`, error.message);
            }
          } else {
            console.log(`SeedService: Reusing existing seed image ${finalImageName}`);
          }
        }
        else if (p.image && (p.image.includes('/assets/') || p.image.includes('\\assets\\'))) {
          const fileName = path.basename(p.image);
          const backendFiles = fs.readdirSync(uploadsDir);
          const matchedFile = backendFiles.find(f => f.toLowerCase() === fileName.toLowerCase());

          if (matchedFile) {
            imagePath = `/uploads/products/${matchedFile}`;
            console.log(`SeedService: Linked local asset ${matchedFile}`);
          } else {
            console.warn(`SeedService: Local asset ${fileName} not found in uploads`);
          }
        }

        const product = this.productRepository.create({
          ...p,
          id: undefined,
          price: parseFloat(p.price.toString().replace(/,/g, '')),
          image: imagePath,
          stock: 50,
        });

        await this.productRepository.save(product);
      }
      console.log('SeedService: Product seeding completed');
    } catch (error) {
      console.log('SeedService: Error during seeding products', error.message);
    }
  }

  private async seedBranches(force: boolean = false) {
    if (!force && (await this.branchRepository.count()) > 0) return;

    console.log('SeedService: Seeding branches...');
    try {
      const possiblePaths = [
        path.resolve(process.cwd(), '..', 'db.json'),
        path.resolve(process.cwd(), 'db.json'),
      ];
      const dbPath = possiblePaths.find(p => fs.existsSync(p));
      if (!dbPath) return;

      const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      const branchesData = dbData.branches || [];

      for (const b of branchesData) {
        const branch = this.branchRepository.create({
          ...b,
          id: undefined, // Let DB generate UUID
        });
        await this.branchRepository.save(branch);
      }
      console.log('SeedService: Branch seeding completed');
    } catch (error) {
      console.error('SeedService: Error during seeding branches', error.message);
    }
  }

  private async seedPlans(force: boolean = false) {
    if (!force && (await this.planRepository.count()) > 0) return;

    console.log('SeedService: Seeding plans...');
    try {
      const possiblePaths = [
        path.resolve(process.cwd(), '..', 'db.json'),
        path.resolve(process.cwd(), 'db.json'),
      ];
      const dbPath = possiblePaths.find(p => fs.existsSync(p));
      if (!dbPath) return;

      const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      const plansData = dbData.pricingPlans || [];

      for (const p of plansData) {
        let tier = 1;
        if (p.name.includes('YEARLY')) tier = 3;
        else if (p.name.includes('QUARTERLY')) tier = 2;

        const plan = this.planRepository.create({
          ...p,
          id: undefined, // Let DB generate UUID
          tier,
          priceValue: parseFloat(p.price.toString().replace(/,/g, '')),
        });
        await this.planRepository.save(plan);
      }
      console.log('SeedService: Plan seeding completed');
    } catch (error) {
      console.error('SeedService: Error during seeding plans', error.message);
    }
  }

  public async cleanupUnusedImages() {
    console.log('SeedService: Starting image cleanup...');
    const uploadsDir = path.join(process.cwd(), 'uploads', 'products');

    if (!fs.existsSync(uploadsDir)) return;

    try {
      const allFiles = fs.readdirSync(uploadsDir);
      const allProducts = await this.productRepository.find();
      const usedImages = new Set(allProducts.map(p => path.basename(p.image)));

      let deletedCount = 0;
      for (const file of allFiles) {
        if (!usedImages.has(file)) {
          const filePath = path.join(uploadsDir, file);
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      }
      console.log(`SeedService: Cleanup completed. Deleted ${deletedCount} unused images.`);
      return deletedCount;
    } catch (error) {
      console.error('SeedService: Error during cleanup', error.message);
      throw error;
    }
  }

  private async seedTestUser() {
    console.log('SeedService: Checking for test customer user...');
    const testEmail = 'customer_test@example.com';
    const testPassword = 'Customer123!';
    
    const userExists = await this.userRepository.findOne({ where: { email: testEmail } });
    if (!userExists) {
      console.log('SeedService: Seeding test customer user...');
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      const testUser = this.userRepository.create({
        name: 'Test Customer',
        email: testEmail,
        password: hashedPassword,
        role: UserRole.USER,
      });
      await this.userRepository.save(testUser);
      console.log('SeedService: Test customer user seeded successfully.');
    } else {
      console.log('SeedService: Test customer user already exists.');
    }
  }
}
