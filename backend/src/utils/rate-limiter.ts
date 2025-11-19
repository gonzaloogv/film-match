/**
 * Rate Limiter personalizado para TMDB API
 * Implementa patrón Token Bucket
 */
export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens por milisegundo

  constructor(maxRequests: number, windowMs: number) {
    this.maxTokens = maxRequests;
    this.tokens = maxRequests;
    this.lastRefill = Date.now();
    this.refillRate = maxRequests / windowMs;
  }

  /**
   * Refill tokens basado en tiempo transcurrido
   */
  private refill(): void {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = timePassed * this.refillRate;

    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  /**
   * Intenta consumir un token
   * @returns true si hay token disponible, false si no
   */
  async tryConsume(): Promise<boolean> {
    this.refill();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }

    return false;
  }

  /**
   * Espera hasta que haya un token disponible
   */
  async waitForToken(): Promise<void> {
    while (!(await this.tryConsume())) {
      // Calcular tiempo de espera hasta el próximo token
      const waitTime = Math.ceil(1 / this.refillRate);
      await this.sleep(waitTime);
    }
  }

  /**
   * Helper para sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Obtiene el número de tokens disponibles
   */
  getAvailableTokens(): number {
    this.refill();
    return Math.floor(this.tokens);
  }
}