import aboutUsModel from "../../db/models/AboutUsSchema";
import { asyncCall } from "../../utils/utils";
import { Request, Response } from "express";

export async function createAboutUs(req: Request, res: Response) {
  const aboutUs = req.body;

  const result = await asyncCall(aboutUsModel.findOneAndUpdate(
      {
        name: aboutUs.name,
      },
      aboutUs,
      {
        new: true,
        upsert: true,
      }
    )
  );

  if (result.error) {
    res.status(500).json({
      message: result.error.message,
    });
    return;
  }

  res.json(result.data);
}

export async function getAboutUs(req: Request, res: Response) {
	const result = await asyncCall(aboutUsModel.find({}))

	if(result.error) {
		res.status(500)
		.json({
			message: result.error.message
		})
		return
	}

	res.json(result.data)
}