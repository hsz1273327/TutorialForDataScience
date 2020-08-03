# 复杂EXISTS语句

在前面的[查询语句扩展]()一文中我们已经简单介绍过`EXISTS`语句.`EXISTS`语句时**谓词**语句,但又和其他的谓词不太一样.具体来说就是他们的参数不同,`EXISTS`语句的参数是**行的集合**,而其他的则都是**行数据**.这种区别本质上是在于其参数的阶(order)不同.

可以认为

+ 一阶谓词 = 输入值为`标量`
+ 二阶谓词 = 输入值为`集合`
+ 三阶谓词＝输入值为`集合的集合`
+ 四阶谓词＝输入值为`集合的集合的集合`
...

当然至少目前SQL语句只支持到二阶.

在关系数据库模型中,行被称为`0阶`,表被称为`1阶`即行的集合,`schema`就是`2阶`即表的集合,`database`就是`3阶`即`schema`的集合.

上面这些可以稍微了解下,但总的来说是想要表述`EXISTS`比一般的谓词语句更加`高级`,它用于解决的也往往是更加`高级`的的问题.


```PostgreSQL
-- connection: postgres://postgres:postgres@localhost:5432/postgres
```


```PostgreSQL
-- autocommit: true
```

    switched autocommit mode to True

## 准备工作

本文使用商品店铺关系表来进行演示

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

## 查询不存在的值

查询存在很简单,但查询不存在却没那么容易,这意味着更加高阶.看下面的例子:

> 查询每家店有哪些商品不在卖

这个查询的思路是
1. 先假设所有人都参加了全部会议并以此生成一个集合.这个很好实现,我们构造一个自联结的交叉连接就可以得到
2. 然后从中减去实际参加会议的人,这样就能得到缺席会议的人.


```PostgreSQL
SELECT DISTINCT T1.shop_name, T2.commodity_name
  FROM Shop T1 CROSS JOIN Shop T2
 WHERE NOT EXISTS (
    SELECT *
    FROM Shop T3
    WHERE T1.shop_name = T3.shop_name
        AND T2.commodity_name = T3.commodity_name
 )
```

    13 row(s) returned.
    


<table>
<thead>
<tr><th>shop_name     </th><th>commodity_name  </th></tr>
</thead>
<tbody>
<tr><td>上海南京路分店</td><td>ASSY001         </td></tr>
<tr><td>上海南京路分店</td><td>ATS002          </td></tr>
<tr><td>上海南京路分店</td><td>BSS001          </td></tr>
<tr><td>上海南京路分店</td><td>BSS002          </td></tr>
<tr><td>上海南京路分店</td><td>BTS002          </td></tr>
<tr><td>上海虹桥分店  </td><td>ASS000          </td></tr>
<tr><td>上海虹桥分店  </td><td>ASSY001         </td></tr>
<tr><td>上海虹桥分店  </td><td>BSS001          </td></tr>
<tr><td>上海虹桥分店  </td><td>BSS002          </td></tr>
<tr><td>上海虹桥分店  </td><td>BTSY001         </td></tr>
<tr><td>北京王府井分店</td><td>ASS000          </td></tr>
<tr><td>北京王府井分店</td><td>BSS003          </td></tr>
<tr><td>北京王府井分店</td><td>BTS001          </td></tr>
</tbody>
</table>


当然了使用差集一样可以实现


```PostgreSQL
SELECT DISTINCT T1.shop_name, T2.commodity_name
  FROM Shop T1 CROSS JOIN Shop T2
EXCEPT 
SELECT shop_name,commodity_name 
FROM SHOP
```

    13 row(s) returned.
    


<table>
<thead>
<tr><th>shop_name     </th><th>commodity_name  </th></tr>
</thead>
<tbody>
<tr><td>上海南京路分店</td><td>ASSY001         </td></tr>
<tr><td>上海南京路分店</td><td>ATS002          </td></tr>
<tr><td>上海南京路分店</td><td>BSS001          </td></tr>
<tr><td>上海南京路分店</td><td>BSS002          </td></tr>
<tr><td>上海南京路分店</td><td>BTS002          </td></tr>
<tr><td>上海虹桥分店  </td><td>ASS000          </td></tr>
<tr><td>上海虹桥分店  </td><td>ASSY001         </td></tr>
<tr><td>上海虹桥分店  </td><td>BSS001          </td></tr>
<tr><td>上海虹桥分店  </td><td>BSS002          </td></tr>
<tr><td>上海虹桥分店  </td><td>BTSY001         </td></tr>
<tr><td>北京王府井分店</td><td>ASS000          </td></tr>
<tr><td>北京王府井分店</td><td>BSS003          </td></tr>
<tr><td>北京王府井分店</td><td>BTS001          </td></tr>
</tbody>
</table>


## 收尾



```PostgreSQL
DROP TABLE IF EXISTS Shop
```
