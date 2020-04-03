"use strict";

var _search_request_pb = _interopRequireDefault(require("./search_request_pb"));

var _corpus_pb = _interopRequireDefault(require("./corpus_pb"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let sd = new _search_request_pb.default.SearchRequest();
sd.setQuery("test");
sd.setPageNumber(1);
sd.setResultPerPage(3);
sd.setCorpus(_corpus_pb.default.Corpus.NEWS);
sd.setUidsList([1, 2, 3]);
sd.getWeightMap().set('a', 1);
sd.getWeightMap().set('b', 2);
console.log(sd.toObject());
let sd_bytes = sd.serializeBinary();
console.log(sd_bytes);

let sd_new = _search_request_pb.default.SearchRequest.deserializeBinary(sd_bytes);

console.log(sd_new.toObject());
let sf = new _search_request_pb.default.SearchRequest(["test", 1, 3, _corpus_pb.default.Corpus.NEWS, [1, 2, 3], [['a', 1], ['b', 2]]]);
console.log(sf.toObject());