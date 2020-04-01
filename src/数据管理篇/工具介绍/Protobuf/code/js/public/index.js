"use strict";

var _search_request_pb = _interopRequireDefault(require("./search_request_pb"));

var _corpus_pb = _interopRequireDefault(require("./corpus_pb"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let sd = new _search_request_pb.default.SearchRequest();
sd.setQuery("test");
sd.setPageNumber(1);
sd.setResultPerPage(3);
sd.setCorpus(_corpus_pb.default.Corpus.NEWS);
console.log(sd.toObject());
console.log(sd.serializeBinary());