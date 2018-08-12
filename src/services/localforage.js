import localforage from 'localforage';
import uuid from 'uuid';

localforage.config({
  name      : 'VoiceRecord',
  storeName : 'VoiceRecordData'
});

export function storeRecording(id, obj) {
  localforage.setItem(uuid.v1(), obj);
}

export function getAllStoredRecordings() {
  const storedItems = [];

  return localforage.iterate((obj) => {
    storedItems.push(obj);

  }).then(() => {
    return storedItems;
  }).catch((err) => {
    console.log(err);
  });
}
