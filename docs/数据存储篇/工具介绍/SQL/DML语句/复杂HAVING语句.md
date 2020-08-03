# 复杂HAVING语句

HAVING语句在[聚合查询]()部分已经有简单介绍.我们知道了它是一种特殊的语句用于对`组`进行判断筛选.实际上`HAVING`可以实现相当多的功能.


```PostgreSQL
-- connection: postgres://postgres:postgres@localhost:5432/postgres
```


```PostgreSQL
-- autocommit: true
```

    switched autocommit mode to True

## 准备工作

本文依然使用商品表,品牌A的每年销售金额统计表,以及商品店铺关系表来作为例子

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
(
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
<tr><th>name   </th><th>brand  </th><th>style                   </th><th>type  </th><th style="text-align: right;">  sale_price</th><th style="text-align: right;">  purchase_price</th><th>ctime                    </th></tr>
</thead>
<tbody>
<tr><td>ATS001 </td><td>A      </td><td>黑白宽条纹款            </td><td>T恤   </td><td style="text-align: right;">          59</td><td style="text-align: right;">              30</td><td>2019-06-02 10:00:00+00:00</td></tr>
<tr><td>ATS002 </td><td>A      </td><td>蓝白宽条纹款            </td><td>T恤   </td><td style="text-align: right;">          79</td><td style="text-align: right;">              40</td><td>2020-03-02 10:00:00+00:00</td></tr>
<tr><td>ATSY001</td><td>A      </td><td>蓝白宽条纹初音限定款    </td><td>T恤   </td><td style="text-align: right;">         299</td><td style="text-align: right;">              45</td><td>2020-04-02 10:00:00+00:00</td></tr>
<tr><td>BTS001 </td><td>B      </td><td>黑白宽条纹款            </td><td>T恤   </td><td style="text-align: right;">          59</td><td style="text-align: right;">              30</td><td>2020-02-02 10:00:00+00:00</td></tr>
<tr><td>BTS002 </td><td>B      </td><td>蓝白宽条纹款            </td><td>T恤   </td><td style="text-align: right;">          79</td><td style="text-align: right;">              40</td><td>2020-03-02 10:00:00+00:00</td></tr>
<tr><td>BTSY001</td><td>B      </td><td>纯白款                  </td><td>T恤   </td><td style="text-align: right;">          49</td><td style="text-align: right;">              20</td><td>2020-04-02 10:00:00+00:00</td></tr>
<tr><td>ASS000 </td><td>A      </td><td>黑色款                  </td><td>短裤  </td><td style="text-align: right;">          99</td><td style="text-align: right;">              60</td><td>2020-03-05 10:00:00+00:00</td></tr>
<tr><td>ASS001 </td><td>A      </td><td>米色款                  </td><td>短裤  </td><td style="text-align: right;">          99</td><td style="text-align: right;">              60</td><td>2020-03-05 10:00:00+00:00</td></tr>
<tr><td>ASSY001</td><td>A      </td><td>米色底红色花纹超人限定款</td><td>短裤  </td><td style="text-align: right;">         599</td><td style="text-align: right;">             140</td><td>2020-04-02 10:00:00+00:00</td></tr>
<tr><td>BSS001 </td><td>B      </td><td>黑色款                  </td><td>短裤  </td><td style="text-align: right;">          89</td><td style="text-align: right;">              50</td><td>2020-03-05 10:00:00+00:00</td></tr>
<tr><td>BSS002 </td><td>B      </td><td>黑底白花款              </td><td>短裤  </td><td style="text-align: right;">          96</td><td style="text-align: right;">              60</td><td>2019-10-05 10:00:00+00:00</td></tr>
<tr><td>BSS003 </td><td>B      </td><td>白底红花款              </td><td>短裤  </td><td style="text-align: right;">          96</td><td style="text-align: right;">              60</td><td>2020-03-05 10:00:00+00:00</td></tr>
</tbody>
</table>


> 商品店铺关系表

店铺|商品名|存货量
---|---|---
上海总店|ATS001|100
上海总店|ATS002|20
上海总店|ATSY001|34
上海总店|BTS001|11
上海总店|BTS002|35
上海总店|BTSY001|21
上海总店|ASS000|53
上海总店|ASS001|23
上海总店|ASSY001|56
上海总店|BSS001|23
上海总店|BSS002|53
上海总店|BSS003|31
上海虹桥分店|ATS001|32
上海虹桥分店|ATS002|51
上海虹桥分店|ATSY001|32
上海虹桥分店|BTS001|14
上海虹桥分店|BTS002|45
上海虹桥分店|ASS001|6
上海虹桥分店|BSS003|6
上海南京路分店|ATS001|64
上海南京路分店|ATSY001|31
上海南京路分店|BTS001|31
上海南京路分店|BTSY001|74
上海南京路分店|ASS000|65
上海南京路分店|ASS001|43
上海南京路分店|BSS003|76
北京总店|ATS001|32
北京总店|ATS002|43
北京总店|ATSY001|54
北京总店|BTS001|87
北京总店|BTS002|37
北京总店|BTSY001|98
北京总店|ASS000|54
北京总店|ASS001|54
北京总店|ASSY001|76
北京总店|BSS001|98
北京总店|BSS002|32
北京总店|BSS003|65
北京王府井分店|ATS001|54
北京王府井分店|ATS002|83
北京王府井分店|ATSY001|32
北京王府井分店|BTS002|4
北京王府井分店|BTSY001|5
北京王府井分店|ASS001|76
北京王府井分店|ASSY001|54
北京王府井分店|BSS001|86
北京王府井分店|BSS002|62

这张表中的商品范围和商品表中的一致



```PostgreSQL
CREATE TABLE IF NOT EXISTS Shop
(
 shop_name    VARCHAR(100) NOT NULL,-- 店铺名
 commodity_name  VARCHAR(100)  NOT NULL, -- 商品名
 quantity     INT4  NOT NULL --商品备货量
)
```


```PostgreSQL
INSERT INTO Shop ( 
    shop_name,
    commodity_name,
    quantity
   
) VALUES 
('上海总店','ATS001',100),
('上海总店','ATS002',20),
('上海总店','ATSY001',34),
('上海总店','BTS001',11),
('上海总店','BTS002',35),
('上海总店','BTSY001',21),
('上海总店','ASS000',53),
('上海总店','ASS001',23),
('上海总店','ASSY001',56),
('上海总店','BSS001',23),
('上海总店','BSS002',53),
('上海总店','BSS003',31),
('上海虹桥分店','ATS001',32),
('上海虹桥分店','ATS002',51),
('上海虹桥分店','ATSY001',32),
('上海虹桥分店','BTS001',14),
('上海虹桥分店','BTS002',45),
('上海虹桥分店','ASS001',6),
('上海虹桥分店','BSS003',6),
('上海南京路分店','ATS001',64),
('上海南京路分店','ATSY001',31),
('上海南京路分店','BTS001',31),
('上海南京路分店','BTSY001',74),
('上海南京路分店','ASS000',65),
('上海南京路分店','ASS001',43),
('上海南京路分店','BSS003',76),
('北京总店','ATS001',32),
('北京总店','ATS002',43),
('北京总店','ATSY001',54),
('北京总店','BTS001',87),
('北京总店','BTS002',37),
('北京总店','BTSY001',98),
('北京总店','ASS000',54),
('北京总店','ASS001',54),
('北京总店','ASSY001',76),
('北京总店','BSS001',98),
('北京总店','BSS002',32),
('北京总店','BSS003',65),
('北京王府井分店','ATS001',54),
('北京王府井分店','ATS002',83),
('北京王府井分店','ATSY001',32),
('北京王府井分店','BTS002',4),
('北京王府井分店','BTSY001',5),
('北京王府井分店','ASS001',76),
('北京王府井分店','ASSY001',54),
('北京王府井分店','BSS001',86),
('北京王府井分店','BSS002',62)
```


```PostgreSQL
SELECT * FROM Shop
```

    47 row(s) returned.
    


<table>
<thead>
<tr><th>shop_name     </th><th>commodity_name  </th><th style="text-align: right;">  quantity</th></tr>
</thead>
<tbody>
<tr><td>上海总店      </td><td>ATS001          </td><td style="text-align: right;">       100</td></tr>
<tr><td>上海总店      </td><td>ATS002          </td><td style="text-align: right;">        20</td></tr>
<tr><td>上海总店      </td><td>ATSY001         </td><td style="text-align: right;">        34</td></tr>
<tr><td>上海总店      </td><td>BTS001          </td><td style="text-align: right;">        11</td></tr>
<tr><td>上海总店      </td><td>BTS002          </td><td style="text-align: right;">        35</td></tr>
<tr><td>上海总店      </td><td>BTSY001         </td><td style="text-align: right;">        21</td></tr>
<tr><td>上海总店      </td><td>ASS000          </td><td style="text-align: right;">        53</td></tr>
<tr><td>上海总店      </td><td>ASS001          </td><td style="text-align: right;">        23</td></tr>
<tr><td>上海总店      </td><td>ASSY001         </td><td style="text-align: right;">        56</td></tr>
<tr><td>上海总店      </td><td>BSS001          </td><td style="text-align: right;">        23</td></tr>
<tr><td>上海总店      </td><td>BSS002          </td><td style="text-align: right;">        53</td></tr>
<tr><td>上海总店      </td><td>BSS003          </td><td style="text-align: right;">        31</td></tr>
<tr><td>上海虹桥分店  </td><td>ATS001          </td><td style="text-align: right;">        32</td></tr>
<tr><td>上海虹桥分店  </td><td>ATS002          </td><td style="text-align: right;">        51</td></tr>
<tr><td>上海虹桥分店  </td><td>ATSY001         </td><td style="text-align: right;">        32</td></tr>
<tr><td>上海虹桥分店  </td><td>BTS001          </td><td style="text-align: right;">        14</td></tr>
<tr><td>上海虹桥分店  </td><td>BTS002          </td><td style="text-align: right;">        45</td></tr>
<tr><td>上海虹桥分店  </td><td>ASS001          </td><td style="text-align: right;">         6</td></tr>
<tr><td>上海虹桥分店  </td><td>BSS003          </td><td style="text-align: right;">         6</td></tr>
<tr><td>上海南京路分店</td><td>ATS001          </td><td style="text-align: right;">        64</td></tr>
<tr><td>上海南京路分店</td><td>ATSY001         </td><td style="text-align: right;">        31</td></tr>
<tr><td>上海南京路分店</td><td>BTS001          </td><td style="text-align: right;">        31</td></tr>
<tr><td>上海南京路分店</td><td>BTSY001         </td><td style="text-align: right;">        74</td></tr>
<tr><td>上海南京路分店</td><td>ASS000          </td><td style="text-align: right;">        65</td></tr>
<tr><td>上海南京路分店</td><td>ASS001          </td><td style="text-align: right;">        43</td></tr>
<tr><td>上海南京路分店</td><td>BSS003          </td><td style="text-align: right;">        76</td></tr>
<tr><td>北京总店      </td><td>ATS001          </td><td style="text-align: right;">        32</td></tr>
<tr><td>北京总店      </td><td>ATS002          </td><td style="text-align: right;">        43</td></tr>
<tr><td>北京总店      </td><td>ATSY001         </td><td style="text-align: right;">        54</td></tr>
<tr><td>北京总店      </td><td>BTS001          </td><td style="text-align: right;">        87</td></tr>
<tr><td>北京总店      </td><td>BTS002          </td><td style="text-align: right;">        37</td></tr>
<tr><td>北京总店      </td><td>BTSY001         </td><td style="text-align: right;">        98</td></tr>
<tr><td>北京总店      </td><td>ASS000          </td><td style="text-align: right;">        54</td></tr>
<tr><td>北京总店      </td><td>ASS001          </td><td style="text-align: right;">        54</td></tr>
<tr><td>北京总店      </td><td>ASSY001         </td><td style="text-align: right;">        76</td></tr>
<tr><td>北京总店      </td><td>BSS001          </td><td style="text-align: right;">        98</td></tr>
<tr><td>北京总店      </td><td>BSS002          </td><td style="text-align: right;">        32</td></tr>
<tr><td>北京总店      </td><td>BSS003          </td><td style="text-align: right;">        65</td></tr>
<tr><td>北京王府井分店</td><td>ATS001          </td><td style="text-align: right;">        54</td></tr>
<tr><td>北京王府井分店</td><td>ATS002          </td><td style="text-align: right;">        83</td></tr>
<tr><td>北京王府井分店</td><td>ATSY001         </td><td style="text-align: right;">        32</td></tr>
<tr><td>北京王府井分店</td><td>BTS002          </td><td style="text-align: right;">         4</td></tr>
<tr><td>北京王府井分店</td><td>BTSY001         </td><td style="text-align: right;">         5</td></tr>
<tr><td>北京王府井分店</td><td>ASS001          </td><td style="text-align: right;">        76</td></tr>
<tr><td>北京王府井分店</td><td>ASSY001         </td><td style="text-align: right;">        54</td></tr>
<tr><td>北京王府井分店</td><td>BSS001          </td><td style="text-align: right;">        86</td></tr>
<tr><td>北京王府井分店</td><td>BSS002          </td><td style="text-align: right;">        62</td></tr>
</tbody>
</table>


> A品牌的销售金额数据


年份|销售金额(万元)
---|---
2000|3.1
2001|3.4
2002|3.4
2003|3.2
2004|2.8
2005|3.8
2006|3.2
2007|4.1
2009|4.5
2010|4.5



```PostgreSQL
CREATE TABLE IF NOT EXISTS Saleamount
(
 year  DATE  NOT NULL, -- 日期
 amount     FLOAT8  NOT NULL --总销售金额
)
```


```PostgreSQL
INSERT INTO Saleamount ( 
   year,
 amount
) VALUES 
('2000-01-01',3.1),
('2001-01-01',3.4),
('2002-01-01',3.4),
('2003-01-01',3.2),
('2004-01-01',2.8),
('2005-01-01',3.8),
('2006-01-01',3.2),
('2007-01-01',4.1),
('2009-01-01',4.5),
('2010-01-01',4.5)

```


```PostgreSQL
SELECT * FROM Saleamount
```

    10 row(s) returned.
    


<table>
<thead>
<tr><th>year      </th><th style="text-align: right;">  amount</th></tr>
</thead>
<tbody>
<tr><td>2000-01-01</td><td style="text-align: right;">     3.1</td></tr>
<tr><td>2001-01-01</td><td style="text-align: right;">     3.4</td></tr>
<tr><td>2002-01-01</td><td style="text-align: right;">     3.4</td></tr>
<tr><td>2003-01-01</td><td style="text-align: right;">     3.2</td></tr>
<tr><td>2004-01-01</td><td style="text-align: right;">     2.8</td></tr>
<tr><td>2005-01-01</td><td style="text-align: right;">     3.8</td></tr>
<tr><td>2006-01-01</td><td style="text-align: right;">     3.2</td></tr>
<tr><td>2007-01-01</td><td style="text-align: right;">     4.1</td></tr>
<tr><td>2009-01-01</td><td style="text-align: right;">     4.5</td></tr>
<tr><td>2010-01-01</td><td style="text-align: right;">     4.5</td></tr>
</tbody>
</table>


## 使用HAVING求众数

所谓众数是出现最多的数,要用SQL语句来求还真不容易,我们需要借助HAVING子句.

> 求出不同年份销售额的众数

求众数说白了就是找出出现最多的数,那就可以用`GROUP BY`先按值分组,计算出各个分组的计数,通过`HAVING`将计数值大于等于最大分组计数值的分组取出来即可.


```PostgreSQL
SELECT amount, 
    COUNT(*) AS cnt
FROM Saleamount
GROUP BY amount
HAVING COUNT(*) >= ( 
    SELECT MAX(T.c) FROM ( 
        SELECT COUNT(*) as c
        FROM Saleamount
        GROUP BY amount
    ) as T
)
```

    3 row(s) returned.
    


<table>
<thead>
<tr><th style="text-align: right;">  amount</th><th style="text-align: right;">  cnt</th></tr>
</thead>
<tbody>
<tr><td style="text-align: right;">     3.4</td><td style="text-align: right;">    2</td></tr>
<tr><td style="text-align: right;">     3.2</td><td style="text-align: right;">    2</td></tr>
<tr><td style="text-align: right;">     4.5</td><td style="text-align: right;">    2</td></tr>
</tbody>
</table>


## 使用HAVING求中位数

中位数指的是将集合中的元素按升序排列后恰好位于正中间的元素.

+ 如果集合的元素个数为偶数,则取中间两个元素的平均值作为中位数.
+ 如果位奇数则取正中间那个元素.

> 求出不同年份销售额的中位


```PostgreSQL
SELECT AVG(DISTINCT amount)
FROM (
    SELECT T1.amount
    FROM Saleamount AS T1, Saleamount AS T2
    GROUP BY T1.amount
    HAVING SUM(CASE WHEN T2.amount >= T1.amount THEN 1 ELSE 0 END) >= COUNT(*) / 2
       AND SUM(CASE WHEN T2.amount <= T1.amount THEN 1 ELSE 0 END) >= COUNT(*) / 2
) AS TMP
```

    1 row(s) returned.
    


<table>
<thead>
<tr><th style="text-align: right;">  avg</th></tr>
</thead>
<tbody>
<tr><td style="text-align: right;">  3.4</td></tr>
</tbody>
</table>


### 使用HAVING找出全部满足条件的分组

这也是一个非常常见的应用场景.

> 找出所有存货量都大于10件的商店


```PostgreSQL

SELECT shop_name
FROM Shop
GROUP BY shop_name
HAVING COUNT(*) = SUM(CASE WHEN quantity >10 THEN 1 ELSE 0 END)

```

    3 row(s) returned.
    


<table>
<thead>
<tr><th>shop_name     </th></tr>
</thead>
<tbody>
<tr><td>上海总店      </td></tr>
<tr><td>北京总店      </td></tr>
<tr><td>上海南京路分店</td></tr>
</tbody>
</table>


## 收尾

本文内容较短,可以看作是几篇前面文章内容在使用`HAVING`子句时的一篇综合应用的例子集合．

`HAVING`子句的作用还是用于筛选组,因此常用在一些需要汇总统计再筛选的使用场景. 它如果结合`CASE`语句以及关联子查询可以很轻易的根据分组的特点来筛选组.



```PostgreSQL
DROP TABLE IF EXISTS Commodity
```


```PostgreSQL
DROP TABLE IF EXISTS Shop
```


```PostgreSQL
DROP TABLE IF EXISTS Saleamount
```
