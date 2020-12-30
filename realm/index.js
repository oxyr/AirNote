import Realm from 'realm';
import Schema from './schema';

function getCurrent(callback) {
  var schema = new Schema();
  var current = schema.current();

  // return new Realm(current);
  return new Promise(
    function (resolve, reject) {
      Realm.open(current)
        .then((realm) => {
          console.log("path",realm.path)
          callback && callback("", realm)
          resolve(realm)
        })
        .catch((error) => {
          callback && callback(error, "")
          reject(error)
        })
    }
  )
}

module.exports = {
  current: getCurrent
}