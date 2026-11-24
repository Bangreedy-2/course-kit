=== linalg | math | 2 | Vectors, matrices and matrix multiplication | d-matmul
@@ About 30 min reading · Handbook chapter 4.1 · Used by every model from week 3
## Why this matters

A dataset is a matrix. Each row is a sample (a patient, a house, a customer), each column a feature. A model's weights are a vector. "Make a prediction for every row" is one matrix–vector product. The handbook writes linear regression as `Ax = y`, its gradient as `2Xᵀ(Xw − y)`, PCA as eigenvectors of a covariance matrix, and its code is full of `np.matmul`, `X.T` and `np.dot`. This lesson makes those symbols readable.

## Vectors

A **vector** is an ordered list of numbers, written in bold or with an arrow: **v** = (3, 4). It can mean a point, a direction, or simply one row of data: a patient described by (age, cholesterol, max heart rate) is a vector with 3 entries, or a vector "in 3 dimensions".

Operations, entry by entry:

- **Addition**: (1, 2) + (3, 5) = (4, 7). Both vectors must have the same length.
- **Scalar multiplication**: a **scalar** is a single number. 3 · (1, 2) = (3, 6).
- **Dot product**: multiply matching entries and add the results. (1, 2, 3) · (4, 5, 6) = 1·4 + 2·5 + 3·6 = 32. The result is a scalar.
- **Length (norm)**: ‖v‖ = √(v · v). For (3, 4): √(9 + 16) = 5. The distance between two points is the length of their difference, which is the Euclidean distance used by k-NN and k-means.

The dot product is the most important operation in this course. A linear model's prediction is a dot product of the weights with a sample: with weights **w** = (0.5, −1, 2) and sample **x** = (4, 1, 3), the prediction is 0.5·4 − 1·1 + 2·3 = 7. Each weight says how much its feature pushes the prediction up or down.

Geometrically, **a · b = ‖a‖ ‖b‖ cos θ**, where θ is the angle between them. A dot product of 0 means the vectors are **perpendicular** (orthogonal). PCA's components are perpendicular to each other; the SVM's weight vector is perpendicular to its separating line.

## Matrices

A **matrix** is a rectangular grid of numbers. Its **shape** is (rows, columns): a matrix with 303 rows and 13 columns has shape (303, 13), the shape of the heart dataset without its target. The entry in row i, column j is written Aᵢⱼ (or A[i, j] in NumPy, counting from 0).

Special matrices:

- **Square**: as many rows as columns.
- **Identity** I: 1 on the diagonal (top-left to bottom-right), 0 elsewhere. Multiplying by I changes nothing: AI = A.
- **Diagonal**: zeros everywhere off the diagonal. The Σ matrix in SVD is diagonal.
- **Symmetric**: A equals its transpose. Every covariance matrix is symmetric.

### Transpose

The **transpose** Aᵀ (NumPy: `A.T`) flips a matrix over its diagonal: rows become columns. If A has shape (3, 2), Aᵀ has shape (2, 3).

```
A = | 1 2 |        Aᵀ = | 1 3 5 |
    | 3 4 |             | 2 4 6 |
    | 5 6 |
```

## Matrix multiplication

To multiply A (shape m × n) by B (shape n × p):

1. The **inner** sizes must match: A's number of columns (n) must equal B's number of rows (n).
2. The result has the **outer** sizes: m × p.
3. Entry (i, j) of the result is the dot product of **row i of A** with **column j of B**.

Worked example:

```
| 1 2 |   | 5 6 |   | 1·5 + 2·7   1·6 + 2·8 |   | 19 22 |
| 3 4 | · | 7 8 | = | 3·5 + 4·7   3·6 + 4·8 | = | 43 50 |
```

Top-left: row 1 of A is (1, 2), column 1 of B is (5, 7), so 1·5 + 2·7 = 19. Do the other three the same way.

Two facts that cause bugs:

- **Order matters.** In general AB ≠ BA, and often only one of them is even defined. A (3 × 2) times B (2 × 4) is fine and gives 3 × 4; B times A needs 4 = 3, so it fails.
- **Matrix product is not element-wise product.** Multiplying matching entries is a different operation (the Hadamard product). In NumPy, `A * B` is element-wise and `A @ B` (or `np.matmul(A, B)`, `np.dot(A, B)`) is the matrix product.

### Predictions for every row at once

Put n samples as the rows of X (shape n × d) and the weights as a column vector w (shape d × 1). Then Xw has shape n × 1: one prediction per row, each the dot product of that row with w. That single line replaces a loop over samples, and it is exactly the handbook's `np.matmul(X, self.params__)` in `predict`.

The handbook's three-point example turns the equations a + b = 1, 2a + b = 2, 3a + b = 2 into matrix form:

```
| 1 1 |            | 1 |
| 2 1 | · | a |  = | 2 |
| 3 1 |   | b |    | 2 |
```

The column of ones is how the intercept b gets included: it multiplies b by 1 in every row. You will see this "add a column of ones" trick in every from-scratch model.

## Inverse and why we rarely use it

For a square matrix A, the **inverse** A⁻¹ satisfies A A⁻¹ = I. If Ax = y and A is invertible, then x = A⁻¹y: the system has exactly one solution. Not every matrix has an inverse; a matrix whose columns are redundant (one column is a combination of others) is **singular** and cannot be inverted. In data, that happens when two features carry the same information, for example a price in euros and the same price in lei.

The handbook includes a `compute_inverse` function based on Gaussian elimination to show the mechanics. In practice:

- The regression system Xw = y usually has more equations (rows) than unknowns, so it has no exact solution and X is not square. Linear regression looks for the w that comes closest, which leads to gradient descent next week, or to the **normal equation** w = (XᵀX)⁻¹Xᵀy.
- For numerical stability, libraries use `np.linalg.solve` or `np.linalg.lstsq` rather than computing an inverse explicitly.

For a 2 × 2 matrix there is a short formula worth knowing:

$$
| a b |⁻¹                 |  d  −b |
| c d |    = 1/(ad − bc) · | −c   a |
$$

The number ad − bc is the **determinant**. If it is 0, the matrix is singular.

## Eigenvectors, briefly

For a square matrix A, an **eigenvector** v is a direction that A only stretches, without turning: Av = λv. The stretch factor λ (lambda) is its **eigenvalue**. You do not need to compute them by hand. In week 5, PCA finds the eigenvectors of the covariance matrix: they are the directions in which the data varies most, and the eigenvalues say how much variance lies along each.

## Shapes: the debugging habit

Most linear-algebra bugs are shape bugs. Before writing any line with a product, write the shapes next to it:

```
X: (n, d)   w: (d, 1)   →  X @ w: (n, 1)
Xᵀ: (d, n)  (Xw − y): (n, 1)  →  Xᵀ(Xw − y): (d, 1)   same shape as w, as a gradient must be
```

If the inner sizes do not match, the formula is wrong or something needs a transpose.

## Common mistakes

> **Mixing up `*` and `@`.** In NumPy `X * w` silently broadcasts and returns a matrix of products instead of predictions. Use `X @ w` for the matrix product.

> **Forgetting that order matters.** `Xᵀ(Xw − y)` is (d × n)(n × 1). Writing `(Xw − y)Xᵀ` multiplies (n × 1)(d × n), which is not defined.

> **Treating a 1-D array as a column.** A NumPy array of shape (n,) is neither a row nor a column; the next lesson shows `reshape(-1, 1)` to fix that.

## Summary

Vectors are lists of numbers; the dot product multiplies matching entries and adds them, and it is how every linear model predicts. A matrix has a shape (rows, columns). AB needs A's columns to equal B's rows and gives a matrix with A's rows and B's columns; each entry is a row-times-column dot product. Xw computes predictions for all rows at once. The transpose flips rows and columns. Inverses solve square systems but are avoided in practice. Always track shapes.

--- practice
@predict
Compute the dot product (2, −1, 3) · (4, 0, −2). Type the number.
```python
print(sum(a * b for a, b in zip([2, -1, 3], [4, 0, -2])))
```
= 2
! 2·4 + (−1)·0 + 3·(−2) = 8 + 0 − 6 = 2.

@choice
A has shape (5, 3) and B has shape (3, 2). Which statement is true?
* AB exists and has shape (5, 2); BA does not exist
- AB has shape (3, 3)
- Both AB and BA exist
- AB has shape (5, 3)
! Inner sizes 3 and 3 match, outer sizes give (5, 2). For BA the inner sizes would be 2 and 5, which do not match.

@predict
What is the top-right entry of the product below? Type the number.
```
| 2 0 |   | 1 3 |
| 1 4 | · | 5 2 |
```
```python
A = [[2, 0], [1, 4]]; B = [[1, 3], [5, 2]]
print(A[0][0] * B[0][1] + A[0][1] * B[1][1])
```
= 6
! Top-right = row 1 of A, (2, 0), dot column 2 of B, (3, 2) = 2·3 + 0·2 = 6.

@run
Write `predict(X, w)` that returns X·w for a matrix X (list of rows) and a weight list w, and `shape(M)` that returns `(rows, cols)` of a matrix stored as a list of rows.
```starter
def shape(M):
    pass

def predict(X, w):
    pass
```
```test
X = [[1, 1], [2, 1], [3, 1]]
print(shape(X))
print(predict(X, [0.5, 1]))
print(predict([[4, 1, 3]], [0.5, -1, 2]))
```
= (3, 2)
= [1.5, 2.0, 2.5]
= [7.0]
```solution
def shape(M):
    return (len(M), len(M[0]))

def predict(X, w):
    return [sum(a * b for a, b in zip(row, w)) for row in X]
```
! Each prediction is one dot product of a row with the weights. The last column of ones makes the final weight (1) act as the intercept.

@predict
What is the determinant of the matrix below? (ad − bc)
```
| 4 2 |
| 6 3 |
```
```python
print(4 * 3 - 2 * 6)
```
= 0
! 4·3 − 2·6 = 0, so this matrix is singular: the second row is 1.5 times the first. It has no inverse, just like a dataset with two redundant features.

@choice
X has shape (100, 4), w has shape (4, 1), y has shape (100, 1). What is the shape of Xᵀ(Xw − y)?
- (100, 1)
* (4, 1)
- (100, 4)
- It is not defined
! Xw is (100, 1); minus y keeps (100, 1); Xᵀ is (4, 100); (4, 100)·(100, 1) = (4, 1), the same shape as w. A gradient always has the shape of the thing it updates.

@write
From memory, explain how to compute entry (i, j) of a matrix product AB, when the product is defined, and why Xw gives a prediction for every sample at once.
min: 50
```solution
AB is defined when the number of columns of A equals the number of rows of B; the result has A's number of rows and B's number of columns. Entry (i, j) is the dot product of row i of A with column j of B: multiply matching entries and add them. If X holds one sample per row and w holds the weights, then row i of Xw is the dot product of sample i with the weights, which is exactly the linear model's prediction for that sample, so one product gives all predictions.
```
! Check you stated both the size condition and the row-by-column rule.

--- recall
Q: When is AB defined, and what shape does it have?
A: When A's column count equals B's row count; shape (rows of A, columns of B).
Q: In NumPy, what is the difference between `A * B` and `A @ B`?
A: `*` is element-wise; `@` (np.matmul / np.dot) is the matrix product.
Q: Why does the handbook add a column of ones to X?
A: So one weight multiplies 1 in every row and acts as the intercept b.
Q: What does a determinant of 0 tell you?
A: The matrix is singular (columns/rows are redundant) and has no inverse.
