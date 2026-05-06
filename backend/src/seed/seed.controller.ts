import { Controller, Get, Query } from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get('run')
  async runSeed(@Query('force') force: string) {
    const isForce = force === 'true';
    console.log(`SeedController: Manual seed triggered (force: ${isForce})`);
    await this.seedService.runSeed(isForce);
    return { message: `Seeding process completed (force: ${isForce}). Check backend console for details.` };
  }

  @Get('cleanup')
  async cleanup() {
    const deletedCount = await this.seedService.cleanupUnusedImages();
    return { 
      message: `Cleanup completed. Deleted ${deletedCount} unused images.`,
      deletedCount 
    };
  }
}
