import { NextFunction, Request, Response } from "express";
import upload from "../utils/fileUpload";
import multer from "multer";

export default (filename: string, isArray: boolean = false) => {
  let uploader;
  if (isArray) {
    uploader = upload.array(filename, 10);
  } else {
    uploader = upload.single(filename);
  }

  return (req: Request, res: Response, next: NextFunction) => {
    uploader(req, res, function (err) {
			
			if (err) {
				res.status(400).json({
					message: err.message,
        });
				console.log(req.files);
        return;
      }
      let response = Array.isArray(req.files)
        ? req.files.map((el) => {
            return el.filename;
          })
        : req.file?.filename;

      req.body[filename] = response;
      next();
    });
  };
};
