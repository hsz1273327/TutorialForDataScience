import search_request_pb2 as search_request
import corpus_pb2 as corpus

sr = search_request.SearchRequest(
    query="test",
    page_number=1,
    result_per_page=3,
    corpus=corpus.Corpus.NEWS,
    uids=[1, 2, 3, 4],
    weight={
        "a": 1,
        "b": 2
    }
)
sr_bytes = sr.SerializeToString()
print(sr_bytes)

sr_new = search_request.SearchRequest()
sr_new.ParseFromString(sr_bytes)
print(sr_new)