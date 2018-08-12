import localforage from 'localforage';

localforage.config({
	name: 'VoiceRecord',
	storeName: 'VoiceRecordData'
});

let funcs = {
	storeRecording: (id, obj) => {
		localforage.setItem(id, obj);
	},

	getAllStoredRecordings: () => {
		const storedItems = [];

		return localforage.iterate((obj) => {
			storedItems.push(obj);
		}).then(() => {
			return storedItems;
		}).catch((err) => {
			console.log(err);
		});
	},

	replaceRecordings: (records) => {
		localforage.clear();
		records.forEach((record) => {
			localforage.setItem(record.id, record);
		})
	}
}
export default funcs;