import { model, Schema } from 'mongoose'

const ContactInfo = new Schema({
	description: {
		type: String,
		required: [true, 'this field is required'],
		minLength: 10,
		maxLength: 200
	},
	phone_number: {
		type: String,
		required: [true, 'this field is required'],
		minLength: 5,
		maxLength: 20
	},
	email: {
		type: String,
		index: true,
		required: [true, 'This Field is required'],
		validate: {
			validator: (value: string) => {
				return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value) 
			},
			message: 'Not a Valid Email'
		}
	},
	location: {
		type: String,
		required: [true, 'this field is required'],
		minLength: 5,
		maxLength: 20
	}
})

export default model('contact-info', ContactInfo)