import search_request from './search_request_pb'
import corpus from './corpus_pb'
let sd = new search_request.SearchRequest()
sd.setQuery("test")
sd.setPageNumber(1)
sd.setResultPerPage(3)
sd.setCorpus(corpus.Corpus.NEWS)
sd.setUidsList([1, 2, 3])
sd.getWeightMap().set('a', 1)
sd.getWeightMap().set('b', 2)
console.log(sd.toObject())
let sd_bytes = sd.serializeBinary()
console.log(sd_bytes)
let sd_new = search_request.SearchRequest.deserializeBinary(sd_bytes)
console.log(sd_new.toObject())

let sf = new search_request.SearchRequest(["test",1,3,corpus.Corpus.NEWS,[1, 2, 3],[['a',1],['b',2]]])
console.log(sf.toObject())