// payments.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    
    if (!stripeKey) {
      throw new Error('❌ STRIPE_SECRET_KEY manquant');
    }

    this.stripe = new Stripe(stripeKey, {
    });
  }

  async createPaymentSheet(customerEmail: string) {
    try {
      // Vérifier l'email
      if (!customerEmail || !this.isValidEmail(customerEmail)) {
        throw new BadRequestException('Email invalide');
      }

      // Créer ou récupérer un customer
      const customers = await this.stripe.customers.list({
        email: customerEmail,
        limit: 1
      });

      let customer;
      if (customers.data.length > 0) {
        customer = customers.data[0];
      } else {
        customer = await this.stripe.customers.create({ 
          email: customerEmail 
        });
      }

      // Créer l'ephemeral key
      const ephemeralKey = await this.stripe.ephemeralKeys.create(
        { customer: customer.id },
        { apiVersion: '2024-06-20' }
      );

      // Créer le payment intent avec le price ID
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: 499, // 4.99€
        currency: 'eur',
        customer: customer.id,
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          product_type: 'subscription',
          email: customerEmail
        },
      });

      return {
        paymentIntent: paymentIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customer: customer.id,
        publishableKey: this.configService.get('STRIPE_PUBLISHABLE_KEY'),
      };
    } catch (error) {
      console.error('Erreur Stripe:', error);
      throw new BadRequestException(`Erreur de paiement: ${error.message}`);
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}