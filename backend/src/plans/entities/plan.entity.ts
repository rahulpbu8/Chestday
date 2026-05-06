import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('pricing_plans')
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  price: string;

  @Column()
  period: string;

  @Column('simple-array')
  features: string[];

  @Column({ default: 0 })
  tier: number; // 1 = Monthly, 2 = Quarterly, 3 = Yearly, etc.

  @Column('decimal', { default: 0, scale: 2, precision: 10 })
  priceValue: number;

  @Column({ default: false })
  isPopular: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
