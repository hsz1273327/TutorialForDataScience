# 使用view保存查询


`VIEW`通常翻译位`视图`,它的作用是固化查询,从SQL的角度来看视图和表是相同的,两者的区别在于表中保存的是实际的数据而视图中保存的是查询.

通常我们可以将常用的查询语句做成视图来使用.

使用视图有如下优点:

1. 不用真的存数据.视图本质上只是查询,因此不会有额外数据存储.
2. 不用考虑数据同步的问题,视图是查询,因此数据永远是最新的,不会存在因为数据同步造成的不一致问题.
3. 切换数据源方便,如果查询都是走的view,那么如果底层的数据源需要有变化换一张表只需要在view中修改`FROM`子句的内容即可,对外部使用是无感的

基于这两点,许多数据库实践中会要求所有的交互层使用视图而不是直接读取表中结果.


```PostgreSQL
-- connection: postgres://postgres:postgres@localhost:5432/postgres
```


```PostgreSQL
-- autocommit: true
```

    switched autocommit mode to True

## 准备工作

本文使用的样例表是一张商品表.


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


## 视图的创建

创建视图需要使用CREATE VIEW语句:

```SQL
CREATE VIEW 视图名称(<视图列名1>, <视图列名2>, ……)
AS
<SELECT语句>
```

视图的创建也是有限制的,具体就是:

+ 不能使用`ORDER BY`语句排序结果
+ 只可对其进行有限制的更新,即只有满足:
    1. `SELECT`子句中未使用`DISTINCT`
    2. `FROM`子句中只有一张表
    3. 未使用`GROUP BY`子句
    4. 未使用`HAVING`子句

可以认为,必须是没有聚合操作的视图才可以修改.
> 构造一个查询短裤类商品的view


```PostgreSQL
CREATE VIEW Short
AS (
SELECT * 
    FROM Commodity
    WHERE type='短裤'
)
```

## 视图的查询


视图和表在查询上是一样的用法


```PostgreSQL
SELECT * FROM Short
```

    6 row(s) returned.
    


<table>
<thead>
<tr><th style="text-align: right;">  id</th><th>name   </th><th>brand  </th><th>style                   </th><th>type  </th><th style="text-align: right;">  sale_price</th><th style="text-align: right;">  purchase_price</th><th>ctime                    </th></tr>
</thead>
<tbody>
<tr><td style="text-align: right;">   7</td><td>ASS000 </td><td>A      </td><td>黑色款                  </td><td>短裤  </td><td style="text-align: right;">          99</td><td style="text-align: right;">              60</td><td>2020-03-05 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">   8</td><td>ASS001 </td><td>A      </td><td>米色款                  </td><td>短裤  </td><td style="text-align: right;">          99</td><td style="text-align: right;">              60</td><td>2020-03-05 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">   9</td><td>ASSY001</td><td>A      </td><td>米色底红色花纹超人限定款</td><td>短裤  </td><td style="text-align: right;">         599</td><td style="text-align: right;">             140</td><td>2020-04-02 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">  10</td><td>BSS001 </td><td>B      </td><td>黑色款                  </td><td>短裤  </td><td style="text-align: right;">          89</td><td style="text-align: right;">              50</td><td>2020-03-05 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">  11</td><td>BSS002 </td><td>B      </td><td>黑底白花款              </td><td>短裤  </td><td style="text-align: right;">          96</td><td style="text-align: right;">              60</td><td>2019-10-05 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">  12</td><td>BSS003 </td><td>B      </td><td>白底红花款              </td><td>短裤  </td><td style="text-align: right;">          96</td><td style="text-align: right;">              60</td><td>2020-03-05 10:00:00+00:00</td></tr>
</tbody>
</table>


## 视图的删除

删除视图需要使用`DROP VIEW`语句


```PostgreSQL
DROP VIEW Short
```

## 收尾



```PostgreSQL
DROP TABLE IF EXISTS Commodity
```
