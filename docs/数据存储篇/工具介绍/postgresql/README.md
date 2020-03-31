
# 使用postgresql做数据存储

postgresql(简称pg)是目前最先进的开源关系型通用数据库,它完全支持标准sql语句,在其上还有一定的功能扩展;天生支持插件,有许多额外的实用功能由一些第三方组织已经做了很不错的实现;并且支持自定义数据包装器,将pg仅作为interface,数据则实际存在被包装的数据库上.

在性能上,pg从来不在任何一个场景下是最好的选择.但永远是第二好的选择,加上它是个多面手,可以一套工具应付绝大多数场景,不用考虑多种工机的异构系统集成问题,因此技术选型选它还是比较合适的.



## 应用领域

pg生态下大致的应用领域有:

+ [OLTP](): 事务处理是PostgreSQL的本行

+ [OLAP](): 并行计算,数据分区,ANSI SQL兼容，窗口函数，CTE，CUBE等高级分析功能，任意语言写UDF

+ 时序数据:timescaledb时序数据库插件,分区表,BRIN索引

+ 流处理: PipelineDB扩展，Notify-Listen，物化视图，规则系统，灵活的存储过程与函数编写

+ 搜索引擎: 全文搜索索引足以应对简单场景;配合插件zhparser等分词工具可以实现中文支持,丰富的索引类型,支持函数索引,条件索引

+ 文档数据库: JSON,JSONB,XML,HStore原生支持,可以替代mongodb

+ 图数据库: 递归查询,更有AgensGraph扩展实现完整的图数据库功能

+ 空间数据: PostGIS扩展(杀手锏),内建的几何类型支持,GiST索引.

+ 缓存: 物化视图

+ 作为交互界面包装外部数据: 可以自定FDW包装外部数据,也就是说pg可以什么也不存,只是作为对其他外部数据对象的sql交互界面

本文会按顺序逐次介绍

## 本文使用的工具

+ 本文使用docker作为pg的部署工具,我会在docker中模拟pg和插件的运行环境,部署用的docker-compose文件会放在[code]()文件夹下

+ 本文使用的pg版本为`11.5`

+ SQL语句,基本不用不合规范的SQL语句

+ 执行SQL语句这边使用jupyter notebook的[postgres_kernel](http://blog.hszofficial.site/TutorialForPython/%E5%B7%A5%E5%85%B7%E9%93%BE%E7%AF%87/%E4%BA%A4%E4%BA%92%E7%8E%AF%E5%A2%83jupyter/%E5%9F%BA%E4%BA%8Eweb%E7%9A%84%E5%8F%AF%E4%BA%A4%E4%BA%92%E8%BF%90%E8%A1%8C%E7%8E%AF%E5%A2%83jupyter.html#postgresql)

## Helloworld

按照惯例,我们来先写个helloworld,在安装好pg后,默认会有一个数据库`postgres`,我们可以进入它来实现这个helloworld


```PostgreSQL
-- connection: postgres://postgres:postgres@localhost:5432/postgres
```


```PostgreSQL
-- autocommit: true
```

    switched autocommit mode to True


```PostgreSQL
select 'hello world' as welcome
```

    1 row(s) returned.



<table>
<thead>
<tr><th>welcome    </th></tr>
</thead>
<tbody>
<tr><td>hello world</td></tr>
</tbody>
</table>


## postgresql的基本概念和使用

pg是一个关系型数据库,其数据基本以行为单位,下面是pg使用到的基本概念汇总:

### database

database 一词含义宽泛,既可表示广义的数据库系统,又可以表示某些特定数据库系统中的某一级数据存储单位,如表述不当极易造成混淆.此处的database为最粗颗粒度的一级数据存储单位,通常以业务范围区分,每个pg服务实例可以包含多个database.

> 创建一个database


```PostgreSQL
CREATE DATABASE test
```

    database "test" already exists


> 删除database

删除database可以使用可选命令`IF EXISTS`,这样如果数据库并不存在就不会执行删除操作,避免错误


```PostgreSQL
DROP DATABASE IF EXISTS test
```

    database "test" is being accessed by other users
    DETAIL:  There are 4 other sessions using the database.


### schema

数据库业界对于`schema`有多种译法:纲要,模式,方案等等.但各种译法都不能准确直观地表达出其原本的含义--即位于一个独立命名空间内的一组相关数据库对象的集合.

ANSI SQL标准中对 schema 有着明确的定义--database的下一层逻辑结构就是 schema.

如果把database比作一个国家,那么 schema 就是一些独立的省,大多数对象是隶属于某个schema的,然后schema又隶属于某个database.在创建一个新的 database时,PostgreSQL会自动为其创建一个名为`public`的schema(类似首都).如果未设置search_path变量,那么 PostgreSQL 会将你创建的所有对象默认放入public schema中.如果表的数量较少这是没问题的,但如果你有几千张表,那么还是建议将它们分门别类放入不同的 schema 中.

> 创建一个schema


```PostgreSQL
CREATE SCHEMA test_schema
```

> 删除一个schema

与删除database类似的我们也可以删除schema


```PostgreSQL
DROP SCHEMA IF EXISTS test_schema
```

### 表

任何一个数据库中表都是最核心的对象类型,在 PostgreSQL 中表首先属于某个 schema,而 schema 又属于某个 database,这样就构成了一种三级存储结构(可以类比国家-省-市)

PostgreSQL的表支持两种很强大的功能:

+ 表继承,即一张表可以有父表和子表.这种层次化的结构可以极大地简化数据库设计,还可以为你省掉大量的重复查询代码.
+ 创建一张表的同时系统会自动为此表创建一种对应的自定义数据类型



> 创建表

与许多关系数据库不同,pg可以没有主键,主键只是一种约束而已,因此在定义表时并不需要指定主键.建表操作非常容易重复表明,为了避免重复我们可以使用命令`IF NOT EXISTS`避免.
创建表的格式为:

```sql
CREATE TABLE IF NOT EXISTS {表名}(
    {字段名} {字段类型} [DEFAULT {默认值} [...{字段约束}]],
     ...,
     [...{表约束}]
)
```

通常我个人不建议将约束和建表混在一起写,而更建议分为创建和定义约束两步,这样更加清晰.


```PostgreSQL
CREATE TABLE IF NOT EXISTS my_test(
   a text,
   b text
)
```

    NOTICE:  relation "my_test" already exists, skipping


> 修改表名


```PostgreSQL
ALTER TABLE my_test RENAME TO mytest1
```

    relation "mytest1" already exists


#### 字段(列)

在创建一个表的时候我们就必须先定义好这个表有什么字段,这些字段分别是什么类型,有什么约束条件制约,有什么默认值,怎么加索引等.


比较常见的字段操作是修改字段,修改字段:

> 新增字段


```PostgreSQL
ALTER TABLE mytest1 ADD c float
```

> 修改字段的数据类型


```PostgreSQL
ALTER TABLE mytest1 ALTER COLUMN c TYPE text
```

> 修改字段名


```PostgreSQL
ALTER TABLE mytest1 RENAME COLUMN c TO d
```

> 删除字段


```PostgreSQL
ALTER TABLE mytest1 DROP COLUMN d
```

### 约束

表中除了字段还有字段间的关系--约束.pg中的约束包括这么几种:

1. 主键约束,非空约束和唯一约束的结合,确保某列(或两个列多个列的结合)有唯一标识,有助于更容易更快速地找到表中的一个特定的记录.使用`ALTER TABLE {表名} ADD CONSTRAINT {约束名} PRIMARY KEY ({...字段名})`创建


2. 唯一约束,确保某列的值都是唯一的,使用`ALTER TABLE {表名} ADD CONSTRAINT {约束名} unique({字段名})`创建


3. 非空约束,指示某列不能存储 NULL 值,使用`ALTER TABLE {表名} MODIFY {字段名} {字段类型} NOT NULL`创建

4. 外键约束,保证一个表中的数据匹配另一个表中的值的参照完整性

5. CHECK约束,保证列中的值符合指定的条件,使用`ALTER TABLE {表名} ADD CONSTRAINT {约束名} CHECK ({条件})`

6. 排他约束,保证如果将任何两行的指定列或表达式使用指定操作符进行比较,至少其中一个操作符比较将会返回 false 或空值.使用条件`ALTER TABLE {表名} ADD CONSTRAINT {约束名} EXCLUSION ({条件})`


删除约束只能删除有名字的越是,使用语句`ALTER TABLE {表名} DROP CONSTRAINT {约束名}`.

### 默认值

关系数据库也允许为字段设置默认值,这样如果插入的行中对应字段没有值,插入就会用默认值替换空,默认值的处理类似修改字段名,也使用alter语句.

`ALTER TABLE {表名} ALTER COLUMN {字段名} SET DEFAULT {默认值};`

### 序列号生成器

序列号生成器用于实现`serial`数据类型值的自动递增分配.在创建 serial 字段时PostgreSQL 会自动为其创建一个相应的序列号生成器,但用户也可以很方便地更改其初始值,步长和下一个值.因为序列号生成器是独立对象,所以多个表可以共享同一个序列号生成器.基于该机制用户可以实现跨越多个表的唯一键.

### 索引

索引是用来加快表查找速度的对象,它必须依赖表和字段,使用`CREATE INDEX {index_name} ON {table_name} [USING {index_type}] ({字段名}[,{字段名}])`语法创建.

pg提供了多种索引类型:

+ `B-tree`可以在可排序数据上的处理等值和范围查询.特别地pg的查询规划器会在任何一种涉及到以下操作符的已索引列上考虑使用B-tree索引:

    + `<`
    + `<=`
    + `=`
    + `>=`
    + `>`
    + 将上述操作符组合起来的操作,例如`BETWEEN`和`IN`
    + `IS NULL`或`IS NOT NULL`判断操作
    + `like`和`~`等在模式是一个常量且被固定在字符串的开头时
    
    B-tree索引也可以用于检索排序数据.这并不会总是比简单扫描和排序更快但是总是有用的
    
+ `Hash`只能处理简单等值比较

+ `GiST`二维几何图形信息的基础索引.可以使用基本的[二维几何图形操作符](http://www.postgres.cn/docs/11/functions-geometry.html),如:

    + `<<`
    + `&<`
    + `&>`
    + `>>`
    + `<<|`
    + `&<|`
    + `|&>`
    + `|>>`
    + `@>`
    + `<@`
    + `~=`
    + `&&`

    同时也有能力优化最近邻搜索
 

+ `SP-GiST`,和GiST相似,`SP-GiST`索引为支持多种搜索提供了一种基础结构.`SP-GiST`允许实现众多不同的非平衡的基于磁盘的数据结构例如四叉树,k-d树和radix树,比如下面的操作符:

    + `<<`
    + `>>`
    + `~=`
    + `<@`
    + `<^`
    + `>^`
    
+ `GIN`,`倒排索引`,它适合于包含多个组成值的数据值,例如数组.倒排索引中为每一个组成值都包含一个单独的项,它可以高效地处理测试指定组成值是否存在的查询.`GIN`可以用于支持数组使用下列操作符的索引化[查询](http://www.postgres.cn/docs/11/functions-array.html)：

    + `<@`
    + `@>`
    + `=`
    + `&&`

+ `BRIN`块范围索引,存储有关存放在一个表的连续物理块范围上的值摘要信息.对于具有线性排序顺序的数据类型,被索引的数据对应于每个块范围的列中值的最小值和最大值,`BRIN`支持的操作符可以在[http://www.postgres.cn/docs/11/brin-builtin-opclasses.html#BRIN-BUILTIN-OPCLASSES-TABLE]查看

每一种索引类型使用了 一种不同的算法来适应不同类型的查询.默认情况下`CREATE INDEX`命令创建适合于大部分情况的`B-tree`索引.

`B-tree`,`GiST`,`GIN`和`BRIN`支持多列索引,最多可以指定32个列.一个B-tree索引可以用于条件中涉及到任意索引列子集的查询,但是当先导列(即最左边的那些列)上有约束条件时索引最为有效;一个GIN索引可以用于条件中涉及到任意索引列子集的查询.GIN的搜索效率与查询条件中使用哪些索引列无关;多列`BRIN`索引可以被用于涉及该索引被索引列的任意子集的查询条件.同样索引搜索效率与查询条件使用哪个索引列无关.



```PostgreSQL
CREATE INDEX test1_id_index ON mytest1 (a);
```

### 全文检索

全文检索(full text search,FTS)是一种基于自然语言的搜索机制.这种搜索机制有一些"智能"成分.与正则表达式搜索不同,全文检索能够基于语义来进行匹配查找,而不仅仅是纯粹的语法匹配.例如用户需要在一段长文本中搜索`running`这个词,那么命中的结果可能包含`run`,`running`,`jog`,`sprint`,`dash`等词.
全文检索功能依赖于FTS配置库,FTS 词典,FTS解析器这三个部件.有了它们PostgreSQL 原生的FTS功能即可正常使用.
一般场景下的全文检索靠这三个原生部件已经足够,但在涉及专业场景时搜索目标文本中会包括该领域专有词汇和特殊语法规则,此时需要用专门的FTS 部件来替换原生FTS部件.



> 删除索引

可以使用`DROP INDEX {index_name}`语句


```PostgreSQL
DROP INDEX test1_id_index
```

### 视图

大多数关系型数据库都支持视图,视图是基于表的一种抽象,通过它可以实现一次性查询多张表,也可以实现通过复杂运算来构造出虚拟字段.视图一般是只读的,但如果该视图基于单张实体表构建,pg支持对其进行修改.如果需要修改基于多张表关联而来的视图则可以针对视图编写触发器

可以理解为视图可以将查询和实际存储解耦.

创建视图可以使用:

```sql
CREATE [ OR REPLACE ] [ TEMP | TEMPORARY ] [ RECURSIVE ] VIEW {view_name} AS
SELECT column1, column2.....
FROM table_name
WHERE [condition];
```

指明`TEMP/TEMPORARY`则创建的时临时视图,指明`RECURSIVE`则创建的是递归视图

> 删除视图

`DROP VIEW {view name}`

### 物化视图

9.3 版还引入了对物化视图的支持,该机制通过对视图数据进行缓存来实现对常用查询的加速,缺点是查到的数据可能不是最新的.
其创建语法为:

```sql
materialized
CREATE [ OR REPLACE ] MATERIALIZED VIEW {view_name} AS
SELECT column1, column2.....
FROM table_name
WHERE [condition];
```

物化视图不会自动更新,需要手动刷新,需要更新时使用命令`REFRESH MATERIALIZED VIEW {view_name}`刷新

> 删除表


```PostgreSQL
DROP TABLE IF EXISTS mytest1
```


```PostgreSQL
DROP TABLE IF EXISTS my_test
```

### 行

表中的每一条数据被称为行,行是记录完整数据的最小单位.行可以执行插入,更新,删除操作,也可以执行查询操作.我们在test数据库中创建一个test表用于演示


```PostgreSQL
-- connection: postgres://postgres:postgres@localhost:5432/test
```


```PostgreSQL
-- autocommit: true
```

    switched autocommit mode to True


```PostgreSQL
CREATE TABLE IF NOT EXISTS test(
   a int4 PRIMARY KEY,
   b text,
   c numeric(12)
)
```

> 插入行


```PostgreSQL
INSERT INTO test (a,b,c) VALUES (1,'2',123.541)
```


```PostgreSQL
INSERT INTO test (a,b,c) VALUES (2,'3',13.41)
```


```PostgreSQL
INSERT INTO test (a,b,c) VALUES (3,'4',23.54)
```

> 修改行


```PostgreSQL
UPDATE test SET b = '22' WHERE a = 1
```

> 删除行


```PostgreSQL
DELETE FROM test WHERE a = 3
```

> 查询行


```PostgreSQL
SELECT * FROM test
```

    2 row(s) returned.



<table>
<thead>
<tr><th style="text-align: right;">  a</th><th style="text-align: right;">  b</th><th style="text-align: right;">  c</th></tr>
</thead>
<tbody>
<tr><td style="text-align: right;">  2</td><td style="text-align: right;">  3</td><td style="text-align: right;"> 13</td></tr>
<tr><td style="text-align: right;">  1</td><td style="text-align: right;"> 22</td><td style="text-align: right;">124</td></tr>
</tbody>
</table>


### 事务

事务是一次有限个数sql语句执行的全过程,事务具有以下四个标准属性,通常根据首字母缩写为`ACID`：

+ 原子性(Atomicity):事务作为一个整体被执行,包含在其中的对数据库的操作要么全部被执行,要么都不执行.
+ 一致性(Consistency):事务应确保数据库的状态从一个一致状态转变为另一个一致状态.一致状态的含义是数据库中的数据应满足完整性约束.
+ 隔离性(Isolation):多个事务并发执行时,一个事务的执行不应影响其他事务的执行.
+ 持久性(Durability):已被提交的事务对数据库的修改应该永久保存在数据库中


PG中所有sql操作都是事务.我们可以通过关键字`BEGIN/BEGIN TRANSACTION`-`COMMIT`-`ROLLBACK`构造事务



```PostgreSQL
BEGIN;
INSERT INTO test (a,b,c) VALUES (4,'22',41);
INSERT INTO test (a,b,c) VALUES (5,'32',123.1);
INSERT INTO test (a,b,c) VALUES (6,'24',1.541);
INSERT INTO test (a,b,c) VALUES (7,'12',141);
COMMIT;
```


```PostgreSQL
SELECT * FROM test
```

    6 row(s) returned.



<table>
<thead>
<tr><th style="text-align: right;">  a</th><th style="text-align: right;">  b</th><th style="text-align: right;">  c</th></tr>
</thead>
<tbody>
<tr><td style="text-align: right;">  2</td><td style="text-align: right;">  3</td><td style="text-align: right;"> 13</td></tr>
<tr><td style="text-align: right;">  1</td><td style="text-align: right;"> 22</td><td style="text-align: right;">124</td></tr>
<tr><td style="text-align: right;">  4</td><td style="text-align: right;"> 22</td><td style="text-align: right;"> 41</td></tr>
<tr><td style="text-align: right;">  5</td><td style="text-align: right;"> 32</td><td style="text-align: right;">123</td></tr>
<tr><td style="text-align: right;">  6</td><td style="text-align: right;"> 24</td><td style="text-align: right;">  2</td></tr>
<tr><td style="text-align: right;">  7</td><td style="text-align: right;"> 12</td><td style="text-align: right;">141</td></tr>
</tbody>
</table>


接下来的部分类似元编程一样,是用户可以对pg做自定义的部分

### 扩展

开发人员可以通过该机制将一组相关的函数,数据类型,数据类型转换器,用户自定义索引,表以及属性变量等对象打包成一个功能扩展包,该扩展包可以整体安装和删除.许多工具如piplinedb,timescaledb都是以扩展包的形式存在的.从 PostgreSQL 9.1版本之后一般推荐使用该机制来为数据库提供功能扩展.


安装扩展包时可以指定该包中所含有的成员对象安装到哪个schema,若不指定则默认会安装到 public schema 中。不建议采用默认设置,因为这会导致 public schema变得庞大复杂且难以管理,尤其是如果你将自己的数据表对象也都存入 public schema 中,那么情况会变得更糟糕.我们建议你创建一个独立的 schema 用于存放所有扩展包的对象,甚至为规模较大的扩展包单独创建一个 schema.为避免出现找不到新增扩展包对象的问题,请将这些新增的 schema 名称加入`search_path`变量中,这样就可以直接使用扩展包的功能而无须关注它到底安装到了哪个schema中.

也有一些扩展包明确要求必须安装到某个 schema 下,这种情况下你就不能自行指定了.

多个扩展包之间可能存在依赖关系.在PostgreSQL 9.6之前,我们需要了解这个依赖关系并把被依赖包先装好,但从9.6版开始,只需在安装时加上 `cascade`关键字PostgreSQL 就会自动安装当前扩展包所依赖的扩展包.

### 函数

pg内置了大量函数用于字符串处理,时间处理,或者统计数据,都保存在默认的 postgres 库中,同时用户可以编写自定义函数来对数据进行新增,修改,删除和复杂计算等操作.可以使用 PostgreSQL所支持的各种过程式语言来编码.函数支持返回以下数据类型:

+ 标量值(也就是单个值)
+ 数组
+ 单条记录以及记录集

其他数据库(比如mysql)将对数据进行增删改操作的函数称为"存储过程",把不进行增删改的函数叫作"函数",但 PostgreSQL 中并不区分.

### 内置编程语言

函数是以过程式语言编写的.PostgreSQL 默认支持三种内置编程语言:SQL,PL/pgSQL 以及 C 语言.可以通过`CREATE EXTENSION`或者`CREATE PRODCEDURAL LANGUAGE`命令来添加其他语言.目前较常用的语言是 PL/Python,PL/V8(即 JavaScript)以及 PL/R.



### 运算符

运算符本质上是以简单符号形式呈现的函数别名,例如 =,&& 等.PostgreSQL 支持自定义运算符.如果用户定义了自己的数据类型，那么一般来说需要再自定义一些运算符来与之配合工作.比如你定义了一个复数类型,那么你很有可能需要自定义` +、-、*、/ `这几个运算符来对复数进行运算.



### 外部表和外部数据封装器

外部表是一些虚拟表,通过它们可以直接在本地数据库中访问来自外部数据源的数据.只要数据映射关系配置正确外部表的用法就与普通表没有任何区别.外部表支持映射到以下类型的数据源：

+ CSV 文件
+ 另一个服务器上的 PostgreSQL 表
+ SQL Server 或 Oracle 这些异构数据库中的表
+ Redis 这样的 NoSQL 数据库
+ 甚至像 Twitter 或 Salesforce 这样的 Web 服务。

外部表映射关系的建立是通过配置外部数据封装器(foreign data wrapper，FDW)实现的.FDW是 PostgreSQL和外部数据源之间的一架"魔法桥",可实现两边数据的互联互通.其内部实现机制遵循 SQL 标准中的 MED(Management of External Data)规范。

许多无私的开发者已经为当下大部分流行的数据源开发了FDW 并已免费共享出来.你也可以通过创建自己的FDW来练习.FDW是通过扩展包机制实现的

### 触发器和触发器函数

绝大多数企业级数据库都支持触发器机制,该机制可以侦测到数据修改事件的发生.在 PostgreSQL 中当一个触发器被触发后系统会自动调用用户定义好的触发器函数.触发器的触发时机是可设置的,可以是语句级触发或者记录级触发也可以是修改前触发或修改后触发.


定义触发器时需要定义对应的触发器函数,这类函数与前面介绍过的普通函数有所不同,主要差异在于触发器函数可以通过系统内置变量来同时访问到修改前和修改后的数据.这样就可以实现对于非法的数据修改行为的识别和拦截.因此触发器函数一般会用于编写复杂校验逻辑,这类复杂逻辑通过check 约束是无法实现的.

PostgreSQL的触发器技术正在快速的演进之中.9.0 版引入了对`WITH`子句的支持,通过它可以实现带条件的记录级触发,即只有当某条记录符合指定的 `WHEN`条件时触发器才会被调用.9.0 版还引入了`UPDATE OF`子句.通过它可以实现精确到字段级的触发条件设置.仅当指定的字段内容被更改时才会激活触发器.9.1 版支持了针对视图的触发器.9.3 版支持了针对`DDL`的触发器.最后值得一提的是从 9.4 版开始针对外部表的触发器也获得了支持.


### catalog

catalog 的译法与 schema 存在相同的问题,翻译为"目录"后并不能让读者准确地理解其原意,反而容易造成混淆.catalog是系统级的schema,用于存储系统函数和系统元数据.每个database创建好以后默认都会含有两个catalog:

+ 一个名为 pg_catalog,用于存储 PostgreSQL 系统自带的函数,表,系统视图,数据类型转换器以及数据类型定义等元数据
+ 另一个是 information_schema,用于存储 ANSI 标准中所要求提供的元数据查询视图,这些视图遵从 ANSI SQL 标准的要求,以指定的格式向外界提供 PostgreSQL 元数据信息.

一直以来,PostgreSQL数据库的发展都严格地遵循着其"自由与开放"的核心理念.如果你足够了解这款数据库,会发现它几乎是一种可以"自我生长"的数据库.比如,它所有的核心设置都保存在系统表中,用户可以不受限地查看和修改这些数据,这为PostgreSQL提供了远超任何一种商业数据库的巨大灵活性(不过从另一个角度看,将这种灵活性称为"可破坏性"也未尝不可).只要仔细地研究一下pg_catalog你就可以了解到 PostgreSQL 这样一个庞大的系统是如何基于各种部件构建起来的.如果你有超级用户权限,那么可以直接修改`pg_catalog`的内容(当然,如果改得不对,那你的行为就跟搞破坏没什么两样了).

Information_schema catalog 在 MySQL 和 SQL Server 中也有.PostgreSQL 的 Information_schema 中最常用的视图一般有以下几个:columns 视图,列出了数据库中的所有字段;tables视图,列出了数据库中的所有表(包括视图);views 视图,列出了所有视图以及用于创建该视图的原始 SQL.


### 类型

类型是数据类型的简称.每种数据库产品和每种编程语言都会支持一系列的数据类型,比如整型,字符型,数组,二进制大对象(blob)等.除前述常见类型外,PostgreSQL还支持复合数据类型,这种类型可以是多种数据类型的一个组合,比如复数,极坐标,向量,张量等都是复合数据类型.

PostgreSQL 会自动为用户自己创建的表定义一个同名的复合数据类型.这样就可以把表记录当作对象实例来处理.当用户需要在函数中遍历表记录时,该特性特别有用.

### 数据类型转换器

数据类型转换器可以将一种数据类型转换为另一种,其底层通过调用转换函数来实现真正的转换逻辑.PostgreSQL支持用户自定义转换器或者重载,加强默认的转换器.

转换器可以被隐式调用也可以被显式调用.隐式转换是系统自动执行的,一般来说将一种特定数据类型转为更通用的数据类型(比如数字转换为字符串)时就会发生隐式类型转换.如果进行隐式转换时系统找不到合适的转换器你就必须显式执行转换动作.


