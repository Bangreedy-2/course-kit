=== evalreg | sup | 3 | Train/test split and regression metrics | d-r2
@@ About 25 min reading · Handbook chapter 5.2 and Homework Book chapters 3 and 18 · Homework 3
## Why this matters

A model is only useful if it predicts well on data it has never seen. Every homework from 3 onward splits the data, trains on one part and reports a metric on the other. Homework 3 uses `.score` (R²); homework 18 asks for MSE, MAE and RMSE tables. If you know exactly what each number measures, you can say which model is better and why, which is what the "interpret your results" bullet in each homework is really grading.

## Generalisation and the test set

A model that memorises its training data can score perfectly on it and still be useless on new rows. What we care about is **generalisation error**: the error on new data from the same source. We estimate it by holding some data back:

```
from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42)
```

- `test_size=0.3` keeps 30% of rows for testing. 20 to 30% is typical.
- The rows are **shuffled** before splitting, so the test set is a random sample. `random_state=42` fixes the shuffle so your results are reproducible; any fixed integer works, 42 is just a habit.
- The function returns four arrays in this order: X_train, X_test, y_train, y_test. Mixing up the order is a common silent bug.
- For classification, add `stratify=y` so both parts keep the same class proportions.

With 10 rows and `test_size=0.3`, you get 7 training rows and 3 test rows.

The golden rule: **the test set is used once, at the end, to report.** Anything learned from data (scaling statistics, imputation values, selected features, chosen hyperparameters) must be learned from the training set only. Fitting a scaler on all data before splitting lets information from the test rows leak into training, and the reported score becomes optimistic. This is called **data leakage**. Week 7 introduces a third split (validation, or cross-validation) for choosing hyperparameters without touching the test set.

## Metrics for regression

Notation: yᵢ true values, ŷᵢ predictions, n rows, ȳ the mean of the true values.

### MSE: mean squared error

$$
MSE = (1/n) · Σ (yᵢ − ŷᵢ)²
$$

The training cost, reused as a metric. In squared units (euros², degrees²), so hard to read directly, and dominated by the largest errors.

### RMSE: root mean squared error

$$
RMSE = √MSE
$$

Same ranking of models as MSE, but back in the target's units: "the typical error is about 2.1 degrees". It still weights large errors heavily.

### MAE: mean absolute error

$$
MAE = (1/n) · Σ |yᵢ − ŷᵢ|
$$

The average size of an error, in the target's units, with every error counted in proportion to its size. Less sensitive to a few huge errors. RMSE is always at least as large as MAE; a big gap between them means a few predictions are very wrong.

### R²: coefficient of determination

$$
R² = 1 − SSE / SST
SSE = Σ (yᵢ − ŷᵢ)²         (the model's squared errors)
SST = Σ (yᵢ − ȳ)²          (squared errors of always predicting the mean)
$$

R² compares your model with the laziest possible model, one that predicts ȳ for every row.

- **R² = 1**: perfect predictions.
- **R² = 0**: no better than predicting the mean.
- **R² < 0**: worse than predicting the mean. This is possible on a test set, and it is a red flag (often a bug, divergence, or leakage in reverse).

R² is unitless, so it lets you compare models across datasets, which is why `.score` on regressors returns it and why homework 3 uses it. Read it as "the share of the target's variation the model explains". An R² of 0.7 on house prices is respectable; 0.7 on a physics measurement may be poor. Context matters.

### Worked example

True y = 10, 20, 30, 40; predictions 12, 18, 33, 41. Errors y − ŷ: −2, 2, −3, −1.

- MSE = (4 + 4 + 9 + 1) / 4 = 18 / 4 = **4.5**
- RMSE = √4.5 ≈ **2.121**
- MAE = (2 + 2 + 3 + 1) / 4 = **2.0**
- ȳ = 25, SST = 225 + 25 + 25 + 225 = 500, SSE = 18, R² = 1 − 18/500 = **0.964**

And a cautionary one: true y = 1, 2, 3, predictions 3, 3, 3. SSE = 4 + 1 + 0 = 5; SST = 1 + 0 + 1 = 2; R² = 1 − 5/2 = **−1.5**. Predicting a constant that is not even the mean is worse than the mean.

### In scikit-learn

```
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
y_pred = model.predict(X_test)
mse  = mean_squared_error(y_test, y_pred)
rmse = mse ** 0.5               # or np.sqrt(mse)
mae  = mean_absolute_error(y_test, y_pred)
r2   = r2_score(y_test, y_pred) # same as model.score(X_test, y_test)
```

Argument order is (true, predicted). For MSE and MAE the order does not change the value, but for R² it does, so keep the habit. The handbook's example passes `(y_pred, y_test)` to `mean_squared_error`; that is harmless there, but would give a wrong R².

## Comparing models fairly: homework 3

Homework 3 trains two models (sklearn and from-scratch) on two feature sets (all features, and the 0.5–0.8 correlation subset), giving four test R² values. For the comparison to mean anything:

1. Use the **same split** for both models. Same `random_state`, same `test_size`.
2. Report the **test** score. Training scores are useful only to diagnose overfitting: training R² much higher than test R² means the model fits noise.
3. Expect the from-scratch model to be slightly worse unless it has converged. If it is much worse, check the learning rate, the number of iterations and feature scaling before concluding anything about the algorithm. Linear regression from scratch and sklearn's should reach almost the same weights, because they minimise the same cost.
4. Explain the feature-set difference. Fewer features can score slightly lower (less information) or higher (less noise and less multicollinearity). Both are possible; say which happened and suggest why.

A useful table for your notebook:

| Model | Features | Train R² | Test R² |
|---|---|---|---|
| sklearn | all | … | … |
| from scratch | all | … | … |
| sklearn | 0.5 ≤ abs(r) ≤ 0.8 | … | … |
| from scratch | 0.5 ≤ abs(r) ≤ 0.8 | … | … |

Build it with a list of dicts and `pd.DataFrame(rows)`.

## A single split is noisy

With a few hundred rows, a different `random_state` can move test R² by several hundredths. Two models whose scores differ by 0.01 are not meaningfully different. Week 7's cross-validation averages over several splits to give a steadier estimate. For now, mention this uncertainty in your conclusions.

## Common mistakes

> **Unpacking in the wrong order:** `X_train, y_train, X_test, y_test = train_test_split(X, y)` silently assigns test features to `y_train`. The order is X_train, X_test, y_train, y_test.

> **Fitting preprocessing on the full dataset** before splitting (leakage).

> **Reporting MSE without units or context.** "MSE = 4.5" says little; "RMSE ≈ 2.1 °C on temperatures ranging 20 to 120 °C" says a lot.

## Summary

Split once with `train_test_split(X, y, test_size=0.3, random_state=…)`, learn everything from the training part, report on the test part. MSE is the squared-error average; RMSE puts it back in target units; MAE is the average absolute error and is less sensitive to outliers; R² = 1 − SSE/SST compares the model with predicting the mean and can be negative. Compare models on the same split and treat small differences with caution.

--- practice
@predict
True values 3, 5, 7, 9; predictions 2.5, 5, 7.5, 9. What is the MAE?
```python
y = [3, 5, 7, 9]; p = [2.5, 5, 7.5, 9]
print(sum(abs(a - b) for a, b in zip(y, p)) / 4)
```
= 0.25
! Absolute errors 0.5, 0, 0.5, 0 sum to 1; divided by 4 gives 0.25.

@predict
Same values. What is R²? (ȳ = 6)
```python
y = [3, 5, 7, 9]; p = [2.5, 5, 7.5, 9]
sse = sum((a - b) ** 2 for a, b in zip(y, p)); m = sum(y) / 4
sst = sum((a - m) ** 2 for a in y)
print(1 - sse / sst)
```
= 0.975
! SSE = 0.25 + 0 + 0.25 + 0 = 0.5. SST = 9 + 1 + 1 + 9 = 20. R² = 1 − 0.5/20 = 0.975.

@choice
A model's test R² is −0.3. What does that mean?
- The model explains 30% of the variation
* Its predictions are worse than always predicting the mean of the test targets
- R² cannot be negative, so there is a bug in sklearn
- The model is overfitting by 30%
! R² = 1 − SSE/SST is negative whenever SSE > SST, which means the model does worse than the constant mean prediction.

@choice
Which of these causes data leakage?
- Splitting with `random_state=0` instead of 42
* Fitting a StandardScaler on all rows, then splitting into train and test
- Using `test_size=0.2`
- Computing MAE on the test set
! The scaler's mean and std then include the test rows, so information from the test set enters training. Fit the scaler on X_train only.

@run
Write `split(rows, test_size)` that, given a list already shuffled for you, returns `(train, test)` where the test part is the **last** `round(len(rows) * test_size)` items. Then write `rmse(y, p)`.
```starter
import math

def split(rows, test_size):
    pass

def rmse(y, p):
    pass
```
```test
tr, te = split(list(range(10)), 0.3)
print(tr, te)
tr, te = split(["a", "b", "c", "d", "e"], 0.2)
print(tr, te)
print(round(rmse([10, 20, 30, 40], [12, 18, 33, 41]), 4))
```
= [0, 1, 2, 3, 4, 5, 6] [7, 8, 9]
= ['a', 'b', 'c', 'd'] ['e']
= 2.1213
```solution
import math

def split(rows, test_size):
    k = round(len(rows) * test_size)
    return rows[:len(rows) - k], rows[len(rows) - k:]

def rmse(y, p):
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(y, p)) / len(y))
```
! sklearn shuffles first and then cuts, which is why a fixed `random_state` matters. RMSE 2.12 is in the target's units.

@choice
For the same predictions, RMSE is 12 and MAE is 3. What does the gap suggest?
- The model is perfect
* A few predictions have very large errors that dominate the squared metric
- All errors are about the same size
- The test set is too large
! Squaring makes large errors dominate RMSE. When RMSE is much larger than MAE, look for the rows with the biggest residuals.

@write
From memory, define R² with its formula, explain what R² = 0 and a negative R² mean, and say why homework 3 compares models on the same train/test split.
min: 60
```solution
R² = 1 − SSE/SST, where SSE = Σ(yᵢ − ŷᵢ)² is the model's sum of squared errors and SST = Σ(yᵢ − ȳ)² is the sum of squared errors of always predicting the mean of the true values. R² = 1 is perfect; R² = 0 means the model is no better than predicting the mean; a negative R² means it is worse than that. Models must be compared on the same split because the test score varies with which rows land in the test set; using different splits would mix differences between models with differences between splits.
```
! Check you described SST as the error of the mean predictor.

--- recall
Q: In what order does `train_test_split(X, y)` return its arrays?
A: X_train, X_test, y_train, y_test
Q: Write R² in terms of SSE and SST and say what each is.
A: R² = 1 − SSE/SST; SSE = model's squared errors, SST = squared errors of predicting the mean.
Q: Which metric is in the target's units and weights large errors heavily?
A: RMSE (MAE is also in target units but weights errors linearly).
Q: What is data leakage, with one example?
A: Information from the test set influencing training, e.g. fitting a scaler or imputer on all data before splitting.
