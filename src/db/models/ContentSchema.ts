import { model, Schema } from 'mongoose'

const contentSchema = new Schema({
	name: {
		type: String,
		index: true, 
		unique: true,
		required: [true, 'this field is required']
	},
	content: {
		type: String,
		required: [true, 'this field is required']
	},
	alt: {
		type: String,
	},
	type: {
		type: String,
		enum: ['text', 'image'],
		required: [true, 'this field is required']
	}
}, {
	timestamps: true
})

export default model('content', contentSchema)