import { Request, Response, NextFunction } from "express";

// Authentication middleware
export const requireAuth = (req: any, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

// Admin role middleware
export const requireAdmin = (req: any, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  
  next();
};

// User or Admin role middleware
export const requireUserOrAdmin = (req: any, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const allowedRoles = ["user", "admin"];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
  }
  
  next();
};
