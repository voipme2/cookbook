import { Request, Response } from 'express';
import { DatabaseInterface } from '../types';
interface UploadRequest extends Request {
    file?: Express.Multer.File;
}
declare const recipesController: {
    list: (_req: Request, res: Response, db: DatabaseInterface) => Promise<void>;
    get: (req: Request, res: Response, db: DatabaseInterface) => Promise<void>;
    create: (req: Request, res: Response, db: DatabaseInterface) => Promise<void>;
    update: (req: Request, res: Response, db: DatabaseInterface) => Promise<void>;
    uploadImage: (req: UploadRequest, res: Response, db: DatabaseInterface) => Promise<void>;
    fetchFromUrl: (req: Request, res: Response) => Promise<void>;
    searchWithFilters: (req: Request, res: Response, db: DatabaseInterface) => Promise<void>;
};
export default recipesController;
//# sourceMappingURL=recipesController.d.ts.map