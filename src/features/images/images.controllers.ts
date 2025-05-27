import imageModel from "../../db/models/ImgesSchema";
import { Images } from "../../interface";
import { asyncCall } from "../../utils/utils";
import { Request, Response } from "express";

async function createImage(req: Request, res: Response) {
  const image: Images = req.body;
  const result = await asyncCall<Images|null>(imageModel.findOneAndUpdate(
      {
        name: image.name,
      },
      image,
      {
        new: true,
        upsert: true,
      }
    )
  );

  if (result.error) {
    res.status(500).json({ message: "Something went wrong. try again" });
    return;
  }

  res.json({
    message: result.data?.filename,
  });
}

async function getImageData(req: Request, res: Response) {
  const name = req.params?.name
  const result = await asyncCall(imageModel.findOne({
    name
  }))

  if(result.error) {
    res.status(500)
    .json({
      messgae: result.error.message
    })
    return
  }

  res.json(result.data)
}

export { createImage, getImageData };
