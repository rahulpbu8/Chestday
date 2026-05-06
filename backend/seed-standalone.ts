import { createConnection, getRepository } from 'typeorm';
import { Product } from './src/products/product.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function runSeed() {
  console.log('Standalone Seed: Starting...');
  const connection = await createConnection({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password123',
    database: process.env.DB_NAME || 'chestday_gym',
    entities: [Product],
    synchronize: true,
  });

  const productRepo = getRepository(Product);
  await productRepo.query('TRUNCATE TABLE "product" RESTART IDENTITY CASCADE');
  console.log('Standalone Seed: Table truncated');

  const dbPath = path.resolve(process.cwd(), '..', 'db.json');
  const uploadsDir = path.resolve(process.cwd(), 'uploads', 'products');
  const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  for (const p of dbData.products) {
    let imagePath = p.image;
    const fileName = path.basename(p.image);
    if (fs.existsSync(path.join(uploadsDir, fileName))) {
      imagePath = `/uploads/products/${fileName}`;
      console.log(`Standalone Seed: Linked ${fileName}`);
    } else if (p.image.startsWith('http')) {
        // Just keep the link for now if it's remote, or use a placeholder
         imagePath = `/uploads/products/${fileName}`;
    }

    const product = productRepo.create({
      ...p,
      id: undefined,
      price: parseFloat(p.price.toString().replace(/,/g, '')),
      image: imagePath,
      stock: 50,
    });
    await productRepo.save(product);
  }

  console.log('Standalone Seed: Completed');
  await connection.close();
}

runSeed().catch(console.error);
