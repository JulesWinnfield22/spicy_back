import multer from 'multer'

export class UnsupportedFileTypeError extends Error {
	constructor(message: string) {
		super(message)
	}
}

const storage = multer.diskStorage({
	destination: 'uploads/',
	filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
		const extname = file.originalname.split('.')?.at?.(-1)

    cb(null, `${uniqueSuffix}.${extname}`)
  }
})

export default multer({
	storage,
	fileFilter(req, file, callback) {
		console.log('file', file);
		
		const filetypes = /webp|jpeg|jpg|png|gif/; // allowed file types
		const extname = file.originalname.split('.')?.at(-1)
		
		if(extname && filetypes.test(extname)) {
			return callback(null, true)
		} else {
			callback(new UnsupportedFileTypeError('Invalid file type. Only webp, jpeg, jpg, png, gif are allowed.'))
		}
	},
})