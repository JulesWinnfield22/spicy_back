import { Content } from "../interface";

export default function ContentDTO(content?: Content) {
	return {
		id: content?._id,
		name: content?.name,
		alt: content?.alt,
		type: content?.type,
		content: content?.content,
		updatedAt: content?.updatedAt,
		createdAt: content?.createdAt,
	}
}
