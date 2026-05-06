import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';

export const multerConfig = {
    storage: diskStorage({
        destination: (req, file, callback) => {
            const dest = './uploads/products';
            if (!fs.existsSync(dest)) {
                fs.mkdirSync(dest, { recursive: true });
            }
            callback(null, dest);
        },
        filename: (req, file, callback) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            callback(null, `${uniqueSuffix}${ext}`);
        },
    }),
    fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp|gif)$/)) {
            return callback(new BadRequestException('Only image files are allowed!'), false);
        }
        callback(null, true);
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
};
