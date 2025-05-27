import nodemailer from 'nodemailer'
const transport = nodemailer.createTransport({
	secure: true,
	host: 'mail.marbaraktrading.com',
	port: 465,
	auth: {
		user: 'admin@marbaraktrading.com',
		pass: 'F]3N(U~EI4q?'
	}
})

export default transport