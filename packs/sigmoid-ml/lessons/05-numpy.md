=== numpy | py | 2 | NumPy arrays, axes and broadcasting | d-vector
@@ About 30 min reading · Handbook chapter 4.2 · Homework 2
## Why this matters

Every from-scratch model in the handbook is written in NumPy, and scikit-learn takes and returns NumPy arrays. Homework 2 is five formulas to implement with NumPy. The skill is turning a formula with Σ and subscripts into one line without a Python loop. That line is shorter, easier to check against the formula, and often 50 to 100 times faster: the handbook times a loop over a million numbers against the vectorised version to make exactly this point.

This lesson's exercises that need NumPy itself are predict and local exercises (the in-page Python has no NumPy); the run exercises rebuild the same ideas in plain Python so you understand what NumPy does for you.

## Arrays and their attributes

```
import numpy as np
np.random.seed(42)                            # same random numbers every run
v = np.array([3, 1, 4, 1, 5])                 # 1-D array, shape (5,)
M = np.random.randint(10, size=(3, 4))        # 2-D, shape (3, 4), ints 0..9
T = np.random.randint(10, size=(3, 4, 5))     # 3-D, shape (3, 4, 5)

M.ndim    # 2      number of dimensions (axes)
M.shape   # (3, 4) size along each axis
M.size    # 12     total number of elements
M.dtype   # int64  type of every element (one type for the whole array)
```

`np.random.seed(42)` fixes the random generator so that your notebook gives the same numbers each time; homework that compares hyperparameters asks you to fix `random_state` for the same reason.

Unlike a Python list, an array holds one data type. `np.array([1, 2.5])` becomes all floats; `np.array([1, 'a'])` becomes all strings, which is a quiet source of bugs when a CSV column contains text.

Ways to create arrays you will use:

| Call | Result |
|---|---|
| `np.zeros(3)`, `np.zeros((2, 4))` | filled with 0.0 |
| `np.ones((2, 4))` | filled with 1.0 |
| `np.ones_like(y)` | ones with the same shape as y (used for the intercept column) |
| `np.arange(0, 10, 2)` | 0, 2, 4, 6, 8: like `range`, end excluded |
| `np.linspace(0, 1, 5)` | 0, 0.25, 0.5, 0.75, 1: n evenly spaced points, end included |
| `np.random.random((2, 3))` | uniform floats in [0, 1) |

## Indexing and slicing

Slices work like Python lists, one per axis, separated by commas:

```
v[:3]      # first three elements
v[3:]      # from index 3 to the end
v[::2]     # every second element (start:stop:step)
v[-1]      # last element
M[0, 1]    # row 0, column 1
M[:, 0]    # all rows, column 0: the first column, shape (3,)
M[1, :]    # row 1
M[:, ::2]  # every second column
```

**Boolean masks** select elements by a condition, exactly like pandas filtering:

```
v[v > 2]          # array([3, 4, 5])
M[M % 2 == 0]     # all even entries, flattened to 1-D
```

`%` is the remainder operator: `x % 2 == 0` means x is even.

One trap: a slice is a **view**, not a copy. `sub = M[:2, :2]; sub[0, 0] = 99` changes M too. Use `.copy()` when you need an independent array.

## Shape changes

`reshape` gives the same data a new shape; the total number of elements must stay the same. `-1` means "work this size out for me":

```
np.arange(12).reshape(3, 4)     # 3 rows, 4 columns
np.arange(12).reshape(-1, 1)    # one column, 12 rows: shape (12, 1)
y.reshape(-1, 1)                # turn a 1-D target into a column
```

The difference between shape `(n,)` and `(n, 1)` matters. A 1-D array has one axis; it is neither a row nor a column. scikit-learn wants X as 2-D, so a single feature must be reshaped: `LinearRegression().fit(x.reshape(-1, 1), y)`. The handbook's linear regression reshapes its batches to `(rows, 1)` for the same reason.

Joining arrays:

```
np.concatenate([A, B])            # stack along axis 0 (more rows)
np.concatenate([A, B], axis=1)    # along axis 1 (more columns)
np.vstack([x, M])                 # vertical stack
np.hstack([M, np.ones((3, 1))])   # add a column of ones on the right
```

That last line is the handbook's intercept trick: `np.hstack((X, np.ones((len(X), 1))))` in its logistic regression.

## Axes: the one idea to get right

**axis=0** runs down the rows, so an aggregation with `axis=0` collapses the rows and gives **one result per column**. **axis=1** runs across columns and gives **one result per row**.

```
X = np.array([[1, 2, 3],
              [4, 5, 6]])
X.sum()          # 21: everything
X.sum(axis=0)    # array([5, 7, 9]): column sums
X.sum(axis=1)    # array([ 6, 15]): row sums
X.mean(axis=0)   # array([2.5, 3.5, 4.5]): column means, the "mu" of standardisation
```

A way to remember it: the axis you name is the one that disappears. X has shape (2, 3); summing over axis 0 removes the 2 and leaves shape (3,).

## Vectorised arithmetic (ufuncs)

Arithmetic between arrays of the same shape happens element by element, and functions like `np.exp`, `np.log`, `np.sqrt`, `np.abs` apply to every element. These are called **universal functions** (ufuncs).

```
x = np.arange(5)    # [0 1 2 3 4]
x + 10              # [10 11 12 13 14]
x * 2               # [0 2 4 6 8]
x ** 2              # [ 0  1  4  9 16]
x / 2               # [0.  0.5 1.  1.5 2. ]
x // 2              # [0 0 1 1 2]   floor division
np.exp(-x)          # e⁰, e⁻¹, …
```

So a formula like the sigmoid, 1 / (1 + e⁻ᶻ), becomes `1 / (1 + np.exp(-z))` and works for one number, a vector or a whole matrix.

Sums with Σ become aggregations. The mean squared error

$$
MSE = (1/n) · Σ (yᵢ − ŷᵢ)²
$$

becomes `np.mean((y - y_hat) ** 2)`. Read it from inside out: subtract element-wise, square element-wise, then average. No loop.

## Broadcasting

What happens with `X - X.mean(axis=0)`, a (2, 3) matrix minus a (3,) vector? NumPy **broadcasts**: it stretches the smaller array along the missing axis so the shapes match, without copying memory. The rule, comparing shapes from the right:

1. Two sizes are compatible if they are equal or one of them is 1 (a missing axis counts as 1).
2. A size of 1 is stretched to match the other.

| Shapes | Result |
|---|---|
| (2, 3) and (3,) | (2, 3): the vector is subtracted from every row |
| (2, 3) and (2, 1) | (2, 3): the column is subtracted from every column |
| (2, 3) and (2,) | error: compared from the right, 3 vs 2 do not match |
| (4, 1) and (1, 3) | (4, 3): an outer-product-like grid |

Worked example, standardising columns (week 9's StandardScaler):

```
X = np.array([[1., 10.], [3., 20.], [5., 60.]])
mu = X.mean(axis=0)          # [ 3. 30.]           shape (2,)
sd = X.std(axis=0)           # [1.633 21.602]      shape (2,)
Z = (X - mu) / sd            # shape (3, 2), each column now mean 0, std 1
```

Row 1 minus mu is (1 − 3, 10 − 30) = (−2, −20); divided by sd it is about (−1.22, −0.93).

The (2,) vs (2, 3) error in the table is the classic broadcasting bug: subtracting **row** means from a matrix needs `X - X.mean(axis=1, keepdims=True)` (or `.reshape(-1, 1)`) so the means form a column of shape (2, 1).

## Matrix products and linear algebra

```
A @ B                     # matrix product (same as np.matmul(A, B))
np.dot(u, v)              # dot product of two 1-D arrays
X.T                       # transpose
np.linalg.inv(A)          # inverse
np.linalg.eig(C)          # eigenvalues, eigenvectors (PCA)
np.linalg.svd(X)          # singular value decomposition (PCA)
np.cov(X.T)               # covariance matrix: rows are variables, so transpose
np.corrcoef(X.T)          # correlation matrix
```

`np.cov` treats each **row** as a variable by default, the opposite of a data table. Pass `X.T` or `rowvar=False`. The handbook's PCA does `np.corrcoef(X.T)` for this reason.

## Common mistakes

> **`*` instead of `@`.** `X * w` with X (n, d) and w (d,) broadcasts into an (n, d) matrix of products and does not raise an error. Predictions need `X @ w`.

> **Shape (n,) vs (n, 1).** `y - X @ w` with y (n,) and X @ w (n, 1) broadcasts into an (n, n) matrix: no error, completely wrong loss. Keep shapes consistent, usually by reshaping y to (n, 1) or w to (d,).

> **Integer arrays and division.** `np.array([1, 2]) / 2` gives floats, but in-place `a /= 2` on an int array raises a type error. Create float arrays (`np.array([...], dtype=float)`) when you will update them, for example weights.

## Summary

Arrays have `shape`, `ndim`, `size`, `dtype`. Slice per axis with commas; mask with booleans; slices are views. `reshape(-1, 1)` makes a column. `axis=0` aggregates down rows (per-column results), `axis=1` across columns. Arithmetic and ufuncs work element-wise, so formulas translate directly. Broadcasting aligns shapes from the right, stretching sizes of 1. Use `@` for matrix products and watch (n,) vs (n, 1).

--- practice
@predict
What does this print?
```python
import numpy as np
X = np.array([[1, 2, 3], [4, 5, 6]])
print(X.sum(axis=0), X.sum(axis=1), X.shape)
```
= [5 7 9] [ 6 15] (2, 3)
=| [5 7 9] [6 15] (2, 3)
! axis=0 collapses the rows, giving one sum per column; axis=1 gives one sum per row. NumPy pads small numbers with a space when printing, which is why `[ 6 15]` has a space; either form is accepted here.

@predict
What is the shape of the result? Type it like `(a, b)`.
```python
import numpy as np
A = np.ones((4, 1))
B = np.arange(3)
print((A + B).shape)
```
= (4, 3)
! Compared from the right: 1 vs 3 stretches to 3; 4 vs a missing axis (treated as 1) stretches to 4. Result (4, 3).

@choice
X has shape (100, 3). Which line subtracts each **row's** mean from that row?
- `X - X.mean(axis=0)`
- `X - X.mean(axis=1)`
* `X - X.mean(axis=1).reshape(-1, 1)`
- `X - X.mean()`
! `X.mean(axis=1)` has shape (100,), which does not broadcast against (100, 3) (3 vs 100). Reshaping it to (100, 1) makes it a column that is stretched across the 3 columns.

@run
Rebuild what NumPy does for you. Write `colwise(X, op)` that returns one value per column, where `op` is `"sum"`, `"mean"` or `"max"`, and `standardize(X)` that returns `(X − column mean) / column std` (population std), each value rounded to 3.
```starter
import math

def colwise(X, op):
    pass

def standardize(X):
    pass
```
```test
X = [[1, 10], [3, 20], [5, 60]]
print(colwise(X, "sum"), colwise(X, "mean"), colwise(X, "max"))
print(standardize(X))
```
= [9, 90] [3.0, 30.0] [5, 60]
= [[-1.225, -0.926], [0.0, -0.463], [1.225, 1.389]]
```solution
import math

def colwise(X, op):
    out = []
    for col in zip(*X):
        if op == "sum":
            out.append(sum(col))
        elif op == "mean":
            out.append(sum(col) / len(col))
        else:
            out.append(max(col))
    return out

def standardize(X):
    mu = colwise(X, "mean")
    sd = []
    for col, m in zip(zip(*X), mu):
        sd.append(math.sqrt(sum((v - m) ** 2 for v in col) / len(col)))
    return [[round((v - m) / s, 3) for v, m, s in zip(row, mu, sd)] for row in X]
```
! In NumPy this whole exercise is `X.sum(axis=0)`, `X.mean(axis=0)`, `X.max(axis=0)` and `(X - X.mean(axis=0)) / X.std(axis=0)`.

@predict
What does this print?
```python
import numpy as np
v = np.array([3, 1, 4, 1, 5, 9, 2, 6])
print(v[v > 3].sum(), v[::3])
```
= 24 [3 1 2]
! `v > 3` keeps 4, 5, 9, 6, which sum to 24. `v[::3]` takes indices 0, 3, 6: values 3, 1, 2.

@local
In a notebook, run this and paste the output. It shows the (n,) vs (n, 1) trap.
```
import numpy as np
y = np.array([1., 2., 3.])
p = np.array([[1.], [2.], [4.]])
print((y - p).shape)
print((y - p.ravel()).shape)
print(np.mean((y - p.ravel()) ** 2))
```
min: 3
= (3, 3)
= (3,)
= 0.333
! `y - p` silently broadcasts into a 3 × 3 matrix; an MSE computed on it would be wrong without any error. `ravel()` flattens p back to shape (3,), and the MSE is 1/3.

@write
From memory, explain what axis=0 and axis=1 mean for `X.mean(...)`, and state the broadcasting rule in your own words with one example of shapes that work and one that fails.
min: 50
```solution
axis=0 aggregates down the rows, so it returns one value per column (for X of shape (n, d), the result has shape (d,)); axis=1 aggregates across the columns and returns one value per row (shape (n,)). The axis you name is the one that disappears. Broadcasting compares shapes from the right; two sizes are compatible if they are equal or one of them is 1 (a missing axis counts as 1), and size-1 axes are stretched. (5, 3) with (3,) works and gives (5, 3); (5, 3) with (5,) fails because 3 and 5 differ in the last position.
```
! Check that your failing example really fails when compared from the right.

--- recall
Q: For X of shape (n, d), what shape does `X.mean(axis=0)` have, and what does it contain?
A: (d,): the mean of each column.
Q: How do you turn a 1-D array y of shape (n,) into a column of shape (n, 1)?
A: `y.reshape(-1, 1)`
Q: State the broadcasting rule.
A: Compare shapes from the right; sizes must be equal or one must be 1 (missing counts as 1); size-1 axes are stretched.
Q: Why does `np.cov(X)` on a data table usually give the wrong matrix?
A: np.cov treats rows as variables; use `np.cov(X.T)` or `rowvar=False`.
