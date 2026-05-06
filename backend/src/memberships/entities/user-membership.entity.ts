import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/user.entity';
import { Plan } from '../../plans/entities/plan.entity';
import { Branch } from '../../branches/entities/branch.entity';

@Entity('user_memberships')
export class UserMembership {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column()
  userName: string; // Snapshot for history

  @ManyToOne(() => Plan)
  @JoinColumn({ name: 'planId' })
  plan: Plan;

  @Column()
  planId: string;

  @Column()
  planName: string; // Snapshot for history

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'timestamp' })
  expiryDate: Date;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @Column({ nullable: true })
  branchId: string;

  @Column({ nullable: true })
  branchName: string; // Snapshot for history

  @CreateDateColumn()
  activatedAt: Date;
}
