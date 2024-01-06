const collectionName = path.basename(__filename, '.collection.js')
module.exports = function (dbModel) {
	let schema = mongoose.Schema(
		{
			owner: {	type: mongoose.Schema.Types.ObjectId, ref: 'members', required: true,			index: true			},
			hotel: {	type: mongoose.Schema.Types.ObjectId, ref: 'hotels', required: true,			index: true			},
			number: { type: String, required: true, index: true },
			floor: { type: String, default: '' },
			properties: {
				liveCam:{ type: Boolean, default: false, index: true },
				vetService:{ type: Boolean, default: false, index: true },
				ac:{ type: Boolean, default: false, index: true }
			},
			passive: { type: Boolean, default: false, index: true },
			createdDate: { type: Date, default: Date.now},
			modifiedDate: { type: Date, default: Date.now, index: true },
		},
		{ versionKey: false }
	)

	schema.pre('save', (next) => next())
	schema.pre('remove', (next) => next())
	schema.pre('remove', true, (next, done) => next())
	schema.on('init', (model) => {})
	schema.plugin(mongoosePaginate)

	let model = dbModel.conn.model(collectionName, schema, collectionName)

	model.removeOne = (session, filter) =>		sendToTrash(dbModel, collectionName, session, filter)
	return model
}
