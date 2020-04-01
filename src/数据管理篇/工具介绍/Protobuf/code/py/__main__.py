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

print(sr.SerializeToString())