# go语言使用protobuf示例

go语言使用protobuf只有两个接口

+ `proto.Marshal(proto.Message)->([]byte, error)`用于序列化
+ `proto.Unmarshal([]byte, proto.Message))->error`用于反序列化

golang在构造pb的struct的时候会将其中的字段首字母都改为大写,这点需要额外注意.