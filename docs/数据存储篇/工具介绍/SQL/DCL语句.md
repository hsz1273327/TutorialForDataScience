# DCL语句

DCL语句是用来确认或者取消对数据库中的数据进行变更的语句;除此之外还可以对数据库管理系统中的用户是否有权限操作数据库中的对象进行设定.DCL 包含以下几种指令:

+ `COMMIT`：确认对数据库中的数据进行的变更

+ `ROLLBACK`：取消对数据库中的数据进行的变更

+ `GRANT`：赋予用户操作权限

+ `REVOKE`：取消用户的操作权限


由于本文的目的是让读者可以用SQL语句执行任务,而`GRANT`和`REVOKE`更多的是运维人员管理,因此本文只讲前两个也就是事务相关的DCL语句.


```PostgreSQL
-- connection: postgres://postgres:postgres@localhost:5432/postgres
```


```PostgreSQL
-- autocommit: false
```

    switched autocommit mode to False

## 准备工作

本文依然使用商品表来作为例子,只是其中的数据和表结构略有改变

> 商品表

商品名|品牌|颜色款式|商品种类|商品价格|进货价格|登记日期
---|---|---|---|---|---|---
ATS001|A|黑白宽条纹款|T恤|59|30|2019-06-02 10:00:00
ATS002|A|蓝白宽条纹款|T恤|79|40|2020-03-02 10:00:00
ATSY001|A|蓝白宽条纹初音限定款|T恤|299|45|2020-04-02 10:00:00
BTS001|B|黑白宽条纹款|T恤|59|30|2020-02-02 10:00:00
BTS002|B|蓝白宽条纹款|T恤|79|40|2020-03-02 10:00:00
BTSY001|B|纯白款|T恤|49|20|2020-04-02 10:00:00
ASS000|A|黑色款|短裤|99|60|2020-03-05 10:00:00
ASS001|A|米色款|短裤|99|60|2020-03-05 10:00:00
ASSY001|A|米色底红色花纹超人限定款|短裤|599|140|2020-04-02 10:00:00
BSS001|B|黑色款|短裤|89|50|2020-03-05 10:00:00
BSS002|B|黑底白花款|短裤|96|60|2019-10-05 10:00:00
BSS003|B|白底红花款|短裤|96|60|2020-03-05 10:00:00


```PostgreSQL
CREATE TABLE IF NOT EXISTS Commodity
(id     serial4    PRIMARY KEY,-- 商品id,
 name    VARCHAR(100) NOT NULL UNIQUE,-- 商品名
 brand   VARCHAR(32)  NOT NULL, -- 品牌
 style   VARCHAR(100) NOT NULL, -- 款式
 type    VARCHAR(32)  NOT NULL, -- 商品类型
 sale_price      INT4      DEFAULT 0, -- 售价
 purchase_price  INT4      , -- 进价
 ctime     TIMESTAMPTZ  DEFAULT (now()) --商品录入的时间,默认为当前时间
)
```


```PostgreSQL
INSERT INTO Commodity ( 
    name,
    brand,
    style,
    type,
    sale_price,
    purchase_price ,
    ctime
) VALUES (
    'ATS001',
    'A',
    '黑白宽条纹款',
    'T恤',
    59,
    30,
    '2019-06-02T10:00:00.000Z'
),
(
    'ATS002',
    'A',
    '蓝白宽条纹款',
    'T恤',
    79,
    40,
    '2020-03-02T10:00:00.000Z'
),
(
    'ATSY001',
    'A',
    '蓝白宽条纹初音限定款',
    'T恤',
    299,
    45,
    '2020-04-02T10:00:00.000Z'
),
(
    'BTS001',
    'B',
    '黑白宽条纹款',
    'T恤',
    59,
    30,
    '2020-02-02T10:00:00.000Z'
),
(
    'BTS002',
    'B',
    '蓝白宽条纹款',
    'T恤',
    79,
    40,
    '2020-03-02T10:00:00.000Z'
),

(
    'BTSY001',
    'B',
    '纯白款',
    'T恤',
    49,
    20,
    '2020-04-02T10:00:00.000Z'
),
(
    'ASS000',
    'A',
    '黑色款',
    '短裤',
    99,
    60,
    '2020-03-05T10:00:00.000Z'
),
(
    'ASS001',
    'A',
    '米色款',
    '短裤',
    99,
    60,
    '2020-03-05T10:00:00.000Z'
),
(
    'ASSY001',
    'A',
    '米色底红色花纹超人限定款',
    '短裤',
    599,
    140,
    '2020-04-02T10:00:00.000Z'
),


(
    'BSS001',
    'B',
    '黑色款',
    '短裤',
    89,
    50,
    '2020-03-05T10:00:00.000Z'
),
(
    'BSS002',
    'B',
    '黑底白花款',
    '短裤',
    96,
    60,
    '2019-10-05T10:00:00.000Z'
),
(
    'BSS003',
    'B',
    '白底红花款',
    '短裤',
    96,
    60,
    '2020-03-05T10:00:00.000Z'
)
```


```PostgreSQL
SELECT * FROM Commodity
```

    12 row(s) returned.
    


<table>
<thead>
<tr><th style="text-align: right;">  id</th><th>name   </th><th>brand  </th><th>style                   </th><th>type  </th><th style="text-align: right;">  sale_price</th><th style="text-align: right;">  purchase_price</th><th>ctime                    </th></tr>
</thead>
<tbody>
<tr><td style="text-align: right;">   1</td><td>ATS001 </td><td>A      </td><td>黑白宽条纹款            </td><td>T恤   </td><td style="text-align: right;">          59</td><td style="text-align: right;">              30</td><td>2019-06-02 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">   2</td><td>ATS002 </td><td>A      </td><td>蓝白宽条纹款            </td><td>T恤   </td><td style="text-align: right;">          79</td><td style="text-align: right;">              40</td><td>2020-03-02 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">   3</td><td>ATSY001</td><td>A      </td><td>蓝白宽条纹初音限定款    </td><td>T恤   </td><td style="text-align: right;">         299</td><td style="text-align: right;">              45</td><td>2020-04-02 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">   4</td><td>BTS001 </td><td>B      </td><td>黑白宽条纹款            </td><td>T恤   </td><td style="text-align: right;">          59</td><td style="text-align: right;">              30</td><td>2020-02-02 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">   5</td><td>BTS002 </td><td>B      </td><td>蓝白宽条纹款            </td><td>T恤   </td><td style="text-align: right;">          79</td><td style="text-align: right;">              40</td><td>2020-03-02 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">   6</td><td>BTSY001</td><td>B      </td><td>纯白款                  </td><td>T恤   </td><td style="text-align: right;">          49</td><td style="text-align: right;">              20</td><td>2020-04-02 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">   7</td><td>ASS000 </td><td>A      </td><td>黑色款                  </td><td>短裤  </td><td style="text-align: right;">          99</td><td style="text-align: right;">              60</td><td>2020-03-05 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">   8</td><td>ASS001 </td><td>A      </td><td>米色款                  </td><td>短裤  </td><td style="text-align: right;">          99</td><td style="text-align: right;">              60</td><td>2020-03-05 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">   9</td><td>ASSY001</td><td>A      </td><td>米色底红色花纹超人限定款</td><td>短裤  </td><td style="text-align: right;">         599</td><td style="text-align: right;">             140</td><td>2020-04-02 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">  10</td><td>BSS001 </td><td>B      </td><td>黑色款                  </td><td>短裤  </td><td style="text-align: right;">          89</td><td style="text-align: right;">              50</td><td>2020-03-05 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">  11</td><td>BSS002 </td><td>B      </td><td>黑底白花款              </td><td>短裤  </td><td style="text-align: right;">          96</td><td style="text-align: right;">              60</td><td>2019-10-05 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">  12</td><td>BSS003 </td><td>B      </td><td>白底红花款              </td><td>短裤  </td><td style="text-align: right;">          96</td><td style="text-align: right;">              60</td><td>2020-03-05 10:00:00+00:00</td></tr>
</tbody>
</table>


## 事务

事务是对表中数据进行更新的单位,简单来讲事务就是需要在同一个处理单元中执行的一系列更新处理的集合.从定义可以看出事务时针对写操作的,我们的更新往往不是一次执行就结束的,而是需要执行一连串的操作才能实现的,这种时候事务就有用了.

事务语句如下:

```SQL
事务开始语句;

      DML语句①;
      DML语句②;
      DML语句③;
         .
         .
         .
事务结束语句(COMMIT或者ROLLBACK)
```

其中`DML语句`特指写操作.

需要注意不同的数据库管理系统会使用不同的事务开始语句,针对`POSTGRESQL`事务开始语句使用的是`BEGIN TRANSACTION`;但事务结束语句则都是一样的.

###  ACID特性

所有数据库管理系统的事务都遵循四种特性,将这四种特性的首字母结合起来统称为`ACID特性`这是所有数据库管理系统都必须遵守的规则.

他们是

1. 原子性(Atomicity)原子性是指在事务结束时其中所包含的更新处理要么全部执行要么完全不执行.

2. 一致性(Consistency)一致性指的是事务中包含的处理要满足数据库提前设置的约束,如主键约束或者`NOT NULL`约束等.对事务来说这些不合法的SQL会被回滚.

3. 隔离性(Isolation)隔离性指的是保证不同事务之间互不干扰的特性.该特性保证了事务之间不会互相嵌套.此外在某个事务中进行的更改,在该事务结束之前对其他事务而言是不可见的.因此即使某个事务向表中添加了记录,在没有提交之前其他事务也是看不到新添加的记录的.

4. 持久性(Durability)持久性也可以称为耐久性,指的是在事务(不论是提交还是回滚)结束后数据库管理系统能够保证该时间点的数据状态会被保存的特性.即使由于系统故障导致数据丢失数据库也一定能通过某种手段进行恢复.


> 将商品表中的T恤价格上调5元,短裤价格下调5元.

如果不使用事务的话那就时两条语句分别执行,这也就意味着如果不小心的话可能会出现只为T恤涨价或者只为短裤降价的操作,而使用事务的话就不会出现这个问题.


### COMMIT提交

正如上面的例子`COMMIT`子句会结束事务并将整个事务执行完成


```PostgreSQL
BEGIN TRANSACTION;

    UPDATE Commodity
       SET sale_price = sale_price + 5
     WHERE type = 'T恤';

    UPDATE Commodity
       SET sale_price = sale_price - 5
     WHERE type = '短裤';

COMMIT;
```

    WARNING:  there is already a transaction in progress
    


```PostgreSQL
SELECT * FROM Commodity
```

    12 row(s) returned.
    


<table>
<thead>
<tr><th style="text-align: right;">  id</th><th>name   </th><th>brand  </th><th>style                   </th><th>type  </th><th style="text-align: right;">  sale_price</th><th style="text-align: right;">  purchase_price</th><th>ctime                    </th></tr>
</thead>
<tbody>
<tr><td style="text-align: right;">   1</td><td>ATS001 </td><td>A      </td><td>黑白宽条纹款            </td><td>T恤   </td><td style="text-align: right;">          64</td><td style="text-align: right;">              30</td><td>2019-06-02 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">   2</td><td>ATS002 </td><td>A      </td><td>蓝白宽条纹款            </td><td>T恤   </td><td style="text-align: right;">          84</td><td style="text-align: right;">              40</td><td>2020-03-02 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">   3</td><td>ATSY001</td><td>A      </td><td>蓝白宽条纹初音限定款    </td><td>T恤   </td><td style="text-align: right;">         304</td><td style="text-align: right;">              45</td><td>2020-04-02 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">   4</td><td>BTS001 </td><td>B      </td><td>黑白宽条纹款            </td><td>T恤   </td><td style="text-align: right;">          64</td><td style="text-align: right;">              30</td><td>2020-02-02 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">   5</td><td>BTS002 </td><td>B      </td><td>蓝白宽条纹款            </td><td>T恤   </td><td style="text-align: right;">          84</td><td style="text-align: right;">              40</td><td>2020-03-02 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">   6</td><td>BTSY001</td><td>B      </td><td>纯白款                  </td><td>T恤   </td><td style="text-align: right;">          54</td><td style="text-align: right;">              20</td><td>2020-04-02 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">   7</td><td>ASS000 </td><td>A      </td><td>黑色款                  </td><td>短裤  </td><td style="text-align: right;">          94</td><td style="text-align: right;">              60</td><td>2020-03-05 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">   8</td><td>ASS001 </td><td>A      </td><td>米色款                  </td><td>短裤  </td><td style="text-align: right;">          94</td><td style="text-align: right;">              60</td><td>2020-03-05 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">   9</td><td>ASSY001</td><td>A      </td><td>米色底红色花纹超人限定款</td><td>短裤  </td><td style="text-align: right;">         594</td><td style="text-align: right;">             140</td><td>2020-04-02 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">  10</td><td>BSS001 </td><td>B      </td><td>黑色款                  </td><td>短裤  </td><td style="text-align: right;">          84</td><td style="text-align: right;">              50</td><td>2020-03-05 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">  11</td><td>BSS002 </td><td>B      </td><td>黑底白花款              </td><td>短裤  </td><td style="text-align: right;">          91</td><td style="text-align: right;">              60</td><td>2019-10-05 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">  12</td><td>BSS003 </td><td>B      </td><td>白底红花款              </td><td>短裤  </td><td style="text-align: right;">          91</td><td style="text-align: right;">              60</td><td>2020-03-05 10:00:00+00:00</td></tr>
</tbody>
</table>


### ROLLBACK回滚

如果打算反悔,那么可以不使用`COMMIT`提交而是使用`ROLLBACK`,它将会将表格返回会事务开始前的状态.


```PostgreSQL
BEGIN TRANSACTION;

    UPDATE Commodity
       SET sale_price = sale_price + 5
     WHERE type = 'T恤';

    UPDATE Commodity
       SET sale_price = sale_price - 5
     WHERE type = '短裤';

ROLLBACK;
```


```PostgreSQL
SELECT * FROM Commodity
```

    12 row(s) returned.
    


<table>
<thead>
<tr><th style="text-align: right;">  id</th><th>name   </th><th>brand  </th><th>style                   </th><th>type  </th><th style="text-align: right;">  sale_price</th><th style="text-align: right;">  purchase_price</th><th>ctime                    </th></tr>
</thead>
<tbody>
<tr><td style="text-align: right;">   1</td><td>ATS001 </td><td>A      </td><td>黑白宽条纹款            </td><td>T恤   </td><td style="text-align: right;">          64</td><td style="text-align: right;">              30</td><td>2019-06-02 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">   2</td><td>ATS002 </td><td>A      </td><td>蓝白宽条纹款            </td><td>T恤   </td><td style="text-align: right;">          84</td><td style="text-align: right;">              40</td><td>2020-03-02 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">   3</td><td>ATSY001</td><td>A      </td><td>蓝白宽条纹初音限定款    </td><td>T恤   </td><td style="text-align: right;">         304</td><td style="text-align: right;">              45</td><td>2020-04-02 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">   4</td><td>BTS001 </td><td>B      </td><td>黑白宽条纹款            </td><td>T恤   </td><td style="text-align: right;">          64</td><td style="text-align: right;">              30</td><td>2020-02-02 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">   5</td><td>BTS002 </td><td>B      </td><td>蓝白宽条纹款            </td><td>T恤   </td><td style="text-align: right;">          84</td><td style="text-align: right;">              40</td><td>2020-03-02 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">   6</td><td>BTSY001</td><td>B      </td><td>纯白款                  </td><td>T恤   </td><td style="text-align: right;">          54</td><td style="text-align: right;">              20</td><td>2020-04-02 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">   7</td><td>ASS000 </td><td>A      </td><td>黑色款                  </td><td>短裤  </td><td style="text-align: right;">          94</td><td style="text-align: right;">              60</td><td>2020-03-05 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">   8</td><td>ASS001 </td><td>A      </td><td>米色款                  </td><td>短裤  </td><td style="text-align: right;">          94</td><td style="text-align: right;">              60</td><td>2020-03-05 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">   9</td><td>ASSY001</td><td>A      </td><td>米色底红色花纹超人限定款</td><td>短裤  </td><td style="text-align: right;">         594</td><td style="text-align: right;">             140</td><td>2020-04-02 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">  10</td><td>BSS001 </td><td>B      </td><td>黑色款                  </td><td>短裤  </td><td style="text-align: right;">          84</td><td style="text-align: right;">              50</td><td>2020-03-05 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">  11</td><td>BSS002 </td><td>B      </td><td>黑底白花款              </td><td>短裤  </td><td style="text-align: right;">          91</td><td style="text-align: right;">              60</td><td>2019-10-05 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">  12</td><td>BSS003 </td><td>B      </td><td>白底红花款              </td><td>短裤  </td><td style="text-align: right;">          91</td><td style="text-align: right;">              60</td><td>2020-03-05 10:00:00+00:00</td></tr>
</tbody>
</table>


## 收尾


```PostgreSQL
DROP TABLE IF EXISTS Commodity
```
