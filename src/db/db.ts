import mongoose from "mongoose";

async function dbConnect() {
	const DB_URL = process.env?.DB_URL
	const DB_NAME = process.env?.DB_NAME
	try {
		await mongoose.connect(`${DB_URL}${DB_NAME}`)
		console.log(`Connected to DB [${DB_NAME}]`);
	} catch(err: any) {
		console.log(err.message);
	}
}

export default dbConnect