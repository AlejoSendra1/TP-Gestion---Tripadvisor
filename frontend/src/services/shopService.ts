// File: frontend/src/services/shopService.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

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
    const response = await axios.get(`${API_URL}/api/shop/benefits`);
    return response.data;
  }

  /**
   * Compra un beneficio específico
   */
  async purchaseBenefit(benefitId: number): Promise<PurchaseResponse> {
    const response = await axios.post(`${API_URL}/api/shop/purchase/${benefitId}`);
    return response.data;
  }

  /**
   * Obtiene todos los beneficios que el usuario ha comprado
   */
  async getUserBenefits(): Promise<UserBenefit[]> {
    const response = await axios.get(`${API_URL}/api/shop/user-benefits`);
    return response.data;
  }

  /**
   * Obtiene los beneficios activos (no usados) del usuario
   */
  async getActiveBenefits(): Promise<UserBenefit[]> {
    const response = await axios.get(`${API_URL}/api/shop/user-benefits/active`);
    return response.data;
  }

  /**
   * Marca un beneficio como usado manualmente
   */
  async useBenefit(userBenefitId: number): Promise<{ success: boolean; message: string }> {
    const response = await axios.post(`${API_URL}/api/shop/user-benefits/${userBenefitId}/use`);
    return response.data;
  }
}

export default new ShopService();