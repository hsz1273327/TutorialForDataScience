package main

import (
	"fmt"
	pb "hsz_foo/schema_pb"

	"github.com/golang/protobuf/proto"
)

func main() {
	sr := pb.SearchRequest{
		Query:         "test",
		PageNumber:    1,
		ResultPerPage: 3,
		Corpus:        pb.Corpus_NEWS,
		Uids:          []int32{1, 2, 3},
		Weight: map[string]float32{
			"a": 1.0,
			"b": 2.0,
		},
	}
	out, err := proto.Marshal(&sr)
	if err != nil {
		return
	}
	fmt.Println(out)
	new_sr := &pb.SearchRequest{}
	err = proto.Unmarshal(out, new_sr)
	if err != nil {
		return
	}
	fmt.Println(new_sr)
}
