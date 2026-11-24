=== formulas | math | 2 | From formula to code: the five homework formulas | d-sigmoid-bce
@@ About 30 min reading · Homework Book chapter 2 · Homework 2
## Why this matters

Homework 2 gives you five formulas and asks for five NumPy functions. Each one returns later as a working part of a model: the normal density inside Gaussian naive Bayes and GMMs, the sigmoid inside logistic regression, the weight update inside its training loop, MSE as the regression cost, binary cross-entropy as the classification cost. The real skill being tested is reading mathematical notation without guessing. This lesson walks through each formula symbol by symbol, translates it, and checks it on numbers you can verify. The inputs and outputs here are the same ones the homework task asks you to paste.

## A reading method for any formula

1. **List every symbol** and say what it is: a scalar, a vector, a matrix, an index, a constant.
2. **Find the index.** A subscript like i or j says "this is one element"; a Σ over i says "loop over i and add".
3. **Find the shape of the output.** One number? One per sample? One per weight?
4. **Translate from the inside out**, replacing each loop over an index with a vectorised array operation.
5. **Test on a tiny input you can compute by hand.**

## Formula 1: the normal (Gaussian) density

$$
N(x; μ, σ) = 1 / (σ √(2π)) · e^( −½ ((x − μ) / σ)² )
$$

Symbols: **x** is the value we evaluate at; **μ** (mu) is the mean; **σ** (sigma) is the standard deviation; **π** ≈ 3.14159; **e** ≈ 2.71828, and e^(…) is `np.exp(...)`.

Read the exponent from the inside: (x − μ) / σ is the **z-score**, how many standard deviations x sits from the mean. Square it, halve it, negate it: the further x is from μ, the more negative the exponent and the smaller the result. The factor in front makes the total area under the curve equal 1, which is what makes it a probability *density*.

```
def normal(x, mu, sigma):
    return 1 / (sigma * np.sqrt(2 * np.pi)) * np.exp(-0.5 * ((x - mu) / sigma) ** 2)
```

Checks: `normal(0, 0, 1)` = 1/√(2π) ≈ **0.3989**, the peak of the standard bell curve. `normal(1, 0, 1)` ≈ 0.2420. Because every operation is a ufunc, `normal(np.array([0, 1]), 0, 1)` returns both at once.

The Homework Book describes this as the probability of getting a value. Be precise: for continuous variables the density is not a probability (it can even exceed 1 when σ is small; `normal(0, 0, 0.1)` ≈ 3.99). Probabilities are areas under the curve. Naive Bayes compares densities between classes, which is fine because the same x is used for every class.

## Formula 2: the sigmoid

$$
S(x) = 1 / (1 + e^(−x))
$$

It maps any real number to the interval (0, 1): S(0) = 0.5, large positive x gives values near 1, large negative x near 0. That is why Sigmoid the organisation is named after it and why logistic regression uses it to turn a linear score into a probability.

```
def sigmoid(x):
    return 1 / (1 + np.exp(-x))
```

Checks: `sigmoid(0)` = 0.5, `sigmoid(1)` ≈ **0.7311**, `sigmoid(-2)` ≈ 0.1192. Notice the symmetry S(−x) = 1 − S(x): 0.1192 = 1 − 0.8808.

A numerical note: for very negative x such as −1000, `np.exp(1000)` overflows to infinity and NumPy warns, though the result 1/(1 + inf) = 0 is still right. scikit-learn uses a stable version (`scipy.special.expit`); you do not need one for the homework.

## Formula 3: the logistic regression weight update

$$
w_j = w_j − α · (1/n) · Σᵢ (ŷᵢ − yᵢ) · x_ij
$$

Symbols: **w** is the weight vector and **w_j** its j-th weight; **α** (alpha) is the learning rate, a small positive number; **n** is the number of rows; **yᵢ** the true label of row i; **ŷᵢ** (y-hat) the model's predicted probability for row i; **x_ij** the value in row i, column j of the matrix X. The "=" here means assignment: compute the right side with the old weights, then store it.

Shapes: X is (n, d), y and ŷ are (n,), w is (d,). For each weight j, the sum runs over all rows i. The term (ŷᵢ − yᵢ) is row i's error; multiplied by x_ij it says how much feature j contributed to that error.

Loop version, close to the notation:

```
def update(w, X, y, y_hat, alpha=0.0005):
    n, d = X.shape
    new_w = w.copy()
    for j in range(d):
        grad_j = 0
        for i in range(n):
            grad_j += (y_hat[i] - y[i]) * X[i, j]
        new_w[j] = w[j] - alpha * grad_j / n
    return new_w
```

Vectorised version: the inner sum over i for every j at once is exactly Xᵀ times the error vector, because entry j of Xᵀe is Σᵢ x_ij eᵢ.

```
def update(w, X, y, y_hat, alpha=0.0005):
    return w - alpha * X.T @ (y_hat - y) / len(y)
```

Worked check with w = [0.5, −0.25], X = [[1, 2], [3, 4]], y = [1, 0], ŷ = [0.8, 0.3], α = 0.1. Errors ŷ − y = [−0.2, 0.3]. For j = 0: (−0.2)(1) + (0.3)(3) = 0.7, divided by n = 2 gives 0.35, times α gives 0.035, so w₀ = 0.5 − 0.035 = **0.465**. For j = 1: (−0.2)(2) + (0.3)(4) = 0.8, /2 = 0.4, ×0.1 = 0.04, so w₁ = −0.25 − 0.04 = **−0.29**.

The Homework Book says the function should "iterate through rows of X and y". Both versions above compute the same full-batch update; the vectorised one is what the handbook's `LogisticRegression.fit` does (`np.dot(X.T, (pred - y)) / y.size`).

## Formula 4: mean squared error

$$
MSE = (1/n) · Σᵢ (yᵢ − ŷᵢ)²
$$

```
def mse(y, y_hat):
    return np.mean((y - y_hat) ** 2)
```

Check: y = [1, 2, 3], ŷ = [1, 2, 5]. Errors 0, 0, −2; squares 0, 0, 4; mean 4/3 ≈ **1.3333**.

The Homework Book asks why not use the absolute value. The answer comes from gradient descent (next week): the square is smooth everywhere, so its derivative 2(ŷ − y) exists and shrinks as the error shrinks, giving gradient descent gentle steps near the minimum. The absolute value has a sharp corner at zero error and a derivative that is always ±1, which makes plain gradient descent bounce. Squaring also punishes big errors more than small ones; the price is sensitivity to outliers, which is why MAE also exists as a metric.

## Formula 5: binary cross-entropy (log loss)

$$
Loss = −(1/n) · Σᵢ [ yᵢ · log(ŷᵢ) + (1 − yᵢ) · log(1 − ŷᵢ) ]
$$

Here **log** is the natural logarithm, `np.log`. yᵢ is 0 or 1 and ŷᵢ is a probability strictly between 0 and 1.

The trick the Homework Book points out: because yᵢ is 0 or 1, one of the two terms always vanishes. If yᵢ = 1, the second term is multiplied by 0 and the loss for that row is −log(ŷᵢ). If yᵢ = 0, it is −log(1 − ŷᵢ). Since log of a number below 1 is negative, the leading minus makes the loss positive. A confident correct prediction (ŷ = 0.99 for y = 1) costs −log(0.99) ≈ 0.01; a confident wrong one (ŷ = 0.01 for y = 1) costs −log(0.01) ≈ 4.6. Log loss punishes confident mistakes very hard.

```
def bce(y, y_hat):
    return -np.mean(y * np.log(y_hat) + (1 - y) * np.log(1 - y_hat))
```

Check: y = [1, 0, 1], ŷ = [0.9, 0.2, 0.7]. Row losses: −log(0.9) ≈ 0.1054, −log(0.8) ≈ 0.2231, −log(0.7) ≈ 0.3567. Mean ≈ 0.6852 / 3 ≈ **0.2284**.

If ŷ is exactly 0 or 1, log gives −∞. Libraries clip predictions to [ε, 1 − ε] with a tiny ε such as 1e-15: `y_hat = np.clip(y_hat, 1e-15, 1 - 1e-15)`.

A naming trap: the Homework Book's text swaps the roles of y and ŷ in one sentence (it calls y the predictions). In the formula itself, y is the true class and ŷ the prediction, and the log is always taken of the prediction. If you swap them, log(0) appears immediately because true labels are exactly 0 or 1.

## Common mistakes

> **`np.log` vs `np.log10`.** The formulas use the natural log. log10 gives a different (scaled) value.

> **Integer arrays in the update.** If w is an int array, `w - alpha * grad` creates floats but `w -= ...` in place fails. Start weights as floats: `np.zeros(d)`.

> **Forgetting the 1/n or the minus sign in BCE.** Without the minus, the loss is negative and gradient descent would push the wrong way.

## Summary

Read every symbol, find the index and output shape, translate inside out, test on hand-sized numbers. Normal density: `1/(σ√(2π)) · exp(−½((x−μ)/σ)²)`, peak 0.3989 at the mean of a standard normal. Sigmoid: `1/(1+exp(−x))`, S(0) = 0.5. Logistic weight update: `w − α Xᵀ(ŷ − y)/n`. MSE: `mean((y − ŷ)²)`. BCE: `−mean(y log ŷ + (1 − y) log(1 − ŷ))`.

--- practice
@predict
What is S(2), the sigmoid of 2, rounded to 4 decimals?
```python
import math
print(round(1 / (1 + math.exp(-2)), 4))
```
= 0.8808
! 1 / (1 + e⁻²) = 1 / (1 + 0.1353) ≈ 0.8808. By symmetry S(−2) = 1 − 0.8808 = 0.1192.

@choice
In the weight update w_j = w_j − α (1/n) Σᵢ (ŷᵢ − yᵢ) x_ij, what is the vectorised form of the sum over i for all j at once?
- `X @ (y_hat - y)`
* `X.T @ (y_hat - y)`
- `(y_hat - y) * X`
- `np.sum(X) * np.sum(y_hat - y)`
! Entry j of Xᵀe is Σᵢ x_ij eᵢ. X has shape (n, d), so `X @ e` would need e to have d entries, not n.

@run
Implement `normal(x, mu, sigma)` and `bce(y, p)` in plain Python with `math`, for single numbers (`normal`) and lists (`bce`).
```starter
import math

def normal(x, mu, sigma):
    pass

def bce(y, p):
    pass
```
```test
print(round(normal(0, 0, 1), 4), round(normal(1, 0, 1), 4), round(normal(170, 175, 7), 4))
print(round(bce([1, 0, 1], [0.9, 0.2, 0.7]), 4))
print(round(bce([1, 1], [0.99, 0.01]), 4))
```
= 0.3989 0.242 0.0442
= 0.2284
= 2.3076
```solution
import math

def normal(x, mu, sigma):
    return 1 / (sigma * math.sqrt(2 * math.pi)) * math.exp(-0.5 * ((x - mu) / sigma) ** 2)

def bce(y, p):
    total = 0
    for yi, pi in zip(y, p):
        total += yi * math.log(pi) + (1 - yi) * math.log(1 - pi)
    return -total / len(y)
```
! The last test shows the punishment for one confident mistake: (−log 0.99 − log 0.01) / 2 ≈ (0.01 + 4.605) / 2 ≈ 2.31.

@predict
Using the homework inputs w = [0.5, −0.25], X = [[1, 2], [3, 4]], y = [1, 0], ŷ = [0.8, 0.3], α = 0.1, what is the new w? Type it as `[a, b]`.
```python
w = [0.5, -0.25]; X = [[1, 2], [3, 4]]; y = [1, 0]; yh = [0.8, 0.3]; a = 0.1
print([round(w[j] - a * sum((yh[i] - y[i]) * X[i][j] for i in range(2)) / 2, 4) for j in range(2)])
```
= [0.465, -0.29]
! Errors are [−0.2, 0.3]. Gradient for w₀: (−0.2·1 + 0.3·3)/2 = 0.35; for w₁: (−0.2·2 + 0.3·4)/2 = 0.4. Subtract α times each: 0.5 − 0.035 and −0.25 − 0.04.

@choice
A model predicts ŷ = 0.01 for a sample whose true label is 1. Roughly what does binary cross-entropy charge for this one sample?
- 0.01
- 0.99
* About 4.6
- Infinity
! −log(0.01) ≈ 4.605. Log loss grows without bound as a confident prediction becomes more wrong, which is why it trains good probability estimates.

@choice
Why does MSE square the errors rather than take their absolute value, according to the gradient descent argument?
- Squares are always smaller
* The square is smooth with a derivative that shrinks near zero error, so gradient steps get gentler near the minimum
- Absolute values cannot be computed in NumPy
- Squaring removes outliers
! |e| has a corner at 0 and a slope that is always ±1, so plain gradient descent keeps taking full-size steps and bounces around the minimum.

@write
Without looking, write the binary cross-entropy formula, explain what each symbol is, and explain why one of the two terms always disappears for each sample.
min: 50
```solution
Loss = −(1/n) Σᵢ [ yᵢ log(ŷᵢ) + (1 − yᵢ) log(1 − ŷᵢ) ]. n is the number of samples, yᵢ is the true label of sample i (0 or 1), ŷᵢ is the predicted probability that sample i is class 1, and log is the natural logarithm. Because yᵢ is either 0 or 1, if yᵢ = 1 the factor (1 − yᵢ) is 0 and only −log(ŷᵢ) remains; if yᵢ = 0 the first term is multiplied by 0 and only −log(1 − ŷᵢ) remains. The leading minus makes the loss positive because the logs of probabilities are negative.
```
! Check you used ŷ inside the logs and y outside them.

--- recall
Q: What is the vectorised logistic regression weight update?
A: w = w − α · Xᵀ(ŷ − y) / n
Q: What is the value of the standard normal density at x = 0?
A: 1/√(2π) ≈ 0.3989
Q: Write the sigmoid and its value at 0 and at 1.
A: S(x) = 1/(1 + e^(−x)); S(0) = 0.5, S(1) ≈ 0.7311.
Q: Why clip predictions before computing log loss?
A: log(0) is −∞; clipping to [ε, 1 − ε] keeps the loss finite.
