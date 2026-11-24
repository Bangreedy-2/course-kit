=== linreg | sup | 3 | Linear regression: the model and its cost | d-predict-lin
@@ About 30 min reading · Handbook chapter 5.1 · Homework 3
## Why this matters

Linear regression is the first model the handbook builds, and almost everything later reuses its recipe: **a model** (a formula with weights), **a cost function** (a number that says how wrong the weights are), and **an optimiser** (a way to change the weights to lower the cost). Logistic regression, SVMs and neural networks all follow it. Homework 3 asks you to train scikit-learn's `LinearRegression` and the handbook's from-scratch version and compare them. This lesson covers the model and the cost; the next one covers gradient descent, the optimiser.

## Vocabulary

- **Target** (dependent variable, label, y): the column you want to predict, such as a house price.
- **Features** (independent variables, inputs, X): the other columns used to predict it, such as area, number of rooms, distance to the centre.
- **Sample** (row, observation): one house.
- **Regression** means the target is a continuous number. **Classification** (week 4) means it is a category.

## The model

With one feature, the model is a straight line:

$$
ŷ = w·x + b
$$

**ŷ** (y-hat) is the prediction, **w** the slope (how much ŷ changes per unit of x), **b** the intercept (ŷ when x = 0). With d features it is a weighted sum:

$$
ŷ = w₁x₁ + w₂x₂ + … + w_d·x_d + b
$$

Geometrically, with two features this is a plane in 3-D; with more it is a "hyperplane" we cannot picture, but the maths is identical. Training means choosing the weights. Once trained, each weight has a meaning: with all other features held fixed, increasing x₁ by one unit changes the prediction by w₁. That is why linear models are easy to interpret (week 10 uses exactly this).

"Linear" refers to the weights, not the features: ŷ = w₁x + w₂x² + b is still linear regression, because the prediction is a weighted sum. You can add squared or log-transformed columns and still use the same model.

## The handbook's three-point example

Fit a line through (1, 1), (2, 2), (3, 2). If a line y = ax + b passed through all three:

$$
1a + b = 1
2a + b = 2
3a + b = 2
$$

In matrix form, with A holding the x values and a column of ones:

$$
| 1 1 |   | a |   | 1 |
| 2 1 | · | b | = | 2 |
| 3 1 |           | 2 |
$$

Three equations, two unknowns, and no solution: the points are not on one line (from x = 1 to 2 the y rises by 1, from 2 to 3 it does not rise). Real data is always like this because of **noise**. So instead of solving Ax = y exactly, we look for the weights whose predictions p = Ax̂ are *as close as possible* to y. "As close as possible" needs a definition, and that definition is the cost function.

## The cost function

The handbook's cost is the sum of squared errors:

$$
f(w) = (Xw − y)ᵀ(Xw − y) = Σᵢ (ŷᵢ − yᵢ)²
$$

Read the left form with shapes: Xw is (n, 1), the predictions; Xw − y is the vector of errors (also called **residuals**); a vector transposed times itself, eᵀe, is the dot product of e with itself, which is the sum of its squared entries. So both forms say the same thing: square every error and add them up.

Dividing by n gives the **mean squared error**, the same minimiser with a nicer scale. Squaring does three things: makes every error positive so they cannot cancel, punishes large errors much more than small ones (an error of 10 costs 100, an error of 1 costs 1), and gives a smooth bowl-shaped function with a single lowest point, which is what makes gradient descent work.

Try it on the three points. Candidate line ŷ = 0.5x + 0.5 predicts 1, 1.5, 2: errors 0, −0.5, 0; cost 0.25. Candidate ŷ = 0.5x + 2/3 predicts 1.1667, 1.6667, 2.1667: errors 0.1667, −0.3333, 0.1667; cost 0.0278 + 0.1111 + 0.0278 = 0.1667. The second line is better, and it is in fact the best possible one, the **least-squares** line.

## The closed-form solution

For linear regression the minimum can be written down directly. For one feature:

$$
w = cov(x, y) / var(x)        b = ȳ − w·x̄
$$

For the three points: x̄ = 2, ȳ = 5/3. Σ(x − x̄)(y − ȳ) = (−1)(−2/3) + 0 + (1)(1/3) = 1; Σ(x − x̄)² = 2; so w = 1/2 = 0.5 and b = 5/3 − 0.5·2 = 2/3. That matches the best line above.

In general (many features, the ones column inside X) the solution is the **normal equation**:

$$
w = (XᵀX)⁻¹ Xᵀ y
$$

scikit-learn's `LinearRegression` solves this least-squares problem directly with a numerically stable method. Why then does the handbook use gradient descent? Because inverting XᵀX costs roughly d³ operations and becomes slow or unstable with many features, because gradient descent works for models that have *no* closed form (logistic regression, neural networks), and because learning it on the simplest model makes it easy to understand. Expect sklearn's result and a well-tuned gradient descent to agree to a few decimals; if they don't, the gradient descent has not converged (see next lesson).

## Using scikit-learn

The handbook's sklearn example, with a random seed added so you get the same numbers:

```
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression

np.random.seed(0)
X = np.linspace(0, 100, 100).reshape(100, 1)   # 100 x values, as a column
e = np.random.uniform(-5, 5, (100, 1))         # noise between −5 and 5
y = 3 * X + e                                  # true slope 3, true intercept 0

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)
lr = LinearRegression()
lr.fit(X_train, y_train)
print(lr.coef_, lr.intercept_)     # about [[2.965]] and [1.43]
print(lr.score(X_test, y_test))    # R² ≈ 0.999
```

- `reshape(100, 1)`: sklearn requires X to be 2-D even with one feature.
- `fit` learns the weights; afterwards `coef_` holds w (one per feature) and `intercept_` holds b. The trailing underscores mean "learned during fit".
- The learned slope 2.965 is close to the true 3 but not equal, because of the noise. With more data it would get closer.
- `score` returns R² on the data you give it; the evaluation lesson this week explains it.

## Assumptions worth knowing

Linear regression works best when the relationship really is roughly linear, the errors have no pattern (plot residuals against predictions: a curve or a funnel shape signals trouble), and features are not near-duplicates of each other. Strongly correlated features (**multicollinearity**) do not hurt predictions much but make individual weights unstable and hard to interpret; you saw the extreme case, a singular XᵀX, in the linear algebra lesson. This is one reason homework 3 builds a second feature set from columns with moderate correlation to the target.

## Common mistakes

> **Passing a 1-D X to sklearn.** `fit(x, y)` with x of shape (n,) raises "Expected 2D array". Use `x.reshape(-1, 1)` or `df[['area']]` (double brackets keep a DataFrame).

> **Forgetting the intercept in a from-scratch model.** Without the ones column the line is forced through the origin.

> **Reading weights of unscaled features as importance.** A weight of 0.001 on "area in m²" and 50 on "number of rooms" does not mean rooms matter more; the units differ. Compare weights only after standardising the features.

## Summary

Linear regression predicts ŷ = Xw, a weighted sum of features plus an intercept (handled by a column of ones). Real data has no exact solution, so we minimise the sum of squared errors f(w) = (Xw − y)ᵀ(Xw − y). For one feature the best slope is cov(x, y)/var(x); in general w = (XᵀX)⁻¹Xᵀy. sklearn's `LinearRegression` gives `coef_` and `intercept_`; gradient descent (next lesson) reaches the same answer iteratively.

--- practice
@predict
For the line ŷ = 0.5x + 0.5 and the points (1, 1), (2, 2), (3, 2), what is the sum of squared errors?
```python
xs = [1, 2, 3]; ys = [1, 2, 2]
print(sum((0.5 * x + 0.5 - y) ** 2 for x, y in zip(xs, ys)))
```
= 0.25
! Predictions are 1, 1.5, 2. Errors 0, −0.5, 0. Only the middle one counts: 0.25.

@run
Write `fit_line(xs, ys)` that returns the least-squares slope and intercept for one feature using w = Σ(x − x̄)(y − ȳ) / Σ(x − x̄)² and b = ȳ − w·x̄. Return both rounded to 4 decimals.
```starter
def fit_line(xs, ys):
    pass
```
```test
print(fit_line([1, 2, 3], [1, 2, 2]))
print(fit_line([0, 1, 2, 3], [1, 3, 5, 7]))
print(fit_line([1, 2, 3, 4, 5], [2.1, 3.9, 6.2, 7.8, 10.1]))
```
= (0.5, 0.6667)
= (2.0, 1.0)
= (1.99, 0.05)
```solution
def fit_line(xs, ys):
    n = len(xs)
    mx = sum(xs) / n
    my = sum(ys) / n
    sxy = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
    sxx = sum((x - mx) ** 2 for x in xs)
    w = sxy / sxx
    b = my - w * mx
    return round(w, 4), round(b, 4)
```
! The second test lies exactly on y = 2x + 1, so the fit is exact. The third is noisy data around y = 2x, and the estimate (1.99, 0.05) is close but not exact.

@choice
In f(w) = (Xw − y)ᵀ(Xw − y), what is (Xw − y)?
- The weights
* The vector of residuals (prediction minus truth), one per sample
- The gradient
- The covariance matrix
! Xw is the predictions; subtracting y leaves one error per row. eᵀe then sums the squared errors.

@choice
A house-price model has a weight of 0.002 for `area_m2` and 15 for `rooms`. Which conclusion is justified?
- Rooms are 7,500 times more important than area
- Area does not matter
* Nothing about importance until the features are on the same scale; the weights depend on the units
- The model is wrong
! Area is in hundreds of m², rooms in single digits. Standardise features first, or use the methods in week 10, before comparing importance.

@local
Run the handbook's sklearn example with the seed fixed, exactly as in the lesson, and paste the three printed lines (the coefficient, the intercept and the score).
```
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
np.random.seed(0)
X = np.linspace(0, 100, 100).reshape(100, 1)
e = np.random.uniform(-5, 5, (100, 1))
y = 3 * X + e
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)
lr = LinearRegression().fit(X_train, y_train)
print(round(lr.coef_[0][0], 3))
print(round(lr.intercept_[0], 3))
print(round(lr.score(X_test, y_test), 4))
```
min: 3
= 2.965
= 1.43
= 0.999
! The slope is close to the true value 3 and the intercept close to 0, but not equal because of the noise. R² close to 1 means the line explains almost all of the variation in the test set.

@predict
For one feature, what slope does least squares give for x = [1, 2, 3] and y = [1, 2, 2]? Type the number.
```python
print(1 / 2)
```
= 0.5
! Σ(x − x̄)(y − ȳ) = 1 and Σ(x − x̄)² = 2, so w = 0.5.

@write
From memory, describe the three ingredients of the handbook's model recipe (model, cost, optimiser) for linear regression, and explain why the system Ax = y usually has no exact solution.
min: 60
```solution
The model is a weighted sum of the features plus an intercept, ŷ = Xw, with a column of ones in X so one weight acts as the intercept. The cost is the sum (or mean) of squared errors f(w) = (Xw − y)ᵀ(Xw − y), which measures how far predictions are from the true targets. The optimiser changes w to make the cost small: gradient descent repeatedly steps against the gradient 2Xᵀ(Xw − y), or the normal equation solves for the minimum directly. Ax = y has more equations (samples) than unknowns (weights) and the data contains noise, so no single line or plane passes through every point; we look for the weights that come closest in the squared-error sense.
```
! Check that you named noise and "more equations than unknowns" for the second part.

--- recall
Q: Write the handbook's cost function for linear regression in matrix form.
A: f(w) = (Xw − y)ᵀ(Xw − y), the sum of squared residuals.
Q: For one feature, what are the least-squares slope and intercept?
A: w = cov(x, y)/var(x) = Σ(x − x̄)(y − ȳ)/Σ(x − x̄)²; b = ȳ − w·x̄.
Q: Write the normal equation.
A: w = (XᵀX)⁻¹ Xᵀ y
Q: After `LinearRegression().fit(X, y)`, where are the learned weights and intercept?
A: `coef_` and `intercept_`.
