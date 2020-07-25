# DDL语句

DDL语句是用来创建或者删除存储数据用的数据库以及数据库中的表等对象.DDL包含以下几种指令:


+ `CREATE`: 创建数据库和表等对象

+ `DROP`: 删除数据库和表等对象

+ `ALTER`: 修改数据库和表等对象的结构


```PostgreSQL
-- connection: postgres://postgres:postgres@localhost:5432/postgres
```


```PostgreSQL
-- autocommit: true
```

    switched autocommit mode to True

## 数据库的创建和删除

数据库的创建使用语句`CREATE DATABASE <数据库名称>;`删除数据库使用`DROP DATABASE`,查看有哪些数据库则可以使用语句`SELECT datname FROM pg_database`


```PostgreSQL
CREATE DATABASE test
```


```PostgreSQL
SELECT datname FROM pg_database
```

    4 row(s) returned.
    


<table>
<thead>
<tr><th>datname  </th></tr>
</thead>
<tbody>
<tr><td>postgres </td></tr>
<tr><td>template1</td></tr>
<tr><td>template0</td></tr>
<tr><td>test     </td></tr>
</tbody>
</table>



```PostgreSQL
DROP DATABASE test
```


```PostgreSQL
SELECT datname FROM pg_database
```

    3 row(s) returned.
    


<table>
<thead>
<tr><th>datname  </th></tr>
</thead>
<tbody>
<tr><td>postgres </td></tr>
<tr><td>template1</td></tr>
<tr><td>template0</td></tr>
</tbody>
</table>


## schema 的创建和删除

PostgreSQL在创建一个新的database时会自动为其创建一个名为`public`的schema(类似国家之于首都,一省之于省会).如果未设置`search_path`变量,那么 PostgreSQL会将你创建的所有对象默认放入`public schema`中.如果表的数量较少这是没问题的,但如果你有几千张表,那么还是建议将它们分门别类放入不同的 schema中.

> 创建一个schema

创建schema使用语句`CREATE SCHEMA test_schema`


```PostgreSQL
CREATE SCHEMA test_schema
```

> 查看schema信息

查看database下schema的列表可以使用`SELECT nspname FROM pg_namespace`语句


```PostgreSQL
SELECT nspname FROM pg_namespace
```

    7 row(s) returned.
    


<table>
<thead>
<tr><th>nspname           </th></tr>
</thead>
<tbody>
<tr><td>pg_toast          </td></tr>
<tr><td>pg_temp_1         </td></tr>
<tr><td>pg_toast_temp_1   </td></tr>
<tr><td>pg_catalog        </td></tr>
<tr><td>public            </td></tr>
<tr><td>information_schema</td></tr>
<tr><td>test_schema       </td></tr>
</tbody>
</table>


> 删除schema

与删除database类似的我们也可以删除schema,使用语句`DROP SCHEMA IF EXISTS <schema>`


```PostgreSQL
DROP SCHEMA IF EXISTS test_schema
```


```PostgreSQL
SELECT nspname FROM pg_namespace
```

    6 row(s) returned.
    


<table>
<thead>
<tr><th>nspname           </th></tr>
</thead>
<tbody>
<tr><td>pg_toast          </td></tr>
<tr><td>pg_temp_1         </td></tr>
<tr><td>pg_toast_temp_1   </td></tr>
<tr><td>pg_catalog        </td></tr>
<tr><td>public            </td></tr>
<tr><td>information_schema</td></tr>
</tbody>
</table>


## 表的创建和删除

> 创建表

建表操作非常容易重复表名,为了避免重复我们可以使用命令`IF NOT EXISTS`避免.
创建表的格式为:

```sql
CREATE TABLE IF NOT EXISTS [<Schema>.]<表名>(
    <字段名> <字段类型> [DEFAULT <默认值>} [...<字段约束>]],
     ...,
     [...<表约束>]
)
```
默认情况下如果不指名schema,那么表将会建立在`public`这个schema上.

通常我个人不建议将约束和建表混在一起写,而更建议分为创建和定义约束两步,这样更加清晰.


```PostgreSQL
CREATE TABLE IF NOT EXISTS my_test(
   a text DEFAULT 'a',
   b text DEFAULT 'b'
)
```

> 查看表信息

pg中可以通过语句`SELECT * FROM information_schema.tables WHERE table_schema = '<schema名>';`语句来查看库中有什么表.通常`schema`默认都是`public`,我们通常关心的字段主要是`table_name,table_schema`


```PostgreSQL
SELECT table_name,table_schema FROM information_schema.tables WHERE table_schema = 'public'
```

    3 row(s) returned.
    


<table>
<thead>
<tr><th>table_name  </th><th>table_schema  </th></tr>
</thead>
<tbody>
<tr><td>mytest1     </td><td>public        </td></tr>
<tr><td>my_test     </td><td>public        </td></tr>
<tr><td>commodity   </td><td>public        </td></tr>
</tbody>
</table>


而查看表的结构则可以使用语句`SELECT * FROM information_schema.columns WHERE table_name ='<表名>';`通常我们比较关心的是`column_name,column_default,is_nullable,data_type`这几个字段.


```PostgreSQL
SELECT column_name,column_default,is_nullable,data_type FROM information_schema.columns WHERE table_name ='my_test';
```

    2 row(s) returned.
    


<table>
<thead>
<tr><th>column_name  </th><th>column_default  </th><th>is_nullable  </th><th>data_type  </th></tr>
</thead>
<tbody>
<tr><td>a            </td><td>&#x27;a&#x27;::text       </td><td>YES          </td><td>text       </td></tr>
<tr><td>b            </td><td>&#x27;b&#x27;::text       </td><td>YES          </td><td>text       </td></tr>
</tbody>
</table>


> 修改表名

修改表名使用语句`ALTER TABLE <旧表名> RENAME TO <新表名> `


```PostgreSQL
ALTER TABLE my_test RENAME TO mytest1
```

    relation "mytest1" already exists
    


```PostgreSQL
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
```

    3 row(s) returned.
    


<table>
<thead>
<tr><th>table_name  </th></tr>
</thead>
<tbody>
<tr><td>mytest1     </td></tr>
<tr><td>my_test     </td></tr>
<tr><td>commodity   </td></tr>
</tbody>
</table>


### 字段(列)

在创建一个表的时候我们就必须先定义好这个表有什么字段,这些字段分别是什么类型,有什么约束条件制约,有什么默认值,怎么加索引等.


比较常见的字段操作是修改字段,修改字段:

> 新增字段

新增字段使用语句`ALTER TABLE <表名> ADD <字段名> <字段类型>....`


```PostgreSQL
ALTER TABLE mytest1 ADD c float
```


```PostgreSQL
SELECT column_name,column_default,is_nullable,data_type FROM information_schema.columns WHERE table_name ='mytest1';
```

    3 row(s) returned.
    


<table>
<thead>
<tr><th>column_name  </th><th>column_default  </th><th>is_nullable  </th><th>data_type       </th></tr>
</thead>
<tbody>
<tr><td>a            </td><td>&#x27;abc&#x27;::text     </td><td>YES          </td><td>text            </td></tr>
<tr><td>b            </td><td>&#x27;b&#x27;::text       </td><td>YES          </td><td>text            </td></tr>
<tr><td>c            </td><td>                </td><td>YES          </td><td>double precision</td></tr>
</tbody>
</table>


> 修改字段的数据类型

修改字段的数据类型可以使用语句`ALTER TABLE <表名> ALTER COLUMN <字段名> TYPE <类型名>`,数据类型和数据库管理系统的实现有关,不同的数据库管理系统数据类型往往不一样,这不是本文的重点,本文以pg作为运行平台因此使用pg的类型系统,具体可以看[这篇]()


```PostgreSQL
ALTER TABLE mytest1 ALTER COLUMN c TYPE text
```


```PostgreSQL
SELECT column_name,column_default,is_nullable,data_type FROM information_schema.columns WHERE table_name ='mytest1';
```

    3 row(s) returned.
    


<table>
<thead>
<tr><th>column_name  </th><th>column_default  </th><th>is_nullable  </th><th>data_type  </th></tr>
</thead>
<tbody>
<tr><td>a            </td><td>&#x27;abc&#x27;::text     </td><td>YES          </td><td>text       </td></tr>
<tr><td>b            </td><td>&#x27;b&#x27;::text       </td><td>YES          </td><td>text       </td></tr>
<tr><td>c            </td><td>                </td><td>YES          </td><td>text       </td></tr>
</tbody>
</table>


> 修改默认值

修改默认值使用语句`ALTER TABLE <表名> ALTER COLUMN <字段名> SET DEFAULT <新默认值>;`


```PostgreSQL
ALTER TABLE mytest1 ALTER COLUMN a SET DEFAULT 'abc'
```


```PostgreSQL
SELECT column_name,column_default,is_nullable,data_type FROM information_schema.columns WHERE table_name ='mytest1';
```

    3 row(s) returned.
    


<table>
<thead>
<tr><th>column_name  </th><th>column_default  </th><th>is_nullable  </th><th>data_type  </th></tr>
</thead>
<tbody>
<tr><td>a            </td><td>&#x27;abc&#x27;::text     </td><td>YES          </td><td>text       </td></tr>
<tr><td>b            </td><td>&#x27;b&#x27;::text       </td><td>YES          </td><td>text       </td></tr>
<tr><td>c            </td><td>                </td><td>YES          </td><td>text       </td></tr>
</tbody>
</table>


> 修改字段名

修改字段名可以使用语句`ALTER TABLE <表名> RENAME COLUMN <旧列名> TO <新列名>`



```PostgreSQL
ALTER TABLE mytest1 RENAME COLUMN c TO d
```


```PostgreSQL
SELECT column_name,column_default,is_nullable,data_type FROM information_schema.columns WHERE table_name ='mytest1';
```

    3 row(s) returned.
    


<table>
<thead>
<tr><th>column_name  </th><th>column_default  </th><th>is_nullable  </th><th>data_type  </th></tr>
</thead>
<tbody>
<tr><td>a            </td><td>&#x27;abc&#x27;::text     </td><td>YES          </td><td>text       </td></tr>
<tr><td>b            </td><td>&#x27;b&#x27;::text       </td><td>YES          </td><td>text       </td></tr>
<tr><td>d            </td><td>                </td><td>YES          </td><td>text       </td></tr>
</tbody>
</table>


> 删除字段

删除字段使用`ALTER TABLE <表名> DROP COLUMN <列名>`


```PostgreSQL
ALTER TABLE mytest1 DROP COLUMN d
```


```PostgreSQL
SELECT column_name,column_default,is_nullable,data_type FROM information_schema.columns WHERE table_name ='mytest1';
```

    2 row(s) returned.
    


<table>
<thead>
<tr><th>column_name  </th><th>column_default  </th><th>is_nullable  </th><th>data_type  </th></tr>
</thead>
<tbody>
<tr><td>a            </td><td>&#x27;abc&#x27;::text     </td><td>YES          </td><td>text       </td></tr>
<tr><td>b            </td><td>&#x27;b&#x27;::text       </td><td>YES          </td><td>text       </td></tr>
</tbody>
</table>


### 约束

表中除了字段还有字段间的关系--约束.通常约束包括这么几种:

1. 主键约束,非空约束和唯一约束的结合,确保某列(或两个列多个列的结合)有唯一标识,有助于更容易更快速地找到表中的一个特定的记录.使用

    ```sql
    ALTER TABLE <表名> ADD CONSTRAINT <约束名> PRIMARY KEY (<...字段名>)
    ```

    创建,注意一些数据库管理系统是依赖主键的,因此在建表时就一定会有一个主键,比如mysql.


2. 唯一约束,确保某列的值都是唯一的,使用
    ```sql
    ALTER TABLE <表名> ADD CONSTRAINT <约束名> unique(<字段名>)
    ```
    创建


3. 非空约束,指示某列不能存储 NULL 值,使用

    ```sql
    ALTER TABLE <表名> MODIFY <字段名> <字段类型> NOT NULL
    ```
    创建

4. 外键约束,保证一个表中的数据匹配另一个表中的值的参照完整性

5. CHECK约束,保证列中的值符合指定的条件,使用

    ```sql
    ALTER TABLE <表名> ADD CONSTRAINT <约束名> CHECK (<条件>)
    ```

6. 排他约束,保证如果将任何两行的指定列或表达式使用指定操作符进行比较,至少其中一个操作符比较将会返回 false或空值.使用条件
    ```sql
    ALTER TABLE <表名> ADD CONSTRAINT <约束名> EXCLUSION (<条件>)
    ```


pg中删除约束只能删除有名字的约束,使用语句

```sql
ALTER TABLE <表名> DROP CONSTRAINT <约束名>
```

## 索引

索引通常和数据库管理系统的实现有关,本文不做具体介绍,这块会在讲postgresql的时候单独介绍,不过多数情况下可以使用语句
```sql
CREATE INDEX <索引名> ON <表名> (<列名>[,...<列名>])
```

## 注释

我们可以在SQL语句中添加注释,当然也可以为表,字段等实体添加注释以方便维护,这在SQL语法中是没有规定的,因此各个数据库管理程序的实现是不一致的,pg中使用`COMMENT ON`语句来管理这种注释.

> 创建表注释

```sql
COMMENT ON TABLE <表名> IS '<注释内容>';
```

> 创建列注释

```sql
COMMENT ON COLUMN <表名>.<列名> IS '<注释内容>';
```
> 删除注释

删除注释实际上就是将上面的创建煮熟的注释内容部分填为`NULL`



```PostgreSQL
COMMENT ON TABLE mytest1 IS '测试表'
```


```PostgreSQL
COMMENT ON COLUMN mytest1.a IS '测试字段'
```

> 查看字段注释

pg中查看字段注释使用如下语句,我们以查看`mytest1`表的字段注释为例


```PostgreSQL
SELECT  
a.attname as 字段名,  
col_description(a.attrelid,a.attnum) as 注释,  
concat_ws('',t.typname,SUBSTRING(format_type(a.atttypid,a.atttypmod) from '\(.*\)')) as 字段类型
FROM  
pg_class as c,  
pg_attribute as a,  
pg_type as t  
WHERE  
c.relname = 'mytest1'  
and a.atttypid = t.oid  
and a.attrelid = c.oid  
and a.attnum>0;
```

    2 row(s) returned.
    


<table>
<thead>
<tr><th>字段名  </th><th>注释    </th><th>字段类型  </th></tr>
</thead>
<tbody>
<tr><td>a       </td><td>测试字段</td><td>text      </td></tr>
<tr><td>b       </td><td>        </td><td>text      </td></tr>
</tbody>
</table>


> 删除表

删除表使用语句`DROP TABLE IF EXISTS <表名>`


```PostgreSQL
DROP TABLE IF EXISTS mytest1
```

    NOTICE:  table "mytest1" does not exist, skipping
    
