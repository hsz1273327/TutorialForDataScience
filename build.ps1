protoc -I=schema --python_out=py search_request.proto corpus.proto
protoc -I=schema --js_out=import_style=commonjs,binary:js/src search_request.proto corpus.proto
protoc -I=schema --go_out=golang/schema_pb --go_opt=paths=source_relative search_request.proto corpus.proto