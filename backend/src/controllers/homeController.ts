import { Request, Response } from 'express';

export const getHomeInfo = (req: Request, res: Response) => {
  res.json({
    message: 'Hello from Node.js & Express Backend!',
    status: 'success',
    databaseAvailable: 'MariaDB setup is ready (connection requires proper credentials)'
  });
};
