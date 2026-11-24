=== missing | craft | 7 | Missing values: finding, dropping and imputing | d-impute
@@ About 30 min reading · Handbook chapter 11 · Used in homework 6, 9 and every real dataset
## Why this matters

Almost every real dataset has holes, and most sklearn models (logistic regression, SVM, KNN, PCA) refuse to train on them. How you fill them changes your statistics and your model: the handbook's Melbourne housing data loses more than half its rows (13,580 to 6,196) if you simply drop every incomplete row. This lesson covers how missing values are represented, how to measure them, why they are missing, and the imputation methods from the handbook, done in a way that does not leak test data.

## How "missing" looks in Python

- **NaN** ("not a number", `np.nan`) is a special floating point value. Arithmetic with it gives NaN (`np.nan + 1` is `nan`), and it is not equal to anything, even itself: `np.nan == np.nan` is `False`. So never test for it with `==`.
- **None** is Python's "no object" value; `None + 1` raises `TypeError`. In a numeric pandas column, None is stored as NaN.
- **pd.NA** is pandas' own missing marker for nullable types (`Int64`, `string`, `boolean`).
- **NaT** is the missing timestamp.

`pd.isna(x)` (alias `isnull`) recognises all of them; `pd.notna` is its opposite. (The handbook writes `np.isna(arr)` at one point; numpy has no such function: use `pd.isna` or `np.isnan`, the latter for float arrays only.)

Missing is not zero: a 0 means "measured, and the value is zero"; NaN means "no measurement".

Disguised missing values are common too: `"?"`, `""`, `" "`, `-1`, `999`. Telco churn's `TotalCharges` has 11 blank strings, which is why the column loads as text. Convert them first, for example `pd.to_numeric(df["TotalCharges"], errors="coerce")` (unparseable text becomes NaN) or `pd.read_csv(path, na_values=["?", ""])`.

## Measuring missingness

```
df.isna().sum()                         # count of missing values per column
df.isna().mean().round(3)               # share per column (True counts as 1)
df.isna().any(axis=1).sum()             # rows with at least one missing value
df.info()                               # non-null counts per column
```

`df.isna()` returns a DataFrame of True/False; `.sum()` adds the Trues column by column. A boolean mask also selects rows: `df[df["age"].isna()]`, and `~` (the "not" operator on boolean masks) flips it: `df[~df["age"].isna()]`.

Our running example:

| | age | income | city |
|---|---|---|---|
| 0 | 25 | 30 | A |
| 1 | 32 | 42 | B |
| 2 | NaN | 38 | B |
| 3 | 51 | NaN | NaN |
| 4 | 47 | 80 | B |
| 5 | NaN | 35 | A |

`df.isna().sum()` gives age 2, income 1, city 1; `df.isna().mean()` gives 0.333, 0.167, 0.167; `len(df.dropna())` is 3: half the rows gone for 4 missing cells.

pandas statistics skip NaN by default: for `pd.Series([1, np.nan, 3])`, `.mean()` is 2.0, `.sum()` is 4.0 and `.count()` (non-missing values) is 2. numpy does not: `np.mean([1, np.nan, 3])` is `nan`; use `np.nanmean`.

## Why values are missing

The right fix depends on the mechanism:

- **MCAR**, missing completely at random: unrelated to anything (a sensor glitch). Dropping rows loses data but does not bias results.
- **MAR**, missing at random given other columns: depends on observed data (older patients skip an online form more often). Imputing from the other columns can recover a lot.
- **MNAR**, missing not at random: depends on the missing value itself (high earners decline to state income). Any simple imputation biases the result; often the fact of being missing is itself informative.

The handbook's linspace example shows the danger. Ten evenly spaced values from 500 to 1000 have mean 750. Hide the first (500) and impute 0: the mean drops to 700. Impute the mean of the other nine (777.8): the mean becomes 777.8. Mean imputation preserves the *observed* mean, and here the missing value was the smallest, so the estimate is still off. (The handbook computes the mean from `x[1:len(x) - 1]`, which also skips the last value; that is why its plot shows an imputed 750.)

## Option 1: drop

- `df.dropna()`: drop rows with any NaN. `subset=["age"]` checks only some columns; `thresh=k` keeps rows with at least k non-missing values.
- `df.dropna(axis=1)` or `df.drop(columns=[...])`: drop columns. A column that is mostly missing (say over 50 to 70%) and not essential is often better dropped.
- Dropping rows of the **target** that are missing is normal: you cannot learn from an unlabelled row.

pandas methods return a new object; assign the result (`df = df.dropna()`) rather than relying on `inplace=True`.

## Option 2: simple imputation

Replace NaN with a statistic of the column, computed on the non-missing values:

- **mean**: fine for roughly symmetric data; dragged by outliers.
- **median**: robust to outliers and skew (incomes, prices).
- **most frequent** (the mode): for categorical columns.
- **constant**: 0, or `"missing"` as its own category.

On our table, `SimpleImputer(strategy="mean")` fills age with 38.75 and income with 45; `strategy="median"` fills 39.5 and 38; `most_frequent` fills city with "B".

All simple imputation shrinks the column's variance (many identical values) and weakens its correlations. Adding a **missing indicator**, a 0/1 column saying "this was imputed", lets the model learn if missingness itself predicts the target: `SimpleImputer(add_indicator=True)` appends one such column per feature that had missing values.

## Option 3: model-based imputation

- **KNN imputation** (`KNNImputer`, "KNNI" in the handbook): for each row with a gap, find the k most similar rows using the features both have (a NaN-aware Euclidean distance), and fill the gap with their average. In our table with k = 2, row 2 (income 38) has nearest incomes 42 and 30, so its age becomes (32 + 25)/2 = 28.5; row 3 (age 51) has nearest ages 47 and 32, so its income becomes (80 + 42)/2 = 61. Compare with the mean fill (38.75 and 45): KNN uses the relationship between age and income. Scale features first, because distances are involved.
- **MICE**, multiple imputation by chained equations: each column with gaps is modelled as a regression on the other columns; predictions fill the gaps, and the cycle repeats until the fills stabilise. The handbook uses the `impyute` package, which is no longer maintained; sklearn's `IterativeImputer` implements the same idea (it needs `from sklearn.experimental import enable_iterative_imputer` first).
- **Reparo**, Sigmoid's own imputation library, offers several methods with one interface, including **cold-deck imputation** (`CDI`): copy the missing value from the nearest complete neighbour. Its `apply` changes the DataFrame in place.
- Some models accept NaN natively: `HistGradientBoostingClassifier`, and trees and forests in recent sklearn versions.

## Impute without leaking

An imputer **learns** values (a mean, neighbours), so it must be fitted on the training set only and then applied to both sets, exactly like a scaler. The clean way is a pipeline:

```
from sklearn.pipeline import make_pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

model = make_pipeline(SimpleImputer(strategy="median", add_indicator=True),
                      StandardScaler(), LogisticRegression(max_iter=1000))
model.fit(X_train, y_train)      # the medians come from X_train only
model.score(X_test, y_test)
```

Different column types need different imputers; `ColumnTransformer` (week 9) applies median imputation to numeric columns and most-frequent to categorical ones in one step.

## Common mistakes

> **`df["age"] == np.nan`** is always False. Use `.isna()`.

> **Filling before splitting** (`df.fillna(df.mean())` on all data) leaks test statistics into training.

> **Mean-imputing a skewed column** such as income. Use the median, and consider an indicator.

## Summary

NaN, None, pd.NA and NaT mark missing values; find them with `isna().sum()` and `isna().mean()`, and convert disguised markers first. Missingness can be MCAR, MAR or MNAR, and only MCAR makes dropping harmless. Drop rows or columns when little is lost; otherwise impute with mean, median, mode or a constant (plus an indicator), or with KNNImputer and IterativeImputer (MICE). Fit imputers on training data only, inside a pipeline.

--- practice
@predict
What does `np.nan == np.nan` evaluate to?
```python
import numpy as np
print(np.nan == np.nan)
```
= False
! NaN compares unequal to everything, itself included. Test with `pd.isna` or `np.isnan`.

@predict
`s = pd.Series([4, None, 8, None])`. What does `s.mean()` print?
```python
import pandas as pd
s = pd.Series([4, None, 8, None])
print(s.mean())
```
= 6.0
! pandas skips missing values: (4 + 8)/2. numpy's `np.mean` on the same values would give nan.

@choice
Customers with high incomes are less likely to state their income. What kind of missingness is this?
- MCAR
- MAR
* MNAR
- Not missingness, just noise
! The probability of being missing depends on the missing value itself. Simple imputation will underestimate incomes; a missing indicator helps the model use the pattern.

@choice
An income column is strongly right-skewed with a few huge values. Which simple imputation is safest?
- Mean
* Median
- Zero
- Most frequent
! The median ignores how extreme the extremes are; the mean is pulled toward them, and zero is a value no one has.

@run
Write `col_missing(rows)`: `rows` is a list of dicts (one per record) where a missing value is `None`. Return a dict mapping each column name (sorted) to the share of missing values, rounded to 3. Then `fill_median(rows, col)` returning a new list of dicts with the missing values of `col` replaced by the median of its non-missing values.
```starter
def col_missing(rows):
    pass

def fill_median(rows, col):
    pass
```
```test
rows = [{"age": 25, "inc": 30}, {"age": 32, "inc": 42}, {"age": None, "inc": 38},
        {"age": 51, "inc": None}, {"age": 47, "inc": 80}, {"age": None, "inc": 35}]
print(col_missing(rows))
print([r["age"] for r in fill_median(rows, "age")])
print([r["inc"] for r in fill_median(rows, "inc")])
print(rows[2]["age"])
```
= {'age': 0.333, 'inc': 0.167}
= [25, 32, 39.5, 51, 47, 39.5]
= [30, 42, 38, 38, 80, 35]
= None
```solution
def col_missing(rows):
    out = {}
    for c in sorted(rows[0]):
        out[c] = round(sum(1 for r in rows if r[c] is None) / len(rows), 3)
    return out

def fill_median(rows, col):
    vals = sorted(r[col] for r in rows if r[col] is not None)
    n = len(vals)
    med = vals[n // 2] if n % 2 else (vals[n // 2 - 1] + vals[n // 2]) / 2
    out = []
    for r in rows:
        new = dict(r)
        if new[col] is None:
            new[col] = med
        out.append(new)
    return out
```
! The last test checks you returned new dicts and left the original untouched. `dict(r)` makes a copy, so changing it leaves r alone. Median of 25, 32, 47, 51 is (32 + 47)/2 = 39.5; for incomes 30, 35, 38, 42, 80 it is 38.

@choice
Where should `SimpleImputer` be fitted?
- On the full dataset before splitting, so it sees more data
* On the training set only, for example inside a Pipeline
- Separately on the training and test sets
- On the test set, because that is where predictions are made
! The imputer learns statistics; fitting it on test data leaks information. Fitting separately on the test set gives inconsistent fills.

@write
From memory, compare mean imputation with KNN imputation: how each fills a gap, one weakness of each, and when you would add a missing indicator.
min: 60
```solution
Mean imputation fills every gap in a column with the mean of the observed values. It is fast but ignores the other columns, shrinks the column's variance, weakens correlations and is pulled by outliers. KNN imputation finds the k rows most similar to the incomplete row on the features both have, and fills the gap with their average, so it uses relationships between features; but it is slower, needs scaled features because it uses distances, and can be poor when few complete neighbours exist. I would add a missing indicator when missingness might itself carry information about the target, for example when values are missing not at random.
```
! Check that you mentioned scaling for KNN and the variance shrinkage of mean imputation.

--- recall
Q: How do you count missing values per column, and get the share?
A: df.isna().sum() and df.isna().mean().
Q: Name the three missingness mechanisms.
A: MCAR (completely at random), MAR (depends on observed data), MNAR (depends on the missing value itself).
Q: Which sklearn classes impute with a statistic, with neighbours, and with chained regressions?
A: SimpleImputer, KNNImputer, IterativeImputer (MICE-style).
Q: What does add_indicator=True do?
A: Appends a 0/1 column per feature with missing values, marking which cells were imputed.
