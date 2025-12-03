// File: frontend/src/services/shopService.ts
import axios from 'axios';
import { apiClient } from '@/lib/apiClient';

const API_URL = import.meta.env.VITE_BASE_API_URL;

console.log('🔧 Shop Service initialized with API_URL:', API_URL);

export interface Benefit {
  id: number;
  name: string;
  description: string;
  cost: number;
  type: 'DISCOUNT' | 'XP_BONUS' | 'PRIORITY_SUPPORT' | 'FREE_UPGRADE';
  discountPercentage?: number;
  xpBonus?: number;
  singleUse: boolean;
}

export interface UserBenefit {
  id: number;
  benefit: Benefit;
  purchaseDate: string;
  used: boolean;
  usedDate?: string;
}

export interface PurchaseResponse {
  success: boolean;
  message: string;
  userBenefit?: UserBenefit;
  remainingXp: number;
}

class ShopService {
  /**
   * Obtiene todos los beneficios disponibles en la tienda
   */
  async getShopBenefits(): Promise<Benefit[]> {
    console.log('📦 Fetching shop benefits...');
    const response = await apiClient.get(`/api/shop/benefits`);
    console.log('📦 Benefits received:', response.data);
    return response.data;
  }

  /**
   * Compra un beneficio específico
   */
  async purchaseBenefit(benefitId: number): Promise<PurchaseResponse> {
    console.log('💰 Purchasing benefit:', benefitId);
    const response = await apiClient.post(`/api/shop/purchase/${benefitId}`);
    console.log('💰 Purchase response:', response.data);
    return response.data;
  }

  /**
   * Obtiene todos los beneficios que el usuario ha comprado
   */
  async getUserBenefits(): Promise<UserBenefit[]> {
    console.log('👤 Fetching user benefits...');
    const response = await apiClient.get(`/api/shop/user-benefits`);
    console.log('👤 User benefits received:', response.data);
    return response.data;
  }

  /**
   * Obtiene los beneficios activos (no usados) del usuario
   */
  async getActiveBenefits(): Promise<UserBenefit[]> {
    console.log('⭐ Fetching active benefits...');
    const response = await apiClient.get(`/api/shop/user-benefits/active`);
    console.log('⭐ Active benefits received:', response.data);
    return response.data;
  }

  /**
   * Marca un beneficio como usado manualmente
   */
  async useBenefit(userBenefitId: number): Promise<{ success: boolean; message: string }> {
    console.log('✓ Using benefit:', userBenefitId);
    const response = await apiClient.post(`/api/shop/user-benefits/${userBenefitId}/use`);
    console.log('✓ Use benefit response:', response.data);
    return response.data;
  }
}

export default new ShopService();