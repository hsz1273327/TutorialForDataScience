import asyncio
import platform
from dask.distributed import Client


def square(x):
    return x ** 2


async def f():
    client = await Client("localhost:8786", processes=False, asynchronous=True)
    A = client.map(square, range(10000))
    result = await client.submit(sum, A)
    print(result)
    await client.close()
    return result


if __name__ == '__main__':
    asyncio.get_event_loop().run_until_complete(f())
