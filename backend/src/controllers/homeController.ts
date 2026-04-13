import { Request, Response } from "express";

export class HomeController {
  static index(req: Request, res: Response): void {
    res.status(200).json({
      message: "API Quiz Jurídico funcionando",
      status: "online",
    });
  }
} 