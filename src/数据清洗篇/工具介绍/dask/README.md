# 使用dask做分布式计算

dask是纯python的分布式科学计算框架,其旨在让熟悉python下数据科学工具的数据开发人员可以无痛的从单机版本的numpy,scipy,pandas,sklearn迁移到分布式计算,以适应大数据分析的需求,于此同时不失去python语言的灵活性.

标准的dask集群部署方式(local方式)有大致3块结构:

+ 分布式的数据结构接口用于构造计算图
+ 调度器用于分发任务
+ worker运算节点

在此基础上还有几个借助已有分布式工具的部署方式:

+ docker方式,借助docker集群提供算力,也是本文使用的方式

+ Kubernetes方式,借助Kubernetes集群提供算力,它提供了docker方式不具备的动态调节资源的能力

+ YARN/Hadoop方式,借助YARN/Hadoop集群提供算力,这种方式相当于把调度器和worker承包给了yarn

+ 借助高性能计算框架作为调度器.这种一般公司没有.


## docker方式部署dask集群


下面是一个简易的docker-compose文件

```yml
version: "3.6"

services:
  scheduler:
    image: daskdev/dask
    hostname: dask-scheduler
    logging:
      options:
          max-size: "10m"
          max-file: "3"
    ports:
      - "8786:8786"
      - "8787:8787"
    command: ["dask-scheduler"]
  worker1:
    image: daskdev/dask
    hostname: dask-worker1
    logging:
      options:
          max-size: "10m"
          max-file: "3"
    command: ["dask-worker", "tcp://scheduler:8786"]
    
  worker2:
    image: daskdev/dask
    hostname: dask-worker2
    logging:
      options:
          max-size: "10m"
          max-file: "3"
    command: ["dask-worker", "tcp://scheduler:8786"]
    
  worker3:
    image: daskdev/dask
    hostname: dask-worker3
    logging:
      options:
          max-size: "10m"
          max-file: "3"
    command: ["dask-worker", "tcp://scheduler:8786"]

```

这个配置方式用来测试绰绰有余,但并不适合生产环境使用,生产环境建议使用`Kubernetes`方式或者`YARN/Hadoop`方式.如果非要用docker方式,那也注意一定不要用warm自带的overlay网络,可以使用host方式pubish端口,所有的网络流量通过宿主机ip走内网流量.
