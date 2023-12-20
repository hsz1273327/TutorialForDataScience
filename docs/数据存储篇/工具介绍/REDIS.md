# redis

redis是一个内存数据库,其特点也和内存一致

1. 快
2. 贵

因此通常redis只会用在最热和最常用的数据存储上,通常也不是离线使用而是在在线部分用于保存服务化所需的最常使用的数据.

在数据侧主要的应用场景包括:

1. 缓存,例如特征管理工具[feast](https://github.com/feast-dev/feast)的在线特征部分只能使用redis.
2. 限流(使用插件[redis-cell@v0.3.0](https://github.com/brandur/redis-cell/tree/v0.3.0)),防止DDoS攻击造成