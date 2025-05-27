import { model, Schema, Types } from "mongoose";

const CounterSchema = new Schema({
	for: {
		type: String,
		required: [true, 'this field is required']
	},
	counter: {
		type: Number,
		default: 2222,
		required: [true, 'this field is required']
	}
}, {
	timestamps: true
})

export default model('counter', CounterSchema)