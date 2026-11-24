=== svm | sup | 7 | Support vector machines: margins, hinge loss and kernels | d-hinge
@@ About 30 min reading · Handbook chapter 10
## Why this matters

Logistic regression draws *a* line between classes; a support vector machine draws the line that stays as far as possible from both classes. That idea, the widest street, gives a model that is decided only by the hardest points, works well with many features and, through kernels, learns curved boundaries without you building curved features. The handbook derives the SVM with Lagrange multipliers and implements it from scratch; this lesson walks through the same ideas with a small example you can check by hand, then the sklearn tools you will actually use.

## Hyperplanes and the sign rule

With labels written as y = −1 or +1 (not 0/1), a linear classifier computes

$$
f(x) = w · x + b
$$

and predicts +1 if f(x) ≥ 0, else −1. Here w is the **weight vector** (one weight per feature), b the **bias**, and w · x the dot product w₁x₁ + … + w_d x_d. The points where f(x) = 0 form the **decision boundary**, a **hyperplane**: a line in 2-D, a plane in 3-D, and in general a flat surface with one dimension fewer than the feature space. w is perpendicular to it.

## The margin

Many hyperplanes may separate the training data. The SVM asks for two parallel "gutters":

$$
H₁: w · x + b = +1        H₂: w · x + b = −1
$$

with every positive point on or beyond H₁ and every negative point on or beyond H₂. Multiplying by yᵢ turns both requirements into one:

$$
y_i (w · x_i + b) ≥ 1  for every training point i
$$

The distance between H₁ and H₂ (the width of the street, the **margin**) works out to 2/‖w‖, where ‖w‖ = √(w₁² + … + w_d²) is the length of w. Maximising 2/‖w‖ is the same as minimising ‖w‖, and for convenience the SVM minimises ½‖w‖². That is the **hard-margin SVM**: minimise ½‖w‖² subject to the constraints above.

The points that lie exactly on the gutters, yᵢ(w · xᵢ + b) = 1, are the **support vectors**. They alone fix the boundary: move any other point (without crossing a gutter) and the solution does not change.

### Worked example

Negatives at (1, 1), (2, 1), (1, 2); positives at (4, 4), (5, 4), (4, 5). By symmetry the best w points along the diagonal, w = (a, a). The nearest negatives, (2, 1) and (1, 2), give 3a + b = −1 on H₂; the nearest positive, (4, 4), gives 8a + b = +1 on H₁. Subtracting: 5a = 2, so a = 0.4 and b = −2.2.

- Boundary: 0.4x₁ + 0.4x₂ − 2.2 = 0, that is x₁ + x₂ = 5.5.
- Check (1, 1): 0.8 − 2.2 = −1.4 ≤ −1, safely beyond the gutter.
- Margin: 2/‖w‖ = 2/(0.4·√2) ≈ 3.536.
- Support vectors: (2, 1), (1, 2) and (4, 4).

`SVC(kernel="linear", C=1e6)` (a huge C approximates a hard margin) returns coef_ ≈ [0.400, 0.400], intercept_ ≈ −2.200 and exactly those three support vectors.

## Soft margin, hinge loss and C

Real data is rarely perfectly separable, and one outlier can force a terrible narrow street. The **soft-margin SVM** lets points violate the margin at a price. The violation of point i is measured by the **hinge loss**:

$$
hinge_i = max(0, 1 − y_i (w · x_i + b))
$$

It is 0 for a point safely beyond its gutter, grows linearly as the point moves into the street, and exceeds 1 once the point is on the wrong side of the boundary. The SVM objective becomes:

$$
minimise  ½‖w‖² + C · Σ_i max(0, 1 − y_i (w · x_i + b))
$$

**C** sets the trade-off. Large C: violations are expensive, so the street narrows to classify training points correctly (low bias, high variance). Small C: a wide street that tolerates mistakes (more regularisation). C plays the role of 1/λ in regularised regression.

On the breast cancer data (scaled, RBF kernel, the same split as earlier lessons):

| C | train accuracy | test accuracy | support vectors |
|---|---|---|---|
| 0.01 | 0.627 | 0.629 | 320 |
| 0.1 | 0.962 | 0.937 | 191 |
| 1 | 0.979 | 0.979 | 96 |
| 10 | 0.993 | 0.979 | 78 |
| 100 | 1.000 | 0.944 | 67 |

Small C underfits (C = 0.01 is no better than always predicting the majority class) and keeps many support vectors, because a wide street contains many points; large C overfits.

### Training by gradient steps

The objective can be minimised by (sub)gradient descent, which is what the handbook's `SVM` class and your drill `d-hinge` do. For each sample: if it is beyond its gutter, only the ½‖w‖² term pulls (w shrinks a little); otherwise the hinge term adds −yᵢxᵢ to the gradient, pushing w toward classifying it correctly. Your drill writes the score as w · x − b, so its bias update has the opposite sign; same model, different bookkeeping.

## The dual view and the kernel trick

The handbook solves the hard-margin problem with **Lagrange multipliers**: one multiplier αᵢ ≥ 0 per constraint. Setting the derivatives to zero gives:

$$
w = Σ_i α_i y_i x_i        Σ_i α_i y_i = 0
$$

αᵢ is non-zero only for support vectors, so w is a weighted sum of support vectors and a new point u is classified by the sign of Σ αᵢ yᵢ (xᵢ · u) + b. The data appears only through **dot products** xᵢ · u.

That is the opening for the **kernel trick**: replace xᵢ · u with a kernel function K(xᵢ, u) that equals a dot product in some richer feature space, without ever computing that space. The common kernels in sklearn:

- `linear`: K = x · u.
- `poly`: K = (γ x · u + r)^degree, curved boundaries of a fixed degree.
- `rbf` (the default): K = exp(−γ ‖x − u‖²), a similarity that is 1 for identical points and decays with distance. Its **gamma** (γ) sets the reach: large γ means each support vector influences only its close neighbourhood (wiggly boundary, overfitting risk); small γ means smooth boundaries. The default `gamma="scale"` uses 1/(d · variance of X).
- `sigmoid`: K = tanh(γ x · u + r).

C and gamma are tuned together, usually with a grid search on a log scale (next lesson).

## Scaling is mandatory

Margins are distances, so a feature measured in thousands dominates one measured in fractions. On the unscaled breast cancer data, `SVC()` scores 0.923 on the test set; inside `make_pipeline(StandardScaler(), SVC())` it scores 0.979. Always scale for SVMs, and fit the scaler inside a pipeline so it learns from training data only.

```
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC, LinearSVC, SVR

model = make_pipeline(StandardScaler(), SVC(kernel="rbf", C=1, gamma="scale"))
model.fit(X_train, y_train)
model.score(X_test, y_test)
model[-1].n_support_          # support vectors per class
```

Other tools: `LinearSVC` (linear kernel only, much faster on large data), `SVR` (regression: fits a tube of width ε around the data and only penalises points outside it), `SVC(probability=True)` (adds probability estimates via internal cross-validation; slower, and the probabilities can disagree slightly with `predict`).

## Reading the handbook's code

The from-scratch class is worth reading, with four caveats. Its labels must be −1 and +1, but `make_blobs` returns 0 and 1; with y = 0 the hinge term vanishes for that class, which only works here because the blobs are far apart. `get_cost_grads` divides by the global `len(X)` instead of `len(self.X)`. The bias sits inside w (a column of ones), so it is regularised along with the weights, unlike the standard SVM. And "if the sign of (10) is ≥ 1" means "if f(u) ≥ 0": the sign is ±1. The chapter's conclusion that SVMs "don't generally suffer overfitting" is too strong: the C = 100 row above overfits.

Strengths and limits: effective with many features and clear margins; memory-efficient at prediction (only support vectors are stored); but kernel SVC training grows roughly between n² and n³, so it is slow beyond tens of thousands of rows.

## Common mistakes

> **Forgetting to scale.** The single most common SVM bug.

> **Using 0/1 labels in a from-scratch SVM.** The maths assumes −1/+1.

> **Tuning C alone with an RBF kernel.** C and gamma interact; search both.

## Summary

An SVM finds the hyperplane w · x + b = 0 with the widest margin 2/‖w‖, subject to yᵢ(w · xᵢ + b) ≥ 1. Support vectors are the points on the gutters; only they matter. The soft margin adds C·Σ hinge losses max(0, 1 − yᵢ f(xᵢ)); large C fits harder, small C regularises. The dual form uses only dot products, so kernels (RBF with gamma, polynomial) give nonlinear boundaries. Always scale features.

--- practice
@predict
An SVM has w = (3, 4). What is the width of its margin, 2/‖w‖? Type a decimal.
```python
import math
print(2 / math.sqrt(3 ** 2 + 4 ** 2))
```
= 0.4
! ‖w‖ = √(9 + 16) = 5, so the margin is 2/5.

@predict
With w = (0.4, 0.4) and b = −2.2, what is the hinge loss of the positive point (3, 3)? Type a decimal, rounded to 4.
```python
f = 0.4 * 3 + 0.4 * 3 - 2.2
print(round(max(0, 1 - 1 * f), 4))
```
= 0.8
! f = 0.4·3 + 0.4·3 − 2.2 = 0.2: the correct side of the boundary, but inside the street, so the loss is 1 − 0.2 = 0.8. A point inside the street pays even when it is classified correctly.

@choice
Which points determine the position of the SVM boundary?
- All training points equally
* Only the support vectors, the points on or inside the margin
- Only the points furthest from the boundary
- The class means
! Points safely beyond their gutter have αᵢ = 0 and zero hinge loss; removing them leaves the solution unchanged.

@choice
An RBF SVM scores 1.000 on training data and noticeably less on test data. Which change is most likely to help?
- Increase C
- Increase gamma
* Decrease C or gamma
- Remove feature scaling
! Large C forces training points to be classified correctly; large gamma makes each support vector's influence very local. Both raise variance.

@run
Write `hinge(w, b, X, y)` that returns the list of hinge losses max(0, 1 − yᵢ(w·xᵢ + b)) rounded to 3, and `svm_objective(w, b, X, y, C)` returning ½‖w‖² + C·Σ hinge, rounded to 3.
```starter
def hinge(w, b, X, y):
    pass

def svm_objective(w, b, X, y, C):
    pass
```
```test
X = [[1, 1], [2, 1], [1, 2], [4, 4], [5, 4], [4, 5], [3, 3]]
y = [-1, -1, -1, 1, 1, 1, 1]
print(hinge([0.4, 0.4], -2.2, X, y))
print(svm_objective([0.4, 0.4], -2.2, X, y, 1))
print(svm_objective([0.4, 0.4], -2.2, X, y, 10))
```
= [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.8]
= 0.96
= 8.16
```solution
def hinge(w, b, X, y):
    out = []
    for x, t in zip(X, y):
        f = sum(a * c for a, c in zip(w, x)) + b
        out.append(round(max(0.0, 1 - t * f), 3))
    return out

def svm_objective(w, b, X, y, C):
    reg = 0.5 * sum(a * a for a in w)
    return round(reg + C * sum(hinge(w, b, X, y)), 3)
```
! The lesson's boundary is perfect for the six original points; the added point (3, 3) sits inside the street. With C = 10 its violation dominates the objective, so a solver would move the boundary to reduce it.

@choice
Why must features be scaled before training an SVM?
- SVMs only accept values between 0 and 1
* The margin is a distance, so features with large ranges dominate it
- Scaling makes the kernel linear
- sklearn raises an error otherwise
! On breast cancer data, scaling raised the RBF SVM's test accuracy from 0.923 to 0.979.

@write
From memory, write the soft-margin SVM objective and explain what C and the RBF gamma each control.
min: 50
```solution
Minimise ½‖w‖² + C Σ max(0, 1 − yᵢ(w·xᵢ + b)). The first term maximises the margin 2/‖w‖; the second is the total hinge loss, which is zero for points beyond their gutter and grows for points inside the street or misclassified. C weighs violations against margin width: large C fits the training data tightly (risk of overfitting), small C keeps a wide margin and tolerates errors. Gamma in the RBF kernel exp(−γ‖x − u‖²) sets how far a support vector's influence reaches: large gamma gives local, wiggly boundaries, small gamma smooth ones.
```
! Check that you wrote the hinge term with yᵢ and the 1.

--- recall
Q: Write the soft-margin SVM objective.
A: ½‖w‖² + C · Σ max(0, 1 − yᵢ(w·xᵢ + b)).
Q: What is the margin width of a linear SVM?
A: 2/‖w‖.
Q: What are support vectors?
A: Training points on or inside the margin (αᵢ > 0); they alone determine the boundary.
Q: Which kernel is sklearn's default, and what does its gamma do?
A: RBF, exp(−γ‖x − u‖²); large gamma = local, complex boundary; small = smooth.
