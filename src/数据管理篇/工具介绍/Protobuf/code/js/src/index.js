import search_request from './search_request_pb'
import corpus from './corpus_pb'
let sd = new search_request.SearchRequest()
sd.setQuery("test")
sd.setPageNumber(1)
sd.setResultPerPage(3)
sd.setCorpus(corpus.Corpus.NEWS)
console.log(sd.toObject())
console.log(sd.serializeBinary())