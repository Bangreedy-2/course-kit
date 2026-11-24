=== pca | unsup | 5 | Principal component analysis | d-cov
@@ About 30 min reading · Handbook chapter 7 · Homework 5
## Why this matters

Labelled data is expensive, and many datasets have dozens or hundreds of columns. PCA (principal component analysis) is the handbook's first **unsupervised** method: it uses only X, never y. It compresses many correlated columns into a few new ones that keep most of the information, so you can plot high-dimensional data in 2-D, speed up models, and remove redundancy. Homework 5 has you run the handbook's PCA (two ways) and sklearn's on iris, compare the 2-D pictures, and project 64-pixel digit images to two dimensions.

## The idea in one picture

Imagine 5 points: (1, 2), (2, 3), (3, 5), (4, 4), (5, 6). They lie roughly along a diagonal line. If you rotate the axes so that the first new axis runs along that diagonal, almost all the spread of the data is along the first axis and very little along the second. Keep only the first axis and you have described each point with one number instead of two, losing little.

Those new axes are the **principal components**. The first is the direction of greatest variance; the second is the direction of greatest remaining variance that is **perpendicular** to the first; and so on. There are as many components as original features, but usually the first few carry most of the variance. PCA is a rotation followed by dropping the least informative axes.

Why variance? A column that never changes (the handbook's example: a `sex` column in a dataset of only women) carries no information. Directions along which the data varies a lot are where the differences between samples live.

## The algorithm with eigenvectors

### Step 1: standardise

Subtract each column's mean and divide by its standard deviation, z = (x − x̄)/σ. Without this, a column measured in large units (salary in euros) dominates the variance and therefore the components, regardless of how informative it is. The handbook's example contrasts age (0 to 150) with salary (up to millions). In sklearn:

```
from sklearn.preprocessing import StandardScaler
X_scaled = StandardScaler().fit_transform(X)
```

After standardising, every column has mean 0 and standard deviation 1. Most values then fall between about −3 and 3 (the handbook says "between −3 and 3"; that is typical, not guaranteed).

### Step 2: the covariance matrix

For f features, the **covariance matrix** is f × f. Entry (i, j) is the covariance between feature i and feature j; the diagonal holds each feature's variance. It is symmetric because cov(x, y) = cov(y, x).

Because the data is centred (mean 0), the covariance simplifies to a matrix product:

$$
C = XᵀX / (n − 1)
$$

The handbook writes σ(x, y) = XYᵀ/(n − 1); the transpose goes on whichever side makes "features × features" come out. Shape check: Xᵀ is (f, n), X is (n, f), so XᵀX is (f, f). In NumPy, `np.cov(X.T)` (remember that `np.cov` treats rows as variables). For standardised data the covariance matrix equals the **correlation** matrix, which is why the handbook's code uses `np.corrcoef(X.T)`.

For the five points above (not standardised, just centred, to keep numbers simple): the means are 3 and 4, and

$$
C = | 2.5   2.25 |
    | 2.25  2.5  |
$$

Both variances are 2.5, and the large covariance 2.25 says the two columns rise together.

### Step 3: eigenvectors and eigenvalues

An **eigenvector** v of C is a direction that C only stretches: Cv = λv. Its **eigenvalue** λ is the stretch factor. For a covariance matrix, the eigenvectors are exactly the principal component directions, and each eigenvalue is the **variance of the data along that direction**. The handbook says you do not need to know how eigenvectors are computed; `np.linalg.eig` does it.

For a symmetric 2 × 2 matrix of the form [[a, b], [b, a]] there is a shortcut: eigenvalues a + b and a − b, with eigenvectors (1, 1)/√2 and (1, −1)/√2. Here: λ₁ = 2.5 + 2.25 = 4.75 along the diagonal (0.707, 0.707), and λ₂ = 2.5 − 2.25 = 0.25 along (0.707, −0.707). (√2/2 ≈ 0.707; dividing by √2 makes the vectors length 1.)

Sort the components by eigenvalue, largest first. The handbook builds a list of (eigenvalue, eigenvector) pairs and sorts it with `key=lambda x: x[0], reverse=True`: `lambda x: x[0]` is a tiny unnamed function that returns the first element of a pair, so the sort uses the eigenvalue.

### Explained variance ratio

Each eigenvalue divided by their sum is the share of total variance that component explains:

$$
explained variance ratio of component k = λ_k / Σ λ
$$

Here: 4.75 / 5 = 0.95 and 0.25 / 5 = 0.05. One component keeps 95% of the variance. The cumulative sum (`np.cumsum`) tells you how many components you need to keep, say, 95% of the variance, which is a common way to pick `n_components`. Homework 5 asks you to plot this.

On standardised iris, the four ratios are about 0.730, 0.229, 0.037 and 0.005: the first two components keep about 96% of the variance, which is why a 2-D iris plot separates the species so well.

### Step 4: project

Stack the top k eigenvectors as columns into a matrix W (shape f × k) and multiply:

$$
X_reduced = X_centred · W        shape (n, f) · (f, k) = (n, k)
$$

Each new coordinate is a dot product of a sample with a component direction. For our points projected on (0.707, 0.707): the centred point (−2, −2) becomes −2.828, (−1, −1) becomes −1.414, (0, 1) becomes 0.707, (1, 0) becomes 0.707, (2, 2) becomes 2.828. Five 2-D points summarised by five numbers.

## The algorithm with SVD

**Singular value decomposition** factors any matrix as X = U Σ Vᵀ. U and V are rotation matrices (their columns are orthonormal: length 1 and mutually perpendicular) and Σ is diagonal with non-negative **singular values**, a pure stretch. For centred X, the rows of Vᵀ are the principal component directions, and the eigenvalues of the covariance matrix are sᵢ² / (n − 1), where sᵢ are the singular values.

```
U, S, Vt = np.linalg.svd(X_centred)
W = Vt[:n_components, :]          # first rows of Vᵀ
X_reduced = X_centred @ W.T
```

NumPy returns Vᵀ (it names it V in the handbook's code, which is easy to misread). SVD never forms XᵀX, so it is more numerically stable; sklearn's `PCA` uses SVD internally.

The handbook's `myPCA` class supports both: `method='eigen'` uses the correlation matrix and `np.linalg.eig`; `method='svd'` uses `np.linalg.svd` and keeps `V[:n_components, :]`. One caveat to state in homework 5: its SVD branch does not centre X itself, so pass standardised data to it, as the homework instructs.

## Why the three versions can look mirrored

In homework 5 you plot the 2-D result of eigen-PCA, SVD-PCA and sklearn's PCA side by side. They will show the same shape, but some plots may be flipped left–right or up–down. That is not a bug: if v is an eigenvector, so is −v, and different routines pick different signs. The variances, the distances between points and the clusters are identical. Write that in your conclusion.

## Using sklearn

```
from sklearn.decomposition import PCA
pca = PCA(n_components=2)
X2 = pca.fit_transform(X_scaled)      # fit learns components, transform projects
pca.components_                       # shape (2, f): the directions
pca.explained_variance_ratio_         # e.g. [0.730, 0.229] on iris
PCA(n_components=0.95)                # keep enough components for 95% variance
```

As with every transformer, fit PCA on the training set and only `transform` the test set.

## What PCA cannot do

- The new features are mixtures of the old ones, so they are harder to interpret ("PC1 = 0.52·sepal length − 0.27·sepal width + …").
- It only finds linear structure. Data on a curved surface needs other methods (kernel PCA, t-SNE, UMAP).
- High variance is not the same as useful for prediction. A direction with little variance can still separate the classes. PCA never looks at y.

## Common mistakes

> **Skipping standardisation.** The largest-unit column takes over PC1.

> **Calling `np.cov(X)` on an (n, f) table.** You get an n × n matrix. Use `np.cov(X.T)`.

> **Reading eigenvector columns as rows.** `np.linalg.eig` returns eigenvectors as **columns** (`vecs[:, i]`); `np.linalg.svd` returns them as **rows** of Vᵀ.

## Summary

PCA rotates the data onto perpendicular directions of decreasing variance and keeps the top few. Standardise, compute the covariance matrix C = XᵀX/(n − 1), take its eigenvectors (directions) and eigenvalues (variances), sort, and project X onto the top k. Explained variance ratio = λₖ/Σλ. SVD gives the same components more stably (rows of Vᵀ). Signs of components are arbitrary, so plots may be mirrored.

--- practice
@predict
The covariance matrix of two standardised features is [[1, 0.8], [0.8, 1]]. What share of the variance does the first principal component explain? (Eigenvalues of [[a, b], [b, a]] are a + b and a − b.)
```python
a, b = 1, 0.8
print((a + b) / ((a + b) + (a - b)))
```
= 0.9
! Eigenvalues 1.8 and 0.2 sum to 2 (the number of standardised features), so PC1 explains 1.8 / 2 = 0.9.

@choice
Why must you standardise features before PCA?
- PCA only works on integers
* Otherwise columns with large units dominate the variance and therefore the components
- To make the covariance matrix diagonal
- To remove the need for eigenvectors
! PCA maximises variance, and variance depends on units. Standardising gives every feature the same starting weight.

@run
Write `project(X, v)` that centres X (subtract each column mean) and returns the dot product of every centred row with direction v, rounded to 3. Then `explained(eigs)` that returns each eigenvalue's share of the total, rounded to 3, sorted from largest to smallest.
```starter
def project(X, v):
    pass

def explained(eigs):
    pass
```
```test
X = [[1, 2], [2, 3], [3, 5], [4, 4], [5, 6]]
r = 2 ** -0.5
print(project(X, [r, r]))
print(explained([0.25, 4.75]))
print(explained([0.5, 2.92, 0.15, 0.02]))
```
= [-2.828, -1.414, 0.707, 0.707, 2.828]
= [0.95, 0.05]
= [0.813, 0.139, 0.042, 0.006]
```solution
def project(X, v):
    means = [sum(c) / len(c) for c in zip(*X)]
    return [round(sum((x - m) * w for x, m, w in zip(row, means, v)), 3) for row in X]

def explained(eigs):
    total = sum(eigs)
    return [round(e / total, 3) for e in sorted(eigs, reverse=True)]
```
! These are the lesson's five points projected on PC1. The third test mimics a dataset where the first component dominates.

@choice
You plot sklearn's 2-D PCA and the handbook's eigen-PCA of the same standardised iris data. One plot is a mirror image of the other. Why?
- One of them has a bug
- They used different numbers of components
* Eigenvectors are only defined up to sign: v and −v are both valid, so axes can flip
- sklearn does not centre the data
! Flipping an axis changes no distances or variances; the clusters are the same.

@predict
Data X has shape (150, 4). What is the shape of the covariance matrix computed as XᵀX/(n − 1)? Type it as `(a, b)`.
```python
print((4, 4))
```
= (4, 4)
! Xᵀ is (4, 150) and X is (150, 4), so the product is (4, 4): one row and column per feature.

@local
Run this and paste the output (iris, standardised, sklearn PCA). It is the number homework 5 asks you to report.
```
from sklearn.datasets import load_iris
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
X, y = load_iris(return_X_y=True)
Xs = StandardScaler().fit_transform(X)
print(PCA().fit(Xs).explained_variance_ratio_.round(4))
print(PCA(n_components=0.95).fit(Xs).n_components_)
```
min: 2
= 0.7296
= 0.2285
! Two components explain about 96% of iris's variance, so `n_components=0.95` keeps 2.

@write
From memory, list the four steps of PCA with eigenvectors and say what an eigenvalue tells you about its component.
min: 60
```solution
1. Standardise each feature to mean 0 and standard deviation 1 so units do not decide the result. 2. Compute the covariance matrix C = XᵀX/(n − 1), f × f, which holds the variance of each feature on the diagonal and the covariances off it. 3. Compute the eigenvectors and eigenvalues of C and sort them by eigenvalue, largest first; the eigenvectors are the principal component directions, perpendicular to each other. 4. Keep the top k eigenvectors as the columns of W and project: X_reduced = X·W. An eigenvalue is the variance of the data along its component, so its share of the sum of eigenvalues is the explained variance ratio.
```
! Check that you included the sorting step and the projection.

--- recall
Q: What are the four steps of eigen-based PCA?
A: Standardise; covariance matrix; eigenvectors/eigenvalues sorted by eigenvalue; project onto the top k eigenvectors.
Q: What is the explained variance ratio of component k?
A: λₖ / Σλ, its eigenvalue over the sum of all eigenvalues.
Q: Where are the principal directions in `np.linalg.eig` output versus `np.linalg.svd` output?
A: eig: columns of the eigenvector matrix; svd: rows of Vᵀ.
Q: About how much variance do the first two components keep on standardised iris?
A: About 96% (0.730 + 0.229).
