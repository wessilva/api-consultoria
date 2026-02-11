import { Request, Response, NextFunction } from "express";
import { onboardingService } from "../services/onboarding.service";
import { ValidationError } from "../errors/AppError";

// ═══════════════════════════════════════════════════════
// CONTROLLER DE ONBOARDING
// ═══════════════════════════════════════════════════════

export class OnboardingController {
  /**
   * POST /onboarding/register
   * Cria um novo tenant com o usuário owner
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyName, ownerName, ownerEmail, ownerPhone, password, plan } =
        req.body;

      // Validações básicas
      if (!companyName || companyName.length < 3) {
        throw new ValidationError(
          "Nome da empresa deve ter pelo menos 3 caracteres",
        );
      }

      if (!ownerName || ownerName.length < 3) {
        throw new ValidationError(
          "Nome do responsável deve ter pelo menos 3 caracteres",
        );
      }

      if (!ownerEmail || !ownerEmail.includes("@")) {
        throw new ValidationError("Email inválido");
      }

      if (!password || password.length < 6) {
        throw new ValidationError("Senha deve ter pelo menos 6 caracteres");
      }

      const result = await onboardingService.createTenant({
        companyName,
        ownerName,
        ownerEmail,
        ownerPhone,
        password,
        plan,
      });

      res.status(201).json({
        message: "Empresa cadastrada com sucesso!",
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}
