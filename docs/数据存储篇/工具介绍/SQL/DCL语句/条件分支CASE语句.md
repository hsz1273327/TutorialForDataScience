# 条件分支CASE语句

SQL中的条件分支语句是`CASE`语句,其语法如下:

```SQL

CASE WHEN <求值表达式> THEN <表达式>
    WHEN <求值表达式> THEN <表达式>
    WHEN <求值表达式> THEN <表达式>
       .
       .
       .
     ELSE <表达式>
END

```
和一般编程语言中的`if...else...`或`switch`语句一样,其中的`WHEN`子句后面接的是谓词用于判断是否进入分支,`THEN`后面则是接的一般的表达式,描述的是进入分支后的操作,`ELSE`则相当于`switch`语句的`default`段,描述上面的分支一个都没进的情况下该如何处理


`CASE`语句的特殊之处在于它是一个表达式,因此它可以在任何地方使用,用起来类似一般编程语言中的三值表达式.


```PostgreSQL
-- connection: postgres://postgres:postgres@localhost:5432/postgres
```


```PostgreSQL
-- autocommit: true
```

    switched autocommit mode to True

## 准备工作

本文依然使用商品表来作为例子

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


## 从一个例子开始

`CASE`表达式最常见的用法是在`SELECT`子句中用做对结果的进一步处理.下面一个例子我们来演示下

>商店打算为所有短裤打95折,计算每件商品的最终售价


```PostgreSQL
SELECT *,
CASE WHEN type = '短裤'
        THEN sale_price*0.95
    ELSE sale_price
END AS fin_price
FROM Commodity
```

    12 row(s) returned.
    


<table>
<thead>
<tr><th style="text-align: right;">  id</th><th>name   </th><th>brand  </th><th>style                   </th><th>type  </th><th style="text-align: right;">  sale_price</th><th style="text-align: right;">  purchase_price</th><th>ctime                    </th><th style="text-align: right;">  fin_price</th></tr>
</thead>
<tbody>
<tr><td style="text-align: right;">   1</td><td>ATS001 </td><td>A      </td><td>黑白宽条纹款            </td><td>T恤   </td><td style="text-align: right;">          59</td><td style="text-align: right;">              30</td><td>2019-06-02 10:00:00+00:00</td><td style="text-align: right;">      59   </td></tr>
<tr><td style="text-align: right;">   2</td><td>ATS002 </td><td>A      </td><td>蓝白宽条纹款            </td><td>T恤   </td><td style="text-align: right;">          79</td><td style="text-align: right;">              40</td><td>2020-03-02 10:00:00+00:00</td><td style="text-align: right;">      79   </td></tr>
<tr><td style="text-align: right;">   3</td><td>ATSY001</td><td>A      </td><td>蓝白宽条纹初音限定款    </td><td>T恤   </td><td style="text-align: right;">         299</td><td style="text-align: right;">              45</td><td>2020-04-02 10:00:00+00:00</td><td style="text-align: right;">     299   </td></tr>
<tr><td style="text-align: right;">   4</td><td>BTS001 </td><td>B      </td><td>黑白宽条纹款            </td><td>T恤   </td><td style="text-align: right;">          59</td><td style="text-align: right;">              30</td><td>2020-02-02 10:00:00+00:00</td><td style="text-align: right;">      59   </td></tr>
<tr><td style="text-align: right;">   5</td><td>BTS002 </td><td>B      </td><td>蓝白宽条纹款            </td><td>T恤   </td><td style="text-align: right;">          79</td><td style="text-align: right;">              40</td><td>2020-03-02 10:00:00+00:00</td><td style="text-align: right;">      79   </td></tr>
<tr><td style="text-align: right;">   6</td><td>BTSY001</td><td>B      </td><td>纯白款                  </td><td>T恤   </td><td style="text-align: right;">          49</td><td style="text-align: right;">              20</td><td>2020-04-02 10:00:00+00:00</td><td style="text-align: right;">      49   </td></tr>
<tr><td style="text-align: right;">   7</td><td>ASS000 </td><td>A      </td><td>黑色款                  </td><td>短裤  </td><td style="text-align: right;">          99</td><td style="text-align: right;">              60</td><td>2020-03-05 10:00:00+00:00</td><td style="text-align: right;">      94.05</td></tr>
<tr><td style="text-align: right;">   8</td><td>ASS001 </td><td>A      </td><td>米色款                  </td><td>短裤  </td><td style="text-align: right;">          99</td><td style="text-align: right;">              60</td><td>2020-03-05 10:00:00+00:00</td><td style="text-align: right;">      94.05</td></tr>
<tr><td style="text-align: right;">   9</td><td>ASSY001</td><td>A      </td><td>米色底红色花纹超人限定款</td><td>短裤  </td><td style="text-align: right;">         599</td><td style="text-align: right;">             140</td><td>2020-04-02 10:00:00+00:00</td><td style="text-align: right;">     569.05</td></tr>
<tr><td style="text-align: right;">  10</td><td>BSS001 </td><td>B      </td><td>黑色款                  </td><td>短裤  </td><td style="text-align: right;">          89</td><td style="text-align: right;">              50</td><td>2020-03-05 10:00:00+00:00</td><td style="text-align: right;">      84.55</td></tr>
<tr><td style="text-align: right;">  11</td><td>BSS002 </td><td>B      </td><td>黑底白花款              </td><td>短裤  </td><td style="text-align: right;">          96</td><td style="text-align: right;">              60</td><td>2019-10-05 10:00:00+00:00</td><td style="text-align: right;">      91.2 </td></tr>
<tr><td style="text-align: right;">  12</td><td>BSS003 </td><td>B      </td><td>白底红花款              </td><td>短裤  </td><td style="text-align: right;">          96</td><td style="text-align: right;">              60</td><td>2020-03-05 10:00:00+00:00</td><td style="text-align: right;">      91.2 </td></tr>
</tbody>
</table>


这是`CASE`表达式的一个典型应用.同样的这也常用在有缺失值时处理`NULL`的场景下.

## 在GROUP BY子句中用于定制化聚合

另一个常见的用法是在GROUP BY子句中定制聚合键.

> 统计商品中蓝色,米色,黑底为底色的商品数量

我们可以看到颜色数据是在`style`字符串中的,因此可以通过`LIKE`语句匹配,我们将这个匹配的结果用条件分支表示出来,然后以他做为聚合键,再对这个聚合键用`HAVING`子句做筛选,找到需要的颜色即可


```PostgreSQL
SELECT 
(CASE WHEN style LIKE '%黑%' THEN '黑色'
 WHEN style LIKE '%蓝%' THEN '蓝色'
 WHEN style LIKE '%米%' THEN '米色'
 ELSE '其他'
END) as 底色,
count(*)
FROM Commodity
GROUP BY (CASE WHEN style LIKE '%黑%' THEN '黑色'
 WHEN style LIKE '%蓝%' THEN '蓝色'
 WHEN style LIKE '%米%' THEN '米色'
 ELSE '其他'
END)
HAVING (CASE WHEN style LIKE '%黑%' THEN '黑色'
 WHEN style LIKE '%蓝%' THEN '蓝色'
 WHEN style LIKE '%米%' THEN '米色'
 ELSE '其他' END)<> '其他'
```

    3 row(s) returned.
    


<table>
<thead>
<tr><th>底色  </th><th style="text-align: right;">  count</th></tr>
</thead>
<tbody>
<tr><td>蓝色  </td><td style="text-align: right;">      3</td></tr>
<tr><td>米色  </td><td style="text-align: right;">      2</td></tr>
<tr><td>黑色  </td><td style="text-align: right;">      5</td></tr>
</tbody>
</table>


## 用一条 SQL 语句进行不同条件的统计

进行不同条件的统计是`CASE`表达式的著名用法之一,它是利用了`CASE`表达式可以和聚合函数组合使用的特点.

> 比如我们希望统计出各个品牌T恤和短裤的均价


```PostgreSQL
SELECT 
brand,
SUM(CASE WHEN type = 'T恤' THEN sale_price ELSE 0 END)/SUM(CASE WHEN type = 'T恤' THEN 1 ELSE 0 END) as T恤均价,
SUM(CASE WHEN type = '短裤' THEN sale_price ELSE 0 END)/SUM(CASE WHEN type = '短裤' THEN 1 ELSE 0 END) as 短裤均价
FROM Commodity
GROUP BY brand
```

    2 row(s) returned.
    


<table>
<thead>
<tr><th>brand  </th><th style="text-align: right;">  t恤均价</th><th style="text-align: right;">  短裤均价</th></tr>
</thead>
<tbody>
<tr><td>B      </td><td style="text-align: right;">       62</td><td style="text-align: right;">        93</td></tr>
<tr><td>A      </td><td style="text-align: right;">      145</td><td style="text-align: right;">       265</td></tr>
</tbody>
</table>


这条查询不是很严谨不过就是这个意思了,由于`CASE`是表达式,因此它可以向函数一样的多层嵌套调用,我们只需要将不要的部分记为0然后全体相加就可以得到想要的均价

## 在CASE子句中使用子查询

我们的第一个例子做一些更进一步变化


> 商店打算为所有高于各品牌各类型商品均价的商品打95折,计算每件商品的最终售价

这个查询在`CASE`的分支条件上用到了前面介绍的关联子查询,`CASE`语句的优点就是灵活性极强,这种灵活性带来了各种便捷的查询方式.


```PostgreSQL
SELECT *,
CASE WHEN  sale_price > (
    SELECT AVG(sale_price)
    FROM Commodity AS t2
    WHERE t1.type = t2.type AND t1.brand = t2.brand
    GROUP BY brand,type
)
   THEN sale_price*0.95
   ELSE sale_price
END AS fin_price,
(
    SELECT AVG(sale_price)
    FROM Commodity AS t2
    WHERE t1.type = t2.type AND t1.brand = t2.brand
    GROUP BY brand,type
) as avg_price
FROM Commodity as t1
```

    12 row(s) returned.
    


<table>
<thead>
<tr><th style="text-align: right;">  id</th><th>name   </th><th>brand  </th><th>style                   </th><th>type  </th><th style="text-align: right;">  sale_price</th><th style="text-align: right;">  purchase_price</th><th>ctime                    </th><th style="text-align: right;">  fin_price</th><th style="text-align: right;">  avg_price</th></tr>
</thead>
<tbody>
<tr><td style="text-align: right;">   1</td><td>ATS001 </td><td>A      </td><td>黑白宽条纹款            </td><td>T恤   </td><td style="text-align: right;">          59</td><td style="text-align: right;">              30</td><td>2019-06-02 10:00:00+00:00</td><td style="text-align: right;">      59   </td><td style="text-align: right;">   145.667 </td></tr>
<tr><td style="text-align: right;">   2</td><td>ATS002 </td><td>A      </td><td>蓝白宽条纹款            </td><td>T恤   </td><td style="text-align: right;">          79</td><td style="text-align: right;">              40</td><td>2020-03-02 10:00:00+00:00</td><td style="text-align: right;">      79   </td><td style="text-align: right;">   145.667 </td></tr>
<tr><td style="text-align: right;">   3</td><td>ATSY001</td><td>A      </td><td>蓝白宽条纹初音限定款    </td><td>T恤   </td><td style="text-align: right;">         299</td><td style="text-align: right;">              45</td><td>2020-04-02 10:00:00+00:00</td><td style="text-align: right;">     284.05</td><td style="text-align: right;">   145.667 </td></tr>
<tr><td style="text-align: right;">   4</td><td>BTS001 </td><td>B      </td><td>黑白宽条纹款            </td><td>T恤   </td><td style="text-align: right;">          59</td><td style="text-align: right;">              30</td><td>2020-02-02 10:00:00+00:00</td><td style="text-align: right;">      59   </td><td style="text-align: right;">    62.3333</td></tr>
<tr><td style="text-align: right;">   5</td><td>BTS002 </td><td>B      </td><td>蓝白宽条纹款            </td><td>T恤   </td><td style="text-align: right;">          79</td><td style="text-align: right;">              40</td><td>2020-03-02 10:00:00+00:00</td><td style="text-align: right;">      75.05</td><td style="text-align: right;">    62.3333</td></tr>
<tr><td style="text-align: right;">   6</td><td>BTSY001</td><td>B      </td><td>纯白款                  </td><td>T恤   </td><td style="text-align: right;">          49</td><td style="text-align: right;">              20</td><td>2020-04-02 10:00:00+00:00</td><td style="text-align: right;">      49   </td><td style="text-align: right;">    62.3333</td></tr>
<tr><td style="text-align: right;">   7</td><td>ASS000 </td><td>A      </td><td>黑色款                  </td><td>短裤  </td><td style="text-align: right;">          99</td><td style="text-align: right;">              60</td><td>2020-03-05 10:00:00+00:00</td><td style="text-align: right;">      99   </td><td style="text-align: right;">   265.667 </td></tr>
<tr><td style="text-align: right;">   8</td><td>ASS001 </td><td>A      </td><td>米色款                  </td><td>短裤  </td><td style="text-align: right;">          99</td><td style="text-align: right;">              60</td><td>2020-03-05 10:00:00+00:00</td><td style="text-align: right;">      99   </td><td style="text-align: right;">   265.667 </td></tr>
<tr><td style="text-align: right;">   9</td><td>ASSY001</td><td>A      </td><td>米色底红色花纹超人限定款</td><td>短裤  </td><td style="text-align: right;">         599</td><td style="text-align: right;">             140</td><td>2020-04-02 10:00:00+00:00</td><td style="text-align: right;">     569.05</td><td style="text-align: right;">   265.667 </td></tr>
<tr><td style="text-align: right;">  10</td><td>BSS001 </td><td>B      </td><td>黑色款                  </td><td>短裤  </td><td style="text-align: right;">          89</td><td style="text-align: right;">              50</td><td>2020-03-05 10:00:00+00:00</td><td style="text-align: right;">      89   </td><td style="text-align: right;">    93.6667</td></tr>
<tr><td style="text-align: right;">  11</td><td>BSS002 </td><td>B      </td><td>黑底白花款              </td><td>短裤  </td><td style="text-align: right;">          96</td><td style="text-align: right;">              60</td><td>2019-10-05 10:00:00+00:00</td><td style="text-align: right;">      91.2 </td><td style="text-align: right;">    93.6667</td></tr>
<tr><td style="text-align: right;">  12</td><td>BSS003 </td><td>B      </td><td>白底红花款              </td><td>短裤  </td><td style="text-align: right;">          96</td><td style="text-align: right;">              60</td><td>2020-03-05 10:00:00+00:00</td><td style="text-align: right;">      91.2 </td><td style="text-align: right;">    93.6667</td></tr>
</tbody>
</table>


## 使用CASE语句判断特定条件是否存在


`CASE`语句的`WHEN`部分接的是个谓词,因此一个很经典的用法是和`EXISTS`搭配使用用于判断特定条件是否存在.


> 判断各个品牌的各个类型的商品中是否存在米色和白色的商品


```PostgreSQL
SELECT brand,
type,
CASE WHEN EXISTS (SELECT * FROM Commodity AS t2 WHERE style LIKE '%米%'AND t1.type = t2.type AND t1.brand = t2.brand) THEN True
ELSE False END AS 有米色,
CASE WHEN EXISTS (SELECT * FROM Commodity AS t2 WHERE style LIKE '%白%'AND t1.type = t2.type AND t1.brand = t2.brand) THEN True
ELSE False END AS 有白色
FROM Commodity AS t1
GROUP BY brand,type
```

    4 row(s) returned.
    


<table>
<thead>
<tr><th>brand  </th><th>type  </th><th>有米色  </th><th>有白色  </th></tr>
</thead>
<tbody>
<tr><td>B      </td><td>T恤   </td><td>False   </td><td>True    </td></tr>
<tr><td>B      </td><td>短裤  </td><td>False   </td><td>True    </td></tr>
<tr><td>A      </td><td>短裤  </td><td>True    </td><td>False   </td></tr>
<tr><td>A      </td><td>T恤   </td><td>False   </td><td>True    </td></tr>
</tbody>
</table>


## 在创建约束时使用`CASE`

`CASE`语句既然是表达式,那自然也可以用在除了查询之外的其他场合,最常见的用法是在创建`CHECK`约束时使用

> 建立一个CHECK约束以保证B品牌的短裤进价不会高于200


```PostgreSQL
ALTER TABLE Commodity ADD CONSTRAINT check_purchase_price CHECK (
(CASE WHEN (type='短裤'AND brand ='B')
    THEN (CASE WHEN purchase_price < 200 THEN 1 ELSE 0 END)
    ELSE 1
    END) = 1
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
    'BTS004',
    'B',
    '绿白宽条纹款',
    '短裤',
    339,
    300,
    '2017-06-02T10:00:00.000Z'
)
```

    new row for relation "commodity" violates check constraint "check_purchase_price"
    DETAIL:  Failing row contains (13, BTS004, B, 绿白宽条纹款, 短裤, 339, 300, 2017-06-02 10:00:00+00).
    


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


## 在更新数据时使用`CASE`

在`UPDATE`语句中我们也可以使用`CASE`表达式,其含义是根据不同的条件按不同的规则修改值.

> 修改售价,高于100的统一减价10%,低于70的统一加价10%


```PostgreSQL
UPDATE Commodity
   SET sale_price = (
    CASE WHEN sale_price>100 THEN 0.9 * sale_price
        WHEN sale_price<70 THEN 1.1*sale_price
        ELSE sale_price           
    END
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
<tr><td style="text-align: right;">   1</td><td>ATS001 </td><td>A      </td><td>黑白宽条纹款            </td><td>T恤   </td><td style="text-align: right;">          65</td><td style="text-align: right;">              30</td><td>2019-06-02 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">   2</td><td>ATS002 </td><td>A      </td><td>蓝白宽条纹款            </td><td>T恤   </td><td style="text-align: right;">          79</td><td style="text-align: right;">              40</td><td>2020-03-02 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">   3</td><td>ATSY001</td><td>A      </td><td>蓝白宽条纹初音限定款    </td><td>T恤   </td><td style="text-align: right;">         269</td><td style="text-align: right;">              45</td><td>2020-04-02 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">   4</td><td>BTS001 </td><td>B      </td><td>黑白宽条纹款            </td><td>T恤   </td><td style="text-align: right;">          65</td><td style="text-align: right;">              30</td><td>2020-02-02 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">   5</td><td>BTS002 </td><td>B      </td><td>蓝白宽条纹款            </td><td>T恤   </td><td style="text-align: right;">          79</td><td style="text-align: right;">              40</td><td>2020-03-02 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">   6</td><td>BTSY001</td><td>B      </td><td>纯白款                  </td><td>T恤   </td><td style="text-align: right;">          54</td><td style="text-align: right;">              20</td><td>2020-04-02 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">   7</td><td>ASS000 </td><td>A      </td><td>黑色款                  </td><td>短裤  </td><td style="text-align: right;">          99</td><td style="text-align: right;">              60</td><td>2020-03-05 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">   8</td><td>ASS001 </td><td>A      </td><td>米色款                  </td><td>短裤  </td><td style="text-align: right;">          99</td><td style="text-align: right;">              60</td><td>2020-03-05 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">   9</td><td>ASSY001</td><td>A      </td><td>米色底红色花纹超人限定款</td><td>短裤  </td><td style="text-align: right;">         539</td><td style="text-align: right;">             140</td><td>2020-04-02 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">  10</td><td>BSS001 </td><td>B      </td><td>黑色款                  </td><td>短裤  </td><td style="text-align: right;">          89</td><td style="text-align: right;">              50</td><td>2020-03-05 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">  11</td><td>BSS002 </td><td>B      </td><td>黑底白花款              </td><td>短裤  </td><td style="text-align: right;">          96</td><td style="text-align: right;">              60</td><td>2019-10-05 10:00:00+00:00</td></tr>
<tr><td style="text-align: right;">  12</td><td>BSS003 </td><td>B      </td><td>白底红花款              </td><td>短裤  </td><td style="text-align: right;">          96</td><td style="text-align: right;">              60</td><td>2020-03-05 10:00:00+00:00</td></tr>
</tbody>
</table>


## 收尾

`CASE`语句由于是表达式所以非常灵活因此非常重要,本文探讨了再各种不同场景下`CASE`语句的应用.本文的重点是`CASE`语句是**表达式**.


```PostgreSQL
DROP TABLE IF EXISTS Commodity
```
