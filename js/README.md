# js使用protobuf示例

js使用protobuf使用实例方法

+ `.SerializeToString()->bytes`用于序列化
+ `.ParseFromString()`用于反序列化

需要注意的是反序列化需要先创建一个实例,然后反序列化后内容会填充到这个实例上.
