import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { UsersService } from '../users/users.service';
import { PlansService } from '../plans/plans.service';
import { Payment, PaymentStatus } from './entities/payment.entity';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(
    private readonly usersService: UsersService,
    private readonly plansService: PlansService,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>
  ) { }

  @Post()
  async processPayment(@Req() req, @Body() paymentData: any) {
    console.log('PaymentsController: Received payment request for user:', req.user.id);
    console.log('PaymentsController: Payment data:', paymentData);

    try {
      if (!req.user || !req.user.id) {
        console.error('PaymentsController: Unauthorized - user missing from request');
        return {
          success: false,
          message: 'User authentication failed'
        };
      }

      console.log(`PaymentsController: Processing payment for user ${req.user.id} (${req.user.email})`);

      const plan = await this.plansService.findOne(paymentData.planId);
      if (!plan) {
        console.error('PaymentsController: Plan not found:', paymentData.planId);
        return {
          success: false,
          message: 'Selected membership plan not found'
        };
      }

      // Use priceValue if available, fallback to parsing price string safely
      let amount = plan.priceValue;
      if (!amount || isNaN(amount)) {
        console.warn('PaymentsController: priceValue missing or invalid, attempting to parse price string:', plan.price);
        try {
          amount = parseFloat(plan.price.toString().replace(/[^\d.]/g, ''));
        } catch (parseError) {
          console.error('PaymentsController: Failed to parse price string:', plan.price);
          amount = 0;
        }
      }

      if (isNaN(amount) || amount === 0) {
        console.error('PaymentsController: Invalid payment amount for plan:', plan.name);
        return {
          success: false,
          message: 'Could not determine valid payment amount'
        };
      }

      // Save the payment record
      console.log(`PaymentsController: Creating PAID record for ${plan.name} (Amount: ${amount})`);
      const payment = this.paymentRepository.create({
        userId: req.user.id,
        planId: plan.id,
        amount: amount,
        status: PaymentStatus.PAID,
        transactionId: 'MOCK-TXN-' + Math.random().toString(36).substring(7).toUpperCase(),
        paymentMethod: paymentData.method || 'unknown'
      });
      
      const savedPayment = await this.paymentRepository.save(payment);
      console.log('PaymentsController: Payment record saved successfully with ID:', savedPayment.id);

      // Auto-activation logic: Always attempt to activate for every paid transaction (renewal/upgrade)
      try {
        console.log(`PaymentsController: Attempting membership activation for user ${req.user.id} and payment ${savedPayment.id}`);
        await this.usersService.activateManual(req.user.id, savedPayment.id);
        console.log('PaymentsController: Activation triggered successfully');
      } catch (activationError) {
        console.error('PaymentsController: Auto-activation failed but payment was saved:', activationError);
      }

      return {
        success: true,
        message: 'Payment processed and membership activated',
        transactionId: savedPayment.transactionId
      };
    } catch (error) {
      console.error('PaymentsController: FATAL ERROR during payment processing:', error);
      return {
        success: false,
        message: 'A server error occurred during payment. Please contact support if the amount was debited.'
      };
    }
  }

  @Post('activate')
  async activateMembership(@Req() req, @Body() body: { paymentId: string }) {
    try {
      const user = await this.usersService.activateManual(req.user.id, body.paymentId);
      return {
        success: true,
        message: 'Membership activated successfully',
        user
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
}
