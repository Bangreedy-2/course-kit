=== dask | ship | 10 | Dask: working with data larger than memory |
@@ About 25 min reading · Handbook chapter 22 · Homework 20
## Why this matters

pandas and numpy load the whole dataset into RAM and use one CPU core for most operations. When a CSV is 30 GB and your laptop has 16 GB, `pd.read_csv` fails. Dask keeps the familiar numpy and pandas interfaces but splits the data into pieces, processes them piece by piece (in parallel where possible), and only holds what it needs in memory. Homework 20 asks you to load a large dataset with a chosen number of partitions, describe it, group and aggregate it, apply an earlier algorithm and plot. This lesson explains the two ideas Dask is built on, chunking and lazy evaluation, and a misleading timing in the handbook.

## Before reaching for Dask

Two cheaper fixes often suffice:

- **Smaller dtypes**: `float64` → `float32`, `int64` → `int32` or `int8`, repeated strings → `category`. `df.memory_usage(deep=True)` shows where memory goes; text columns converted to `category` often shrink by 10 times or more.
- **Read less**: `pd.read_csv(path, usecols=[...], dtype={...})`, or `chunksize=100_000` to stream a file through a loop.

If the data still does not fit, or the computation is slow and parallelisable, use Dask. If it fits comfortably in memory, plain pandas is simpler and usually faster (the handbook's conclusion says the same).

## Idea 1: chunks and partitions

A **Dask Array** is a grid of numpy arrays called **chunks**. `da.random.random((10000, 10000), chunks=(1000, 1000))` is a 10,000 × 10,000 matrix (800 MB of float64) made of a 10 × 10 grid of 1,000 × 1,000 chunks: 100 chunks of 8 MB each. A 25 × 25 × 25 array with `chunks=5` has 5 × 5 × 5 = 125 chunks; a 100-element vector with `chunks=25` has 4.

A **Dask DataFrame** is a sequence of pandas DataFrames called **partitions**, split along the rows. `dd.read_csv("data.csv", blocksize="64MB")` makes roughly one partition per 64 MB of file; `dd.from_pandas(df, npartitions=3)` splits an existing DataFrame. `ddf.npartitions` gives the count, and `ddf.divisions` the index values where partitions start and end, for example `(0, 4, 7, 9)` for 10 rows in 3 partitions: rows 0 to 3, 4 to 6 and 7 to 9.

Good partition sizes are roughly 100 MB of memory each: large enough that per-task overhead is small, small enough that several fit in RAM at once.

## Idea 2: lazy evaluation and the task graph

Dask operations do not compute anything. They build a **task graph**: a recipe of small numpy or pandas operations on each chunk or partition, plus the steps that combine the pieces. Nothing runs until you ask for a concrete result with **`.compute()`** (which returns a numpy array or pandas object), or a few methods that compute implicitly, such as `len(ddf)` and `ddf.head()` (which only reads the first partition).

```
import dask.dataframe as dd

ddf = dd.read_csv("renfe.csv", blocksize="64MB")       # instant: reads only a sample to infer columns
mean_dur = ddf.groupby("origin")["duration"].mean()     # instant: builds the graph
result = mean_dur.compute()                             # now the file is actually read and processed
```

Because the whole graph is known before running, Dask's scheduler can stream partitions through memory, run independent tasks on several cores, and drop intermediate results as soon as they are no longer needed. Call `.compute()` once on the final result, not after every step; `dask.compute(a, b)` computes several results in one pass over the data. `ddf.persist()` computes and keeps the data in memory when you will reuse it many times and it fits.

### The handbook's timing comparison

The handbook times pandas reading and grouping the Renfe file (131 s) and then the "same" with Dask (0.04 s), concluding that Dask is much faster. But the Dask code never calls `.compute()`; its output is the lazy "Dask DataFrame Structure" with "aggregate-agg, 261 tasks". Those 0.04 seconds only built the graph. A fair comparison times `ddf.groupby(...).agg(...).compute()`, which on one machine typically lands within a small factor of pandas, faster when it can use several cores, and possible at all when pandas runs out of memory. Dask's real advantage is scale, not magic speed.

## How a groupby mean is computed in pieces

The combining step needs care. Ten trips, split into partitions of 4, 3 and 3 rows, have durations 1, 3, 2, 2 | 5, 4, 4 | 4, 8, 6. The partition means are 2, 4.333 and 6; their average is 4.111, but the true mean is 39/10 = 3.9. Averaging averages is wrong when partitions differ in size. Dask instead computes, per partition, the **sum and count** (per group, for a groupby), adds those up across partitions, and divides once at the end. The same "reduce per piece, combine, finish" pattern gives variances (sum of squares too), minimums and counts. Your practice exercise implements it.

## The pandas-like API

Most everyday pandas operations work the same way: selecting columns, boolean filtering (`ddf[ddf.price > 50]`), `assign`, arithmetic, `groupby(...).agg(...)`, `value_counts`, `describe`, `merge`, `dropna`, `fillna`, `astype`, `map_partitions(func)` (apply any pandas function to each partition). Some are expensive or missing: `set_index` sorts the whole dataset across partitions (the handbook's `set_index("origin")` produced 27 partitions with 742 tasks), so do it rarely; row positions (`iloc` on rows) are not supported because partitions do not know their global row numbers; and operations needing all data at once (exact median, some reshapes) are approximate or costly.

Results that are small, such as the output of a groupby, become ordinary pandas objects after `.compute()`, so you can plot them as usual: `result.plot(kind="bar")`.

## Machine learning on large data

- Many workflows aggregate or sample the big data with Dask, then train scikit-learn on the result that fits in memory.
- `dask-ml` offers scalable versions of some estimators and preprocessing, and lets scikit-learn's own parallelism (`n_jobs`) run on a Dask cluster.
- Models with `partial_fit` (`SGDClassifier`, `MiniBatchKMeans`, `MultinomialNB`) can learn from one partition at a time.

## The dashboard and the distributed scheduler

By default Dask uses threads on your machine. Creating a `Client` from `dask.distributed` starts a local cluster with worker processes and a live dashboard (a web page showing tasks, memory and progress):

```
from dask.distributed import Client
client = Client()            # local cluster; print(client) shows the dashboard link
```

The same code then scales to a cluster of machines by pointing the Client at it. Watching the dashboard while a computation runs is the quickest way to see whether partitions are too small or memory is running out.

## Common mistakes

> **Timing without `.compute()`.** You measured graph construction, not the work.

> **Calling `.compute()` on a huge result.** It must fit in memory as pandas. Reduce first (aggregate, filter, sample).

> **Too many tiny partitions.** Thousands of small tasks spend more time on overhead than on work.

## Summary

Dask splits arrays into chunks and DataFrames into row partitions, each a numpy array or pandas DataFrame. Operations are lazy: they build a task graph, and `.compute()` executes it, streaming pieces through memory and in parallel. Reductions combine per-piece partial results (sums and counts, never means of means). Aim for partitions of about 100 MB; avoid frequent `set_index`; compute once at the end. Use pandas when data fits in memory, and shrink dtypes before reaching for Dask.

--- practice
@predict
How many chunks does `da.random.random((10000, 10000), chunks=(1000, 1000))` have?
```python
print((10000 // 1000) * (10000 // 1000))
```
= 100
! A 10 × 10 grid of 1,000 × 1,000 numpy arrays, each 8 MB in float64.

@choice
`ddf.groupby("origin").duration.mean()` returns in 0.04 seconds on a 5 GB file. What happened?
- Dask computed the result 3,000 times faster than pandas
* Nothing was computed yet; Dask built a lazy task graph that runs on .compute()
- Dask read only the first partition
- The result was cached from an earlier run
! Lazy evaluation: time the .compute() call to measure the real work.

@predict
Partitions hold durations [1, 3, 2, 2], [5, 4, 4] and [4, 8, 6]. What is the true overall mean? Type a decimal.
```python
parts = [[1, 3, 2, 2], [5, 4, 4], [4, 8, 6]]
print(sum(sum(p) for p in parts) / sum(len(p) for p in parts))
```
= 3.9
! Sum of sums (39) over sum of counts (10). The average of the partition means would be 4.111, wrong because the partitions differ in size.

@choice
Which operation is expensive in a Dask DataFrame and should be done rarely?
- Filtering rows with a boolean condition
- Adding a column computed from two others
* set_index on a column, which sorts and reshuffles data across all partitions
- Selecting two columns
! Row-wise operations run independently on each partition; set_index needs a global sort.

@run
Write `partial(part)` returning, for one partition (a list of (group, value) pairs), a dict group → [sum, count]; `combine(partials)` merging several such dicts by adding sums and counts; and `finish(totals)` returning group → mean rounded to 3, sorted by group in a dict built in sorted order.
```starter
def partial(part):
    pass

def combine(partials):
    pass

def finish(totals):
    pass
```
```test
p1 = [("A", 1), ("A", 3), ("B", 2), ("B", 2)]
p2 = [("B", 5), ("C", 4), ("C", 4)]
p3 = [("C", 4), ("C", 8), ("D", 6)]
parts = [partial(p) for p in (p1, p2, p3)]
print(parts[1])
tot = combine(parts)
print(tot["B"], tot["C"])
print(finish(tot))
```
= {'B': [5, 1], 'C': [8, 2]}
= [9, 3] [20, 4]
= {'A': 2.0, 'B': 3.0, 'C': 5.0, 'D': 6.0}
```solution
def partial(part):
    out = {}
    for g, v in part:
        if g not in out:
            out[g] = [0, 0]
        out[g][0] += v
        out[g][1] += 1
    return out

def combine(partials):
    tot = {}
    for p in partials:
        for g, (s, c) in p.items():
            if g not in tot:
                tot[g] = [0, 0]
            tot[g][0] += s
            tot[g][1] += c
    return tot

def finish(totals):
    return {g: round(totals[g][0] / totals[g][1], 3) for g in sorted(totals)}
```
! Group B spans two partitions and C spans two; only sums and counts can be combined correctly. These match `dd.from_pandas(df, npartitions=3).groupby("origin").duration.mean().compute()` on the same ten rows.

@choice
Your Dask computation will produce a 40 GB DataFrame and your machine has 16 GB of RAM. What should you do instead of calling .compute() on it?
- Call .compute() anyway; Dask will compress it
* Reduce it first (aggregate, filter or sample), or write it out with ddf.to_parquet(...) without computing it into memory
- Use .persist()
- Increase the number of partitions
! .compute() returns a single pandas object, which must fit in memory. Writing to disk runs partition by partition.

@write
From memory, explain lazy evaluation in Dask: what happens when you write an operation, what .compute() does, and why the scheduler benefits from seeing the whole graph first.
min: 50
```solution
When you write a Dask operation, such as a filter or a groupby mean, nothing is computed. Dask records it as tasks in a graph: small numpy or pandas operations on each chunk or partition and the steps that combine their partial results. Calling .compute() hands the graph to a scheduler, which executes the tasks and returns an ordinary numpy or pandas result. Because the whole graph is known in advance, the scheduler can run independent tasks in parallel on several cores, stream partitions through memory instead of loading everything, reuse shared intermediate results, and free memory as soon as an intermediate result is no longer needed.
```
! Check that you mentioned both parallelism and memory.

--- recall
Q: What is a Dask DataFrame made of?
A: Many pandas DataFrames (partitions) split along the rows.
Q: What does .compute() do?
A: Executes the lazy task graph and returns a concrete numpy/pandas result (which must fit in memory).
Q: How does Dask compute a mean across partitions correctly?
A: Sum and count per partition, add them across partitions, divide once at the end.
Q: Which Dask DataFrame operation is expensive because it sorts across partitions?
A: set_index.
