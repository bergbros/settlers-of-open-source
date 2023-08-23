import { Request, Response, NextFunction } from 'express';

export const timingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime: number = Date.now();

  next();

  const endTime: number = Date.now();
  const duration = endTime - startTime;
  console.log(`${req.method} ${req.path} - ${res.statusCode} in ${duration} ms`);
}