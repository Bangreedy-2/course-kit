=== tuning | craft | 7 | Hyperparameter tuning and cross-validation | d-knn
@@ About 30 min reading · Handbook chapter 12 · Homework 7 and 8, and every model after
## Why this matters

Homework 7 and 8 have you plot accuracy against one hyperparameter at a time on a single train/test split. That is a good way to build intuition, but it has two flaws: one split is noisy, and picking the value that scores best on the test set turns the test set into training data. This lesson gives you the proper tools: validation sets, k-fold cross-validation, grid search and random search, with KNN as the running example, since the handbook uses it to introduce hyperparameters.

## Parameters versus hyperparameters

**Parameters** are learned from the data during `fit`: the weights of a linear model, the thresholds of a tree, the support vectors of an SVM. **Hyperparameters** are set by you before training and control how learning happens: `max_depth`, `C`, `gamma`, `n_neighbors`, `alpha`, the learning rate. In sklearn, hyperparameters are constructor arguments; learned parameters end in an underscore (`coef_`, `feature_importances_`).

## A model made of one hyperparameter: k-nearest neighbours

**KNN** (`KNeighborsClassifier`) stores the training set. To classify a new point it finds the k training points closest to it (Euclidean distance by default) and takes a majority vote of their labels (`KNeighborsRegressor` averages their targets). Training is instant; prediction does the work. Because it uses distances, features must be scaled.

k controls the bias-variance trade-off directly:

- k = 1: every training point is its own neighbour, so training accuracy is 1.0 and the boundary follows every noisy point (high variance).
- Large k: the vote averages over a wide area and the boundary becomes smooth; at k = n every prediction is the majority class (high bias).

Breast cancer data, scaled KNN, the same split as before (train 426 rows, test 143):

| k | train accuracy | 5-fold CV on train | test accuracy |
|---|---|---|---|
| 1 | 1.000 | 0.944 | 0.951 |
| 3 | 0.977 | 0.965 | 0.972 |
| 5 | 0.969 | 0.962 | 0.979 |
| 9 | 0.969 | 0.967 | 0.965 |
| 25 | 0.967 | 0.955 | 0.944 |
| 101 | 0.925 | 0.913 | 0.937 |

Cross-validation picks k = 9 here; the test set would have picked k = 5. That is exactly the point: we choose using validation data, and the test set is looked at once, at the end, to report.

## Train, validation, test

If you try 20 values of k and keep the one with the best test score, the test score is now optimistic: you selected it for being high. The fix is three roles:

- **Training set**: fits the parameters.
- **Validation set**: compares hyperparameter values.
- **Test set**: touched once, after all choices, to estimate performance on new data.

## k-fold cross-validation

A single validation split wastes data and is noisy. **k-fold cross-validation** splits the training data into k equal **folds** (usually 5 or 10). Each fold takes a turn as the validation set while the model trains on the other k − 1; the k scores are averaged, and their standard deviation tells you how noisy the estimate is. Every training row is used for validation exactly once.

With 10 rows and 5 folds, `KFold(5)` gives fold 1 the validation rows [0, 1] and trains on [2, …, 9], fold 2 validates on [2, 3], and so on. For classification sklearn uses **stratified** k-fold by default (`StratifiedKFold`), which keeps the class shares the same in every fold. Use `shuffle=True` with a `random_state` if the rows are ordered, and never shuffle time series (use `TimeSeriesSplit`).

```
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier

model = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=9))
scores = cross_val_score(model, X_train, y_train, cv=5, scoring="accuracy")
scores.mean(), scores.std()
```

Putting the scaler inside the pipeline matters: in each fold it is fitted on the four training folds only, so nothing leaks from the validation fold.

## Grid search

**Grid search** tries every combination from lists of values and cross-validates each one. The number of fits is the product of the list lengths times the number of folds.

```
from sklearn.model_selection import GridSearchCV
from sklearn.svm import SVC

pipe = make_pipeline(StandardScaler(), SVC())
grid = {"svc__C": [0.1, 1, 10, 100], "svc__gamma": [0.001, 0.01, 0.1, 1]}
search = GridSearchCV(pipe, grid, cv=5, scoring="accuracy").fit(X_train, y_train)
search.best_params_, search.best_score_      # best combination, its mean CV score
search.score(X_test, y_test)                 # refit on all training data, scored once on test
```

Here that is 4 × 4 = 16 combinations × 5 folds = 80 fits. On breast cancer it chose C = 10, gamma = 0.001 with CV accuracy 0.977, and the refit model scored 0.979 on the test set.

Points to know:

- Inside a pipeline, parameters are named `<step>__<parameter>` with **two** underscores; `make_pipeline` names each step after its class in lower case (`svc`, `standardscaler`).
- `scoring` picks the metric: `"accuracy"`, `"f1"`, `"recall"`, `"roc_auc"`, `"neg_mean_squared_error"` (errors are negated so that higher is always better).
- `refit=True` (default) retrains the best combination on the full training set; `search.best_estimator_` is that model.
- `search.cv_results_` holds every combination's scores; put it in a DataFrame to plot.
- Use log-spaced values for C, gamma, alpha and learning rates (0.001, 0.01, 0.1, …): their effect is multiplicative.

## Random search

**Random search** (`RandomizedSearchCV`) samples `n_iter` combinations from lists or distributions. With the same budget it tries more distinct values of each hyperparameter than a grid, which matters because usually only a few hyperparameters really matter: a 4 × 4 grid tests only 4 values of each, while 16 random draws test 16. With `C` from `loguniform(0.01, 1000)`, `gamma` from `loguniform(0.0001, 1)`, `n_iter=16` and `random_state=0`, it found C ≈ 4.07, gamma ≈ 0.0046, CV 0.969 and test 0.979: as good on test with no grid to design. (`loguniform` comes from `scipy.stats`; it samples evenly across orders of magnitude.)

Smarter searches (Bayesian optimisation in Optuna or scikit-optimize, successive halving with `HalvingGridSearchCV`) use earlier results to decide where to look next.

## Reading validation curves

Plot training and validation scores against a hyperparameter (`validation_curve` does this):

- Both low: **underfitting** (high bias). Make the model more flexible.
- Training high, validation clearly lower: **overfitting** (high variance). Regularise or simplify.

Which direction is "more flexible"? Larger `max_depth`, larger `C`, larger `gamma`, larger polynomial `degree`, smaller `k` in KNN, smaller `min_samples_leaf`, smaller `alpha` in Ridge or Lasso.

### Corrections to the handbook's chapter

- It says that a bigger SVM `C` means bigger regularisation and pushes toward underfitting. It is the reverse: C is the *inverse* of regularisation strength, so a bigger C means less regularisation and a risk of overfitting (as in the SVM lesson's C = 100 row).
- It groups `n_estimators` with `min_samples_leaf` as raising bias. More trees do not raise bias; they reduce variance until the score levels off.
- `LinearRegression(normalize=...)` no longer exists (removed in sklearn 1.2); scale in a pipeline.
- No search "guarantees" the best model: it finds the best of what you tried, measured with noise.

## Common mistakes

> **Tuning on the test set.** Tune with cross-validation on the training data; test once.

> **Scaling before cross-validation.** Put preprocessing inside the pipeline.

> **Huge grids.** Five hyperparameters with five values each and 5 folds is 15,625 fits. Use random search.

## Summary

Hyperparameters are set before training; parameters are learned. KNN predicts by a vote of the k nearest points; small k overfits, large k underfits. Choose hyperparameters with k-fold cross-validation on the training data (stratified for classification), keep the test set for one final score, and keep preprocessing inside a pipeline. Grid search tries every combination (product of list lengths × folds fits); random search samples combinations and covers more values per hyperparameter for the same budget.

--- practice
@predict
A grid has C in [0.1, 1, 10], gamma in [0.01, 0.1, 1, 10] and kernel in ["rbf", "poly"], with cv=5. How many models does GridSearchCV fit before the final refit?
```python
print(3 * 4 * 2 * 5)
```
= 120
! 24 combinations, each trained once per fold.

@choice
Which of these is a hyperparameter rather than a learned parameter?
- The coefficients of a logistic regression
- The thresholds chosen by a decision tree
* The number of neighbours k in KNN
- The support vectors of an SVM
! k is chosen before training; the others come out of `fit` (in sklearn they end in `_`).

@choice
KNN with k = 1 scores 1.000 on training data and 0.944 in cross-validation. What should you try?
* A larger k
- A smaller k
- Removing feature scaling
- Evaluating on the training data instead
! k = 1 memorises the training set (each point is its own nearest neighbour). A larger k averages away noise.

@predict
In a pipeline built with `make_pipeline(StandardScaler(), SVC())`, what key do you use in the parameter grid for the SVC's C? Type the string without quotes.
```python
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
p = make_pipeline(StandardScaler(), SVC())
print([k for k in p.get_params() if k.endswith("__C")][0])
```
= svc__C
! Step name (the class name in lower case), then two underscores, then the parameter.

@run
Write `stratified_counts(y, k)`: assign the indices of each class, in order, to folds 0, 1, …, k−1, 0, 1, … (round-robin per class), and return a list with one dict of class counts per fold (handle the classes in sorted order). Then `cv_mean(scores)` returning `(mean, population std)` rounded to 3.
```starter
def stratified_counts(y, k):
    pass

def cv_mean(scores):
    pass
```
```test
y = [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1]
print(stratified_counts(y, 2))
print(stratified_counts(y, 4))
print(cv_mean([0.95, 0.97, 0.96, 0.94, 0.98]))
```
= [{0: 4, 1: 2}, {0: 4, 1: 2}]
= [{0: 2, 1: 1}, {0: 2, 1: 1}, {0: 2, 1: 1}, {0: 2, 1: 1}]
= (0.96, 0.014)
```solution
def stratified_counts(y, k):
    folds = [{} for _ in range(k)]
    for c in sorted(set(y)):
        idx = [i for i, t in enumerate(y) if t == c]
        for j, i in enumerate(idx):
            f = folds[j % k]
            f[c] = f.get(c, 0) + 1
    return folds

def cv_mean(scores):
    m = sum(scores) / len(scores)
    sd = (sum((s - m) ** 2 for s in scores) / len(scores)) ** 0.5
    return round(m, 3), round(sd, 3)
```
! With 8 zeros and 4 ones, each of 4 folds gets 2 zeros and 1 one, the same 2:1 ratio as the whole set. Without stratification a fold could end up with no positives at all.

@choice
You have five hyperparameters but suspect only one or two matter, and a budget of 30 fits per fold. Which search is the better choice?
- A grid with 2 values each (32 combinations)
* Random search with n_iter=30
- Tuning on the test set, which is faster
- No tuning; defaults are always best
! A 2-value grid tries only two values of the important hyperparameter; 30 random draws try 30.

@write
From memory, explain why choosing hyperparameters by test-set accuracy gives an over-optimistic estimate, and describe the correct procedure with cross-validation.
min: 60
```solution
If you compare many hyperparameter values on the test set and keep the best, you have selected that value partly because of the random quirks of the test set, so its score is biased upward and no longer estimates performance on new data. The correct procedure: split off a test set first and do not touch it. On the training set, run k-fold cross-validation for each candidate (for example with GridSearchCV): train on k − 1 folds, validate on the remaining one, rotate, and average. Keep preprocessing inside a pipeline so each fold fits it on its own training part. Pick the best mean CV score, refit on the whole training set, and evaluate once on the test set.
```
! Check that your procedure keeps the test set out of every choice.

--- recall
Q: Difference between a parameter and a hyperparameter?
A: Parameters are learned by fit (coef_, thresholds); hyperparameters are set before training (C, max_depth, k).
Q: How does k-fold cross-validation work?
A: Split the training data into k folds; train on k − 1, validate on the remaining one, rotate through all k, average the scores.
Q: How many fits does a grid search make?
A: Product of the number of values of each hyperparameter × number of folds (+1 refit).
Q: Why can random search beat grid search on the same budget?
A: It tries more distinct values of each hyperparameter, which helps when only a few hyperparameters matter.
