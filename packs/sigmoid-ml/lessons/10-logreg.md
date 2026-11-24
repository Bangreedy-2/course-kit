=== logreg | sup | 4 | Logistic regression from scratch | d-logreg-step
@@ About 30 min reading · Handbook chapter 6 · Homework 4
## Why this matters

Most business questions in the homework datasets are yes/no: will this customer churn (Telco), does this patient have heart disease (Heart, Heart Failure), did this passenger survive (Titanic), is this patient diabetic (Pima). Predicting a category is **classification**, and logistic regression is the standard first model for it. It is also the bridge to everything else: it is linear regression passed through a sigmoid, trained with gradient descent on a new cost. Homework 4 has you train sklearn's version and the handbook's from-scratch class and compare their accuracies.

## From a score to a probability

Linear regression produces any real number. For a yes/no question we want a probability between 0 and 1. The handbook's tool is the **logistic function**:

$$
f(x) = L / (1 + e^(−k(x − x₀)))
$$

where L is the curve's maximum, k its steepness and x₀ its midpoint (the x where it reaches L/2). With L = 1, k = 1 and x₀ = 0 it becomes the **standard sigmoid**, σ(z) = 1/(1 + e^(−z)), which you implemented last week.

Logistic regression computes a linear score and squeezes it:

$$
z = w₁x₁ + w₂x₂ + … + w_d·x_d + b        (the linear part, sometimes called the logit)
p = σ(z)                                 (probability that the class is 1)
$$

Then a **threshold** turns the probability into a label: predict 1 if p ≥ 0.5, else 0. Since σ(0) = 0.5, the threshold 0.5 is the same as asking whether z ≥ 0. So the **decision boundary** — the set of points where the model is undecided — is the line (or plane) w·x + b = 0. Logistic regression is a **linear classifier**: it separates the classes with a straight boundary. If the classes are separated by a curve, it needs engineered features (x², products of features) or a different model.

Worked example: weights w = (2, −1), b = 0.5, sample x = (1, 3). z = 2·1 − 1·3 + 0.5 = −0.5. p = σ(−0.5) ≈ 0.3775. Below 0.5, so the prediction is class 0.

### What the weights mean

The quantity p/(1 − p) is the **odds** (p = 0.8 means odds of 4 to 1), and its logarithm, the **log-odds**, equals z. So each weight wⱼ says how much the log-odds change when xⱼ grows by one unit, holding the others fixed; e^(wⱼ) is the factor by which the odds are multiplied. A positive weight pushes toward class 1, a negative weight toward class 0. That interpretability is a big reason logistic regression is used in medicine and credit scoring.

### Choosing the threshold

0.5 is a default, not a law. The handbook's example: when screening for cancer, a missed sick patient (a false negative) is far worse than a false alarm, so you lower the threshold, say to 0.3, accepting more false positives to catch more true cases. The next lesson measures exactly this trade-off with precision and recall. In sklearn, `predict` always uses 0.5; for another threshold use `(model.predict_proba(X)[:, 1] >= 0.3).astype(int)`.

## The cost: log loss

Why not reuse squared error? The handbook's answer: squared error passed through a sigmoid gives a cost surface with several dips (it is not **convex**), so gradient descent can get stuck in a local minimum. Instead we use **log loss**, the binary cross-entropy from homework 2. Per sample:

$$
cost = −log(p)        if y = 1
cost = −log(1 − p)    if y = 0
$$

combined into one line, and averaged over the m samples:

$$
J(w) = −(1/m) · Σᵢ [ yᵢ·log(pᵢ) + (1 − yᵢ)·log(1 − pᵢ) ]
$$

In the worked example (p = 0.3775), if the true label is 1 the cost is −log(0.3775) ≈ 0.974; if it is 0 the cost is −log(0.6225) ≈ 0.474. Confident correct predictions cost almost nothing and confident wrong ones cost a lot. Log loss is convex in w, so gradient descent reliably finds the minimum.

## The gradient

Remarkably, the gradient of log loss through a sigmoid has the same shape as linear regression's:

$$
∇J = (1/m) · Xᵀ(p − y)
$$

The only difference is that p is σ(Xw) instead of Xw. (The sigmoid's derivative σ(z)(1 − σ(z)) cancels neatly against the derivative of the log.) So the update you implemented in homework 2 is exactly one training step:

$$
w ← w − α · (1/m) · Xᵀ(p − y)
$$

One step by hand: X = [[1], [2], [3], [4]], y = [0, 0, 1, 1], with a ones column added and w = (0, 0). All scores are 0, so every p = 0.5. Errors p − y: 0.5, 0.5, −0.5, −0.5. Gradient for the feature weight: (0.5·1 + 0.5·2 − 0.5·3 − 0.5·4)/4 = −2/4 = −0.5. For the intercept: (0.5 + 0.5 − 0.5 − 0.5)/4 = 0. With α = 0.1: w becomes (0.05, 0). The feature weight turned positive, because larger x goes with class 1.

## The handbook's class, line by line

```
class LogisticRegression:
    def __init__(self, learning_rate=0.05, max_iter=100000):
        self.__learning_rate = learning_rate
        self.__max_iter = max_iter

    def sigmoid(self, y):
        return 1 / (1 + np.exp(-y))

    def fit(self, X, y):
        self.coef_ = np.zeros(len(X[0]) + 1)               # 1
        X = np.hstack((X, np.ones((len(X), 1))))            # 2
        for i in range(self.__max_iter):
            pred = self.sigmoid(np.dot(X, self.coef_))      # 3
            gradient = np.dot(X.T, (pred - y)) / y.size     # 4
            self.coef_ -= gradient * self.__learning_rate   # 5
        return self

    def predict_proba(self, X):
        X = np.hstack((X, np.ones((len(X), 1))))
        prob = self.sigmoid(np.dot(X, self.coef_))
        return np.hstack(((1 - prob).reshape(-1, 1), prob.reshape(-1, 1)))   # 6

    def predict(self, X):
        X = np.hstack((X, np.ones((len(X), 1))))
        return (self.sigmoid(np.dot(X, self.coef_)) > 0.5) * 1              # 7
```

1. One weight per feature plus one for the intercept, all starting at 0. (Starting at zero is fine here because the cost is convex.)
2. Add the ones column on the right; the last weight is the intercept.
3. Probabilities for every row at once: shape (m,).
4. The averaged gradient Xᵀ(p − y)/m. `y.size` is m. Note that y must be a 1-D array here, shape (m,), unlike the linear regression class.
5. Full-batch update.
6. Returns two columns, P(class 0) and P(class 1), matching sklearn's `predict_proba` format. That is why you take column `[:, 1]` for the positive class.
7. `(p > 0.5)` is a boolean array; `* 1` turns True/False into 1/0.

The default 100,000 iterations of full-batch updates is slow on big data but simple; with standardised features far fewer are usually needed. As in week 3, scale your features (fit the scaler on the training set) or this class converges very slowly.

## scikit-learn

```
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
clf = LogisticRegression(max_iter=1000)
clf.fit(X_train, y_train)
y_pred = clf.predict(X_test)
print(accuracy_score(y_test, y_pred))
print(clf.coef_, clf.intercept_)
```

Two differences from the handbook's version matter when you compare them in homework 4:

- **Regularisation.** sklearn adds an L2 penalty by default (`C=1.0`; smaller C means a stronger penalty that shrinks weights). The from-scratch class has none. Their weights will differ, especially on small datasets; accuracies are usually close.
- **The optimiser.** sklearn uses a fast solver (`lbfgs`), not plain gradient descent. If it prints a `ConvergenceWarning`, raise `max_iter` or scale the features.

sklearn also handles more than two classes (Body Performance has four grades) using a softmax generalisation. The handbook's class is binary only, so for a multi-class target in homework 4 either pick a binary dataset or train one-vs-rest yourself.

Homework 4 also says: if the classes are text (`'Yes'`/`'No'`, `'M'`/`'B'`), map them to numbers first, e.g. `df['Churn'] = df['Churn'].map({'No': 0, 'Yes': 1})`.

## Common mistakes

> **Passing y as a column to the handbook's class.** With y of shape (m, 1) and pred of shape (m,), `pred - y` broadcasts to (m, m) and the gradient is wrong without any error. Use `y.ravel()`.

> **Reading accuracy on imbalanced data as success.** See the next lesson.

> **Forgetting the threshold is adjustable.** For costly false negatives, lower it and measure recall.

## Summary

Logistic regression computes z = w·x + b and p = σ(z), then predicts 1 when p ≥ 0.5 (equivalently z ≥ 0), so its decision boundary is linear. Weights act on log-odds. Training minimises log loss, which is convex; its gradient is Xᵀ(p − y)/m, the same shape as linear regression's. The handbook's class adds a ones column, starts from zeros, and runs full-batch gradient descent; sklearn adds L2 regularisation and a faster solver.

--- practice
@predict
Weights w = (2, −1), intercept b = 0.5, sample x = (1, 3). What probability does logistic regression output? Round to 4 decimals.
```python
import math
z = 2 * 1 - 1 * 3 + 0.5
print(round(1 / (1 + math.exp(-z)), 4))
```
= 0.3775
! z = −0.5 and σ(−0.5) ≈ 0.3775, so the predicted class at threshold 0.5 is 0.

@choice
With threshold 0.5, the decision boundary of logistic regression is the set of points where:
- σ(z) = 1
* w·x + b = 0
- w·x + b = 0.5
- The log loss is zero
! σ(z) = 0.5 exactly when z = 0, so the boundary is the hyperplane w·x + b = 0. That is why logistic regression is a linear classifier.

@choice
Why does the handbook use log loss instead of squared error for logistic regression?
- Squared error cannot be computed for probabilities
* Squared error through a sigmoid is not convex, so gradient descent may stop in a local minimum
- Log loss is faster to compute
- sklearn requires it
! Log loss with a sigmoid is convex, which guarantees gradient descent heads to the single global minimum.

@run
Write `step(X, y, w, lr)`: X already contains the ones column. Compute pᵢ = σ(w·xᵢ), the gradient (1/m)·Xᵀ(p − y), and return the updated weights rounded to 4 decimals. Also write `predict(X, w, threshold)`.
```starter
import math

def sigmoid(z):
    return 1 / (1 + math.exp(-z))

def step(X, y, w, lr):
    pass

def predict(X, w, threshold):
    pass
```
```test
X = [[1, 1], [2, 1], [3, 1], [4, 1]]
y = [0, 0, 1, 1]
print(step(X, y, [0, 0], 0.1))
print(step(X, y, [1, -2.5], 0.5))
print(predict(X, [1, -2.5], 0.5), predict(X, [1, -2.5], 0.2))
```
= [0.05, 0.0]
= [1.1156, -2.5]
= [0, 0, 1, 1] [0, 1, 1, 1]
```solution
import math

def sigmoid(z):
    return 1 / (1 + math.exp(-z))

def step(X, y, w, lr):
    m = len(X)
    p = [sigmoid(sum(a * b for a, b in zip(row, w))) for row in X]
    grad = [sum((p[i] - y[i]) * X[i][j] for i in range(m)) / m for j in range(len(w))]
    return [round(w[j] - lr * grad[j], 4) for j in range(len(w))]

def predict(X, w, threshold):
    return [1 if sigmoid(sum(a * b for a, b in zip(row, w))) >= threshold else 0 for row in X]
```
! With w = (1, −2.5) the second sample has z = −0.5 and p ≈ 0.38: class 0 at threshold 0.5, class 1 at threshold 0.2. Lower thresholds catch more positives at the cost of more false alarms.

@predict
A logistic model outputs p = 0.8. What are the log-odds, log(p / (1 − p)), rounded to 4 decimals?
```python
import math
print(round(math.log(0.8 / 0.2), 4))
```
= 1.3863
! The odds are 0.8/0.2 = 4, and ln 4 ≈ 1.3863. The log-odds equal the linear score z, which is how weights are interpreted.

@choice
In homework 4 you pass `y` with shape (m, 1) to the handbook's `LogisticRegression.fit`. What happens?
- An error is raised immediately
* `pred - y` broadcasts to an (m, m) matrix, so the gradient is wrong but no error appears
- It works normally
- The intercept is dropped
! pred has shape (m,). Subtracting a column (m, 1) broadcasts both into (m, m). Flatten y with `y.ravel()` first.

@write
From memory, explain how logistic regression turns features into a class label, what the weights mean, and why you might lower the threshold below 0.5.
min: 60
```solution
It computes a linear score z = w·x + b, passes it through the sigmoid p = 1/(1 + e^(−z)) to get the probability of class 1, and predicts 1 if p is at least the threshold (0.5 by default, which is the same as z ≥ 0). Each weight is the change in the log-odds log(p/(1 − p)) when its feature increases by one unit with the others fixed; positive weights push toward class 1, negative toward class 0. Lowering the threshold makes the model predict the positive class more often, which raises recall and lowers missed positives; that is worth it when a false negative is costly, such as missing a sick patient, even though false positives increase.
```
! Check you linked the threshold to the cost of false negatives.

--- recall
Q: What is the gradient of log loss for logistic regression?
A: (1/m) · Xᵀ(σ(Xw) − y)
Q: What does `predict_proba` return for a binary classifier, and which column is P(class 1)?
A: Two columns [P(0), P(1)]; take `[:, 1]`.
Q: How do you interpret a logistic regression weight?
A: The change in log-odds per unit increase of that feature (odds multiply by e^w).
Q: Name two differences between sklearn's LogisticRegression and the handbook's class.
A: sklearn adds L2 regularisation (C=1.0) and uses a faster solver (lbfgs); it also supports multi-class.
