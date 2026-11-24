=== rforest | sup | 6 | Random forests: bagging, feature sampling and importance | d-vote
@@ About 30 min reading · Handbook chapter 9 · Homework 8
## Why this matters

The previous lesson ended with the tree's big weakness: high variance. A random forest fixes it by training many deliberately different trees and letting them vote. It is one of the most reliable "first serious model" choices for tabular data: little tuning, no scaling, built-in feature importance and a free validation estimate. Homework 8 repeats the homework 7 experiments with `RandomForestClassifier` and asks you to compare; this lesson tells you what to expect and why.

## Ensembles and the wisdom of crowds

An **ensemble** combines several models into one. If you average B models whose errors are independent, the errors partly cancel. Formally, if each tree's prediction has variance σ² and every pair of trees has correlation ρ (rho, a number from 0 to 1), the variance of their average is:

$$
Var(average) = ρ·σ² + (1 − ρ)·σ² / B
$$

As B grows, the second term vanishes, but the first does not: with σ² = 1, ρ = 0.3 and B = 100 the variance is 0.3 + 0.7/100 = 0.307, and no number of trees gets it below 0.3. So the trick is twofold: use many trees **and make them as uncorrelated as possible**. A random forest injects two kinds of randomness to do exactly that.

## Randomness 1: bootstrap samples (bagging)

Each tree is trained on a **bootstrap sample**: n rows drawn from the n training rows **with replacement**, so some rows appear several times and others not at all. Training models on bootstrap samples and averaging them is called **bagging** (bootstrap aggregating).

How many rows does a tree never see? The chance that one particular row is not picked in one draw is 1 − 1/n, so the chance it is never picked in n draws is:

$$
(1 − 1/n)^n → e^(−1) ≈ 0.368  as n grows
$$

For n = 100 it is 0.366; for n = 1000, 0.368. These unseen rows are that tree's **out-of-bag (OOB)** rows. (The handbook says "one-third" are set aside; the exact limit is about 36.8%, and nothing is "set aside" on purpose: it is a side effect of sampling with replacement.)

Because each row is out-of-bag for about a third of the trees, we can predict every training row using only the trees that did not see it, and score those predictions. That **OOB score** (`oob_score=True`) is a validation estimate that costs no extra data.

## Randomness 2: random feature subsets

If one feature is very strong, every bootstrap tree would put it at the root and the trees would be highly correlated. So at **each split**, a forest tree considers only a random subset of `max_features` features. sklearn's default for classification is `"sqrt"`: √d features out of d (5 of 30 for the breast cancer data). For `RandomForestRegressor` the default is 1.0 (all features), so regression forests rely on bagging alone unless you lower it.

(The handbook's printed model shows `max_features='auto'` and `min_impurity_split`; both were removed from recent sklearn versions and raise errors there. Use `"sqrt"` and `min_impurity_decrease`.)

## Prediction: vote or average

- **Classification**: sklearn averages the trees' predicted class probabilities and picks the class with the highest average (a "soft" vote). The classic description, and your drill, uses a majority vote of predicted labels; the two usually agree.
- **Regression**: the average of the trees' predictions.

## The main hyperparameters

- `n_estimators`: number of trees (default 100). More trees never overfit in the usual sense; accuracy levels off and training just gets slower.
- `max_features`: features tried per split; the main lever on tree correlation.
- `max_depth`, `min_samples_leaf`, `min_samples_split`, `max_leaf_nodes`: the same tree limits as before. Forests usually grow trees deep and rely on averaging to cancel variance, so these matter less than for one tree.
- `bootstrap` (default True), `max_samples` (size of each bootstrap sample), `oob_score`.
- `class_weight="balanced"` for imbalanced classes (week 9), `n_jobs=-1` to use all CPU cores, `random_state` for reproducible results.

## Real numbers: tree versus forest

Breast cancer data, the same split as in the tree lesson (`test_size=0.25, random_state=42, stratify=y`):

| model | train accuracy | test accuracy | OOB score |
|---|---|---|---|
| one unrestricted tree | 1.000 | 0.923 | |
| forest, 10 trees | 1.000 | 0.951 | 0.948 |
| forest, 100 trees | 1.000 | 0.958 | 0.962 |
| forest, 300 trees | 1.000 | 0.958 | 0.962 |

With 5-fold cross-validation on all 569 rows, the tree averages 0.917 and the 100-tree forest 0.956. Three lessons in the table: the forest also scores 1.0 on training data, yet generalises better (averaging cancels the memorised noise); going from 100 to 300 trees changed nothing; and the OOB score tracks the test score closely without touching the test set. Expect the same pattern in homework 8: the forest's accuracy-vs-hyperparameter curves are flatter and higher than the single tree's.

Its decision boundary is also smoother: still made of axis-parallel steps, but the average of many staircases.

## Feature importance

After fitting, `feature_importances_` gives one number per feature, summing to 1. sklearn computes **mean decrease in impurity (MDI)**, also called Gini importance: every time a feature is used to split, the weighted impurity decrease of that split is credited to it; the totals are averaged over trees and normalised.

```
import pandas as pd
from sklearn.datasets import load_iris
from sklearn.ensemble import RandomForestClassifier

iris = load_iris()
rf = RandomForestClassifier(n_estimators=100, random_state=0).fit(iris.data, iris.target)
pd.Series(rf.feature_importances_, index=iris.feature_names).sort_values(ascending=False)
```

With `random_state=0` this gives petal length 0.460, petal width 0.424, sepal length 0.091, sepal width 0.025 (the handbook's run, with another random split, got 0.459, 0.414, 0.104 and 0.024; the ranking is what is stable).

Two cautions. MDI is computed on training data, and it is **biased toward features with many distinct values** (continuous or high-cardinality columns offer more thresholds to exploit), even when they are noise. And when two features are correlated, they share the credit, so each can look less important than it is. Permutation importance (week 10) avoids both problems.

### About the handbook's feature selection example

Chapter 9.2.3 drops one feature, retrains and reports accuracy rising from 0.933 to 0.952, concluding that removing the feature removed noise. Three problems: the comment says "sepal length" was removed while the code removes sepal width; `test_size=0.70` makes **70% the test set**, not the training set as the comment claims; and the two accuracies come from different random splits of different sizes, so the difference is within noise (on 45 test rows, one flower is 2.2 percentage points). To compare feature sets fairly, use the same split or, better, cross-validation. `sklearn.cross_validation` in that code was also removed long ago; use `sklearn.model_selection`.

## Missing values

The handbook's conclusion says random forests "can handle missing values", while 9.2.1 says sklearn's forest errors on NaN. Both have been true at different times: older sklearn raised an error, and recent versions (1.4 and later) let `RandomForestClassifier` handle NaN natively. Imputation (week 7) is still the portable habit, and the course's homework expects it.

## Common mistakes

> **Tuning n_estimators as if more trees overfit.** They don't; pick a value where the score has levelled off.

> **Taking MDI importances as truth.** Check with permutation importance before dropping features.

> **Comparing models on different random splits.** Fix `random_state` or cross-validate.

## Summary

A random forest averages many deep trees, each trained on a bootstrap sample (about 63.2% distinct rows; the other 36.8% are out-of-bag) and each choosing splits from a random subset of features (`max_features`, √d by default for classification). Averaging lowers variance, and decorrelating the trees lowers it further. Classification takes the average probability (vote), regression the mean. More trees do not overfit. `feature_importances_` is impurity-based (MDI) and biased toward high-cardinality features. The OOB score is a free validation estimate.

--- practice
@predict
What fraction of rows does a bootstrap sample of size n = 10 miss, on average? Round to 4 decimals.
```python
print(round((1 - 1 / 10) ** 10, 4))
```
= 0.3487
! (0.9)¹⁰ ≈ 0.3487. As n grows it approaches e⁻¹ ≈ 0.3679.

@choice
What does `max_features="sqrt"` do in a random forest?
- Each tree is trained on √n rows
* At each split, only √d randomly chosen features are considered
- The forest keeps the √d most important features
- Each tree has depth √d
! Random feature subsets at every split stop one strong feature from dominating every tree, which decorrelates the trees.

@predict
Trees have variance σ² = 4 each and pairwise correlation ρ = 0.5. What is the variance of the average of 100 trees? Type a decimal.
```python
s2, rho, B = 4, 0.5, 100
print(rho * s2 + (1 - rho) * s2 / B)
```
= 2.02
! 0.5·4 + 0.5·4/100 = 2 + 0.02. The ρσ² part never shrinks with more trees, which is why forests decorrelate trees.

@choice
A forest's test accuracy is 0.958 with 100 trees and 0.958 with 300. What should you conclude?
* The score has levelled off; 100 trees is enough
- 300 trees overfit, so use 100
- Use 1000 trees to be safe
- n_estimators has no effect on forests
! Adding trees does not overfit; it only stops helping. Choose the smallest number where the score has levelled off.

@run
Write `forest_predict(trees, x)` for regression: `trees` is a list of functions, each mapping a sample to a number; return the mean of their predictions rounded to 3. Then `oob_rows(n, picks_per_tree)` returning, for each row 0..n−1, how many trees did **not** pick it (the trees for which it is out-of-bag).
```starter
def forest_predict(trees, x):
    pass

def oob_rows(n, picks_per_tree):
    pass
```
```test
trees = [lambda x: 2 * x, lambda x: x + 1, lambda x: 10]
print(forest_predict(trees, 3), forest_predict(trees, 0))
print(oob_rows(4, [[0, 0, 1, 3], [1, 2, 2, 2], [3, 3, 0, 1]]))
```
= 6.667 3.667
= [1, 0, 2, 1]
```solution
def forest_predict(trees, x):
    preds = [t(x) for t in trees]
    return round(sum(preds) / len(preds), 3)

def oob_rows(n, picks_per_tree):
    counts = [0] * n
    for picks in picks_per_tree:
        chosen = set(picks)
        for i in range(n):
            if i not in chosen:
                counts[i] += 1
    return counts
```
! Row 2 was missed by trees 1 and 3, so two trees can score it out-of-bag. Row 1 was picked by every tree, so no OOB prediction exists for it; with 3 trees that happens, with 100 it almost never does.

@choice
Your forest ranks a random ID-like numeric column as the third most important feature. What is the most likely reason?
- The ID column really predicts the target
* Impurity-based importance favours features with many distinct values, which offer many thresholds to overfit
- The forest needs more trees
- The ID column must be scaled first
! MDI is computed on training data and rewards splits that only fit noise. Drop IDs, and verify importances with permutation importance on held-out data.

@write
From memory, explain the two sources of randomness in a random forest and why each makes the forest better than a single tree.
min: 60
```solution
First, each tree is trained on a bootstrap sample: n rows drawn with replacement, so each tree sees a different version of the data (about 63% distinct rows, the rest out-of-bag). Second, at every split a tree considers only a random subset of features, max_features (√d by default for classification). Both make the trees different from one another. A single deep tree has high variance; averaging many trees cancels much of it, and the cancellation is stronger the less correlated the trees are, because the variance of the average is ρσ² + (1 − ρ)σ²/B. Feature sampling especially lowers ρ by stopping one strong feature from being the root of every tree.
```
! Check that you connected decorrelation to the variance of the average.

--- recall
Q: What share of training rows is out-of-bag for a tree, for large n?
A: About e⁻¹ ≈ 36.8% (so about 63.2% distinct rows are in the bootstrap sample).
Q: What is the default max_features for RandomForestClassifier, and for the regressor?
A: "sqrt" (√d features per split); the regressor uses 1.0 (all features).
Q: How does a forest combine its trees for classification and for regression?
A: Classification: average predicted probabilities (a vote); regression: mean prediction.
Q: What does feature_importances_ measure and what is its main bias?
A: Mean decrease in impurity (Gini importance), computed on training data; biased toward high-cardinality features.
