import { model, Schema } from 'mongoose'

export enum ImageSize {
	SM = 'sm',
	MD = 'md',
	LG = 'lg'
}

const imagesSchema = new Schema({
	name: {
		type: String,
		required: [true, 'this field is required']
	},
	size: {
		type: String,
		enum: [ImageSize.SM, ImageSize.MD, ImageSize.LG],
		required: [true, 'this field is required']
	},
	filename: {
		type: String,
		required: [true, 'this field is required']
	},
	alt: {
		type: String,
		required: [true, 'this field is required']
	}
}, {
	timestamps: true
})

export default model('images', imagesSchema)