import { Request, Response } from "express";
import contentModel from "../../db/models/ContentSchema";
import { asyncCall } from "../../utils/utils";
import ContentDTO from "../../dtos/ContentDTO";
import { Content } from "../../interface";

export async function createContent(req: Request, res: Response) {
  const content = req.body;

  const result = await asyncCall(
    contentModel.findOneAndUpdate(
      {
        name: content.name,
      },
      content,
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

  res.json({
    message: "Succesfully Created",
  });
}

export async function createTextContent(req: Request, res: Response) {
  const name = req.params?.id;
  const result = await asyncCall(
    contentModel.findOneAndUpdate(
      {
        name,
      },
      { name, type: 'text', ...req.body },
      {
        new: true,
        upsert: true,
      }
    )
  );

  if(result.error) {
    res.status(500).json({message: 'could save update'})
    return
  }
  res.json({message: 'saved'})
}

export async function createImageContent(req: Request, res: Response) {
  const name = req.params?.id;
  console.log(name, req.body);
  
  const result = await asyncCall(
    contentModel.findOneAndUpdate(
      {
        name,
      },
      { name, type: 'image', ...req.body },
      {
        new: true,
        upsert: true,
      }
    )
  );

  if(result.error) {
    res.status(500).json({message: 'could save update'})
    return
  }
  res.json({message: 'saved'})
}

export async function getContent(req: Request, res: Response) {
  const name = req.params.name;
  const result = await asyncCall<Content | null>(
    contentModel.findOne({ name })
  );

  if (result.error) {
    res.status(500).json({
      message: result.error.message,
    });
    return;
  }

  res.json(result.data != null ? ContentDTO(result.data) : {});
}
