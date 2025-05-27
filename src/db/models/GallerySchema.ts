import { model, Schema } from "mongoose";

const GallerySchema = new Schema({
	grid_name: {
		type: String,
		required: [true, 'this field is required']
	},
	cell_image: {
		type: String,
		required: [true, 'this field is required']
	}
}, {
	timestamps: true
})

export default model('gallery', GallerySchema)