import asyncio
import platform
import multiprocessing
from dask.distributed import Client


class Counter:
    n = 0

    def __init__(self):
        self.n = 0

    def increment(self):
        self.n += 1
        return self.n


async def f():
    client = await Client("localhost:8786", asynchronous=True)
    counter = await client.submit(Counter, actor=True)
    await counter.increment()
    n = await counter.n
    print(n)
    await client.close()
    return n


if __name__ == '__main__':
    if "Windows" in platform.platform():
        multiprocessing.freeze_support()
    asyncio.get_event_loop().run_until_complete(f())