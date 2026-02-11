import { Request, Response, NextFunction } from "express";
import { tenantService } from "../services/tenant.service";

// ═══════════════════════════════════════════════════════
// CONTROLLER DE TENANT (Admin)
// ═══════════════════════════════════════════════════════

export class TenantController {
  /**
   * GET /admin/tenants
   * Lista todos os tenants
   */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { plan, isActive } = req.query;

      const filters: any = {};
      if (plan) filters.plan = plan as string;
      if (isActive !== undefined) filters.isActive = isActive === "true";

      const tenants = await tenantService.list(filters);

      res.json(tenants);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /admin/tenants/:id
   * Busca um tenant pelo ID
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const tenant = await tenantService.getById(id);

      res.json(tenant);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /admin/tenants
   * Cria um novo tenant
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const tenant = await tenantService.create(req.body);

      res.status(201).json(tenant);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /admin/tenants/:id
   * Atualiza um tenant
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const tenant = await tenantService.update(id, req.body);

      res.json(tenant);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /admin/tenants/:id/status
   * Ativa ou desativa um tenant
   */
  async toggleStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      const tenant = await tenantService.toggleStatus(id, isActive);

      res.json(tenant);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /admin/tenants/:id
   * Deleta um tenant
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await tenantService.delete(id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /admin/tenants/:id/usage
   * Busca detalhes de uso de um tenant
   */
  async getUsageDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const details = await tenantService.getUsageDetails(id);

      res.json(details);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /admin/dashboard
   * Dashboard com métricas de todos os tenants
   */
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const dashboard = await tenantService.getDashboardMetrics();

      res.json(dashboard);
    } catch (error) {
      next(error);
    }
  }
}
