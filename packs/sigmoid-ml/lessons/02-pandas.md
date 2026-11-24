=== pandas | data | 1 | pandas: Series, DataFrames and first exploration | d-describe
@@ About 30 min reading · Handbook chapter 3 · Homework 1
## Why this matters

Every homework in the Sigmoid course starts the same way: `df = pd.read_csv('something.csv')`, then a few minutes of looking at the table before any model is trained. pandas is the tool for that looking. Homework 1 is nothing but pandas: per-column statistics and correlation with the target. Later homework uses it to clean data, encode categories, and build the comparison tables the tasks ask for (`ML Model | Accuracy`). This lesson covers the parts you will use every week.

By convention pandas is imported as `pd` and NumPy as `np`:

```
import numpy as np
import pandas as pd
```

`import ... as pd` gives the library a short alias. Every pandas function is then reached as `pd.something`.

## Series: one labelled column

A **Series** is a one-dimensional array of values with an **index**, a label for each position. It is like a Python list that also knows the name of each slot.

```
s = pd.Series([4, 8, 15, 16], index=['a', 'b', 'c', 'd'])
s['b']        # 8, by label
s.iloc[1]     # 8, by position
s.mean()      # 10.75
s.max(), s.min()
s.argmax()    # 3, the position of the largest value
```

Without an explicit `index=`, pandas numbers the rows 0, 1, 2, and so on. Two ways to reach an element exist because labels and positions are different things: after you sort or filter a Series, label 0 may sit at position 5. `s.loc[...]` (and plain `s[...]` with a label) uses labels; `s.iloc[...]` ("integer location") always uses positions. When in doubt, be explicit with `.loc` or `.iloc`.

The handbook lists the statistical methods you will use constantly: `min`, `max`, `mean`, `median`, `mode`, `argmin`, `argmax`. One surprise: `s.mode()` returns a **Series**, not a single number, because a column can have several values tied for most frequent. Use `s.mode()[0]` (or `.iloc[0]`) to get the first.

## DataFrame: a table of Series

A **DataFrame** is a two-dimensional table: rows share an index, and each column is a Series with a name.

```
df = pd.DataFrame({
    'age':    [63, 37, 41, 56],
    'chol':   [233, 250, 204, 236],
    'sex':    [1, 1, 0, 1],
    'target': [1, 1, 1, 0],
})
```

A dict of lists is the quickest way to build one by hand: keys become column names, lists become columns. In practice you will almost always load a file:

```
df = pd.read_csv('heart.csv')
```

### Selecting

| You write | You get |
|---|---|
| `df['age']` | the `age` column as a Series |
| `df[['age', 'chol']]` | a smaller DataFrame with two columns (note the double brackets: the inner brackets are a Python list of names) |
| `df.iloc[0, 1]` | the value at row position 0, column position 1 |
| `df.iloc[:, 1:]` | all rows, every column from position 1 to the end |
| `df.loc[df['age'] > 50]` | only the rows where age is above 50 |
| `df.loc[df['age'] > 50, 'chol']` | the `chol` values of those rows |

The colon `:` is Python's slice: `a:b` means from `a` up to but not including `b`; leaving a side empty means "from the start" or "to the end". So `1:` is "from 1 to the end".

### Boolean filtering

`df['age'] > 50` does not return one True or False. It compares every row and returns a Series of booleans, one per row: `[True, False, False, True]`. Passing that Series inside `df[...]` or `df.loc[...]` keeps only the rows marked True. Combine conditions with `&` (and), `|` (or) and `~` (not), and wrap each condition in brackets:

```
df[(df['age'] > 50) & (df['sex'] == 1)]
```

The brackets are needed because `&` binds more tightly than `>` in Python. Writing `df['age'] > 50 & df['sex'] == 1` is parsed as `df['age'] > (50 & df['sex']) == 1`, which is nonsense. Also note that the Python words `and`/`or` do not work here; they need a single True or False, and a whole column is neither.

## First look at a real dataset

The handbook explores the Heart Disease UCI table (303 patients, 14 columns, target 1 = disease). These five calls are the first cell of every notebook you will write:

```
df.shape          # (303, 14): rows, columns. An attribute, so no brackets.
df.head()         # first 5 rows
df.info()         # column names, non-null counts, dtypes, memory
df.describe()     # count, mean, std, min, 25%, 50%, 75%, max per numeric column
df.columns        # the column names
```

How to read `df.describe()`: **count** is the number of non-missing values (if it is below `df.shape[0]` the column has gaps), **std** is the standard deviation, **25%/50%/75%** are the quartiles (the 50% row is the median). In the heart data, `age` has mean about 54.4, std about 9.1, min 29 and max 77.

`df.info()` tells you each column's **dtype** (data type): `int64` and `float64` are numbers, `object` usually means text. A numeric-looking column with dtype `object` is a warning sign: somewhere in it there is text such as `'?'` or `' '`, and you need to clean it before any maths.

### Categorical vs numerical columns

The handbook makes a distinction you will use all course. In the heart data every column is stored as a number, but `sex`, `cp` (chest pain type), `fbs`, `restecg`, `exang`, `slope`, `ca`, `thal` and `target` only take a few values; they encode **categories**. `age`, `chol` and `thalach` (max heart rate) are **numerical**: their values are measurements on a scale. Averages make sense for numerical columns. For categorical ones you want **frequencies**:

```
df['sex'].value_counts()
# 1    207
# 0     96
```

`value_counts()` returns a Series: the categories as the index, their counts as values, sorted from most to least frequent. `value_counts(normalize=True)` gives proportions instead of counts.

## Grouping: statistics per category

"What is the mean cholesterol for each sex?" The handbook first shows a manual loop, then the pandas way:

```
df.groupby('sex')['chol'].mean()
```

Read it in three steps. `df.groupby('sex')` splits the rows into one group per value of `sex`. `['chol']` picks the column to summarise. `.mean()` computes the mean inside each group and returns a Series indexed by the group values. Swap `.mean()` for `.median()`, `.count()`, `.std()`, or use `.agg(['mean', 'std', 'count'])` to get several at once.

Grouping by the **target** is the most useful exploratory move in a classification task: `df.groupby('target').mean()` shows, for every column, its average among sick and healthy patients. A column whose average differs a lot between the two groups is likely to be a useful feature. This is the intuition behind the correlation work in homework 1 and the next lesson.

## Correlation table

```
df.corr()                     # n × n table of Pearson correlations
df.corr()['target'].sort_values()
```

The second line takes one column of that table (correlation of every column with the target) and sorts it. Values near +1 or −1 are strong relationships; near 0, weak. For homework 1 you care about the **absolute** value: `df.corr()['target'].abs().sort_values(ascending=False)`. The first entry will always be `target` itself with 1.0, so skip it. The next lesson explains what the number means and how it is computed.

In pandas 2.x, `df.corr()` raises an error if the table has text columns. Use `df.corr(numeric_only=True)` or select numeric columns first.

## From pandas to models

scikit-learn works on NumPy arrays. Two lines turn a DataFrame into the `X` (features) and `y` (target) every model expects:

```
X = df.drop(columns=['target']).values
y = df['target'].values
```

`drop(columns=[...])` returns a copy without those columns (the original `df` is unchanged), and `.values` (or `.to_numpy()`) gives the underlying NumPy array.

## Common mistakes

> **Chained assignment.** `df[df['age'] > 50]['chol'] = 0` looks like it sets cholesterol to 0 for older patients, but it changes a temporary copy and pandas warns `SettingWithCopyWarning`. Write `df.loc[df['age'] > 50, 'chol'] = 0`: one `.loc` with both the row condition and the column.

> **Forgetting that most methods return a new object.** `df.drop(columns=['id'])` does not change `df`. Assign it: `df = df.drop(columns=['id'])`.

> **Using `and` instead of `&`.** `df[(a > 1) and (b < 2)]` raises `ValueError: The truth value of a Series is ambiguous`. Use `&`.

## Summary

A Series is a labelled column; a DataFrame is a table of them. Select with `df['col']`, `df[['a','b']]`, `.loc` (labels and conditions) and `.iloc` (positions). Filter with boolean Series combined by `&`, `|`, `~`. Explore with `shape`, `head`, `info`, `describe`, `value_counts`, `groupby(...).mean()` and `corr()`. Convert to arrays with `.values` before modelling.

--- practice
@predict
What does this print?
```python
import pandas as pd
s = pd.Series([3, 7, 7, 1, 2])
print(s.mean(), s.median(), s.mode()[0], s.argmax())
```
= 4.0 3.0 7 1
! Mean is 20 / 5 = 4.0. Sorted values are 1, 2, 3, 7, 7, so the median is 3.0. The mode is 7 (`mode()` returns a Series, `[0]` takes its first value). `argmax` returns the position of the first maximum: the 7 at position 1.

@predict
What does this print?
```python
import pandas as pd
df = pd.DataFrame({'age': [63, 37, 41, 56, 57], 'target': [1, 1, 1, 0, 0]})
print(len(df[(df['age'] > 40) & (df['target'] == 1)]))
```
= 2
! Ages above 40 are 63, 41, 56, 57. Of those, target is 1 only for 63 and 41, so two rows survive the filter.

@choice
You want the mean `chol` for each value of `target`. Which line does it?
- `df.mean('target')['chol']`
* `df.groupby('target')['chol'].mean()`
- `df['chol'].groupby().mean('target')`
- `df[df['target']]['chol'].mean()`
! `groupby` splits the rows by target, `['chol']` picks the column, `.mean()` summarises each group.

@choice
`df.info()` shows the column `TotalCharges` with dtype `object` although it holds amounts of money. What is the most likely reason?
- pandas stores all money as text
- The column is categorical
* Some cells contain text such as a blank or '?', so pandas could not read the whole column as numbers
- The column has no missing values
! One non-numeric cell forces the whole column to `object`. This exact case happens in the Telco churn data you use for homework 6. Fix it with `pd.to_numeric(df['TotalCharges'], errors='coerce')`.

@run
Without pandas, write `group_mean(keys, values)` that does what `groupby(...).mean()` does: given two equal-length lists, return a dict mapping each key to the mean of its values, rounded to 2 decimals.
```starter
def group_mean(keys, values):
    pass
```
```test
print(group_mean([1, 0, 1, 1, 0], [233, 250, 204, 236, 354]))
print(group_mean(['a', 'b', 'a'], [1, 2, 4]))
```
= {1: 224.33, 0: 302.0}
= {'a': 2.5, 'b': 2.0}
```solution
def group_mean(keys, values):
    sums, counts = {}, {}
    for k, v in zip(keys, values):
        sums[k] = sums.get(k, 0) + v
        counts[k] = counts.get(k, 0) + 1
    return {k: round(sums[k] / counts[k], 2) for k in sums}
```
! Split (one bucket per key), apply (sum and count), combine (divide). That is exactly the "split-apply-combine" idea behind `groupby`. Dicts keep insertion order, which is why key 1 comes first.

@local
Open any dataset from homework 1 in Jupyter or Colab and run `df.describe()`. Paste the output here.
min: 8
= count
= mean
= std
= 50%
! You should see one column per numeric feature and eight summary rows. Look at each column's count: any value below the number of rows means missing data.

@write
From memory: what is the difference between `df.loc` and `df.iloc`, and why does `df[(df.a > 1) & (df.b < 2)]` need the round brackets around each condition?
min: 50
```solution
loc selects by label: index labels and column names, and it also accepts a boolean Series as a row filter, e.g. df.loc[df['age'] > 50, 'chol']. iloc selects by integer position only, e.g. df.iloc[0, 1] is the first row and second column, whatever their labels are. The brackets are needed because & has higher precedence than > and <, so without them Python evaluates 1 & df.b first. Each comparison returns a boolean Series and & combines them row by row; the Python keywords and/or cannot be used on whole Series.
```
! Check you mentioned operator precedence and that each comparison produces a Series of booleans.

--- recall
Q: Which pandas call shows count, mean, std, min, quartiles and max for every numeric column?
A: `df.describe()`
Q: What does `s.mode()` return, and how do you get a single value from it?
A: A Series (there may be ties); use `s.mode()[0]` or `.iloc[0]`.
Q: How do you list each column's absolute correlation with `target`, largest first?
A: `df.corr(numeric_only=True)['target'].abs().sort_values(ascending=False)` (skip the first row, which is target itself).
Q: How do you correctly set `chol` to 0 for rows with age above 50?
A: `df.loc[df['age'] > 50, 'chol'] = 0` (one .loc with row condition and column, avoiding chained assignment).
