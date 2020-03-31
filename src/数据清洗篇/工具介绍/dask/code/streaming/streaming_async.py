import asyncio
import time
from dask.distributed import Client
from streamz import Stream


def increment(x):
    """ A blocking increment function

    Simulates a computational function that was not designed to work
    asynchronously
    """
    time.sleep(0.1)
    return x + 1


async def write(x):
    print(x)


async def f():
    client = await Client("localhost:8786", processes=False, asynchronous=True)
    source = Stream(asynchronous=True)
    source.scatter().map(increment).rate_limit('500ms').gather().sink(write)

    for x in range(10):
        await source.emit(x)

if __name__ == '__main__':
    asyncio.get_event_loop().run_until_complete(f())