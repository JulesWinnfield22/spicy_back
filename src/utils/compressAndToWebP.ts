import { NextFunction, Request, Response } from "express";
import sharp from "sharp";

interface SharpImageInfo {
	filename: string,
	info: sharp.OutputInfo
}

interface Options {
	width?: number,
	height?: number,
	saveto?: string,
	name?: string
}

async function compressAndToWebP(buffer: Buffer, options?: Options): Promise<SharpImageInfo> {
	return new Promise((res, rej) => {
		let uniqueSuffix = options?.name ?? `${Date.now() + '-' + Math.round(Math.random() * 1E9)}`      
		sharp(buffer)// Set quality (0-100)
		.toFile(`${options?.saveto ?? 'uploads'}/${uniqueSuffix}.webp`, (err, info) => {
			if (err) rej(err);
			res({filename: `${uniqueSuffix}.webp`, info})
		});
	})
}

export default compressAndToWebP;