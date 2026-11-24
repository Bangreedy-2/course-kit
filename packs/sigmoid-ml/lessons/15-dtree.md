=== dtree | sup | 6 | Decision trees: splits, impurity and overfitting | d-gini
@@ About 30 min reading · Not a handbook chapter (the handbook goes straight to forests) · Homework 7
## Why this matters

A random forest, gradient boosting, XGBoost and LightGBM are all built from decision trees, so understanding one tree is the price of entry for most of the strongest models on tabular data. Homework 7 asks you to plot how seven tree hyperparameters change accuracy; those plots only make sense once you know how the tree chooses its splits and why an unrestricted tree memorises the training set. The handbook has no chapter on single trees, so this lesson fills that gap using sklearn's `DecisionTreeClassifier`.

## What a tree is

A decision tree is a flowchart of yes/no questions about the features. Each **internal node** asks one question of the form "is feature j ≤ threshold t?"; the answer sends the sample left (yes) or right (no). Each **leaf** (end node) holds a prediction: for classification, the majority class of the training samples that reached it (and the class shares, which `predict_proba` returns); for regression, their mean target value. The top node is the **root**; the number of questions on the longest root-to-leaf path is the **depth**.

```
|--- age <= 43.00
|   |--- class: 0
|--- age >  43.00
|   |--- class: 1
```

That is real output of `sklearn.tree.export_text` for a depth-1 tree (a **stump**). Read it as: patients aged 43 or younger are predicted healthy, older ones sick.

Trees need no feature scaling (a threshold works the same whatever the units), handle nonlinear patterns and interactions, and are easy to explain. Their weakness is variance: small changes in the data can produce a very different tree.

## How the tree chooses a split: impurity

Training is **greedy**: at each node the tree tries every feature and every candidate threshold, and keeps the split that makes the two children as **pure** as possible (each child dominated by one class). It never revisits earlier choices.

Purity is measured by an **impurity** function of the class shares p₁, …, p_K in a node (pₖ is the fraction of the node's samples in class k).

**Gini impurity** (sklearn's default, `criterion="gini"`):

$$
Gini = 1 − Σ_k p_k²
$$

It is the probability that two samples drawn at random from the node (with replacement) have different classes. A pure node has Gini 0; a 50/50 two-class node has 1 − (0.25 + 0.25) = 0.5, the two-class maximum.

**Entropy** (`criterion="entropy"` or `"log_loss"`), from information theory:

$$
Entropy = − Σ_k p_k · log₂(p_k)
$$

measured in bits: 0 for a pure node, 1 bit for a 50/50 two-class node. (Terms with pₖ = 0 count as 0.) Gini and entropy almost always choose the same splits; Gini is slightly faster because it has no logarithm.

A split's quality is the **weighted** impurity of the children, each weighted by its share of the samples:

$$
weighted impurity = (n_L / n) · I(left) + (n_R / n) · I(right)
$$

The decrease from the parent's impurity is called the **impurity decrease**; with entropy it is called **information gain**:

$$
gain = I(parent) − weighted impurity of the children
$$

## Worked example: finding the first split

Ten patients, one feature (age) and a label (1 = heart disease):

| age | 29 | 35 | 41 | 45 | 50 | 54 | 58 | 61 | 63 | 67 |
|---|---|---|---|---|---|---|---|---|---|---|
| disease | 0 | 0 | 0 | 1 | 0 | 1 | 1 | 1 | 0 | 1 |

**Root**: 5 sick out of 10, so Gini = 1 − (0.5² + 0.5²) = 0.5 and entropy = 1 bit.

**Candidate thresholds** are the midpoints between consecutive distinct sorted values: 32, 38, 43, 47.5, 52, 56, 59.5, 62, 65. Try t = 43:

- Left (age ≤ 43): 29, 35, 41, all healthy. Gini = 1 − 1² = 0.
- Right (age > 43): 7 patients, 5 sick, 2 healthy. Gini = 1 − ((5/7)² + (2/7)²) = 1 − 29/49 = 20/49 ≈ 0.4082.
- Weighted: (3/10)·0 + (7/10)·0.4082 ≈ 0.2857. Decrease: 0.5 − 0.2857 = 0.2143.

Compare t = 52: left 5 patients with 1 sick (Gini 0.32), right 5 with 4 sick (Gini 0.32), weighted 0.32. And t = 62 is useless: both sides stay at 50/50, weighted Gini 0.5, decrease 0. Over all nine thresholds, 43 gives the lowest weighted Gini (0.2857), and the information gain with entropy is also highest there (0.3958 bits). sklearn's stump picks exactly `age <= 43.00`. Your drill `d-gini` builds this search from scratch.

## Growing until pure, and why that is a problem

After the root, the same search runs recursively in each child, and by default sklearn keeps splitting until every leaf is pure or cannot be split. On our ten patients the unrestricted tree has depth 4, 6 leaves and **100% training accuracy**: it has drawn separate boxes around the healthy 50-year-old and the healthy 63-year-old. Those are not patterns; they are noise the tree memorised. This is **overfitting** (high variance): excellent on the training set, worse on new data.

Real numbers from the breast cancer dataset in sklearn (569 tumours, 30 features, `train_test_split(test_size=0.25, random_state=42, stratify=y)`):

| max_depth | train accuracy | test accuracy | leaves |
|---|---|---|---|
| 1 | 0.923 | 0.923 | 2 |
| 2 | 0.958 | 0.909 | 4 |
| 3 | 0.977 | 0.944 | 7 |
| 4 | 0.988 | 0.944 | 11 |
| 5 | 0.995 | 0.937 | 15 |
| None | 1.000 | 0.923 | 18 |

Training accuracy climbs to 1.0 as the tree deepens; test accuracy peaks around depth 3 to 4 and then falls. Notice too that depth 2 tests worse than depth 1 here: on 143 test rows one or two tumours change the third decimal, which is why homework plots of a single split are noisy and why week 7 introduces cross-validation.

## The hyperparameters in homework 7

All of these **pre-prune** the tree (stop it growing); each one trades variance for bias:

- `max_depth`: maximum depth. Smaller means simpler.
- `min_samples_split`: a node needs at least this many samples to be split (default 2).
- `min_samples_leaf`: every leaf must keep at least this many samples (default 1). On the breast cancer split above, 1 gives test accuracy 0.923, 10 gives 0.951, 50 gives 0.923 again: too small overfits, too large underfits.
- `min_weight_fraction_leaf`: the same as the previous one but as a fraction of the total sample weight (0 to 0.5).
- `max_features`: how many features to consider at each split (`None` = all, `"sqrt"`, `"log2"`, an int or a fraction). Fewer features means more randomness; it is the key ingredient of random forests.
- `max_leaf_nodes`: grow at most this many leaves, best-first.
- `min_impurity_decrease`: only split if the weighted impurity decrease is at least this value.
- `criterion`: `"gini"` or `"entropy"`.
- `ccp_alpha`: **post-pruning** (cost-complexity): grow fully, then cut back branches whose improvement is not worth their size.

For homework plots, keep `random_state` fixed: when features tie or `max_features` is below the total, sklearn breaks ties randomly.

Plotting the decision boundary with two features (homework 7 asks for the two most correlated with the target) shows the tree's characteristic look: axis-parallel rectangles, getting finer and more jagged as depth grows.

```
from sklearn.tree import DecisionTreeClassifier, plot_tree, export_text
from sklearn.inspection import DecisionBoundaryDisplay

tree = DecisionTreeClassifier(max_depth=3, random_state=42).fit(X_train[[f1, f2]], y_train)
DecisionBoundaryDisplay.from_estimator(tree, X_train[[f1, f2]], response_method="predict", alpha=0.4)
plt.scatter(X_train[f1], X_train[f2], c=y_train, edgecolor="k")
print(export_text(tree, feature_names=[f1, f2]))   # the "export its structure" part
```

## Regression trees

`DecisionTreeRegressor` works the same way, but impurity is the **mean squared error** of the node (its variance around the node mean), and each leaf predicts the mean target of its samples. A regression tree's prediction curve is therefore a staircase.

## Common mistakes

> **Judging a tree by training accuracy.** An unrestricted tree scores 1.0 on training data almost always. Always report test or cross-validated accuracy.

> **Scaling features for a tree.** Harmless, but pointless; thresholds are unaffected.

> **Reading too much into one tree's structure.** A slightly different sample can change the root split. Forests (next lesson) fix this.

## Summary

A tree asks threshold questions and predicts the majority class (or mean) in each leaf. It is grown greedily: at each node it picks the feature and threshold with the lowest weighted child impurity, using Gini 1 − Σp² or entropy −Σp log₂ p. Grown to purity it memorises the training set, so limit it with max_depth, min_samples_leaf, max_leaf_nodes, min_impurity_decrease or ccp_alpha, and judge it on test data.

--- practice
@predict
What is the Gini impurity of a node holding 6 healthy and 2 sick patients? Type a decimal.
```python
p = [6 / 8, 2 / 8]
print(1 - sum(x * x for x in p))
```
= 0.375
! 1 − (0.75² + 0.25²) = 1 − 0.625 = 0.375.

@predict
In the lesson's example, the split age ≤ 52 sends 5 patients left (1 sick) and 5 right (4 sick). What is the weighted Gini of this split? Type a decimal.
```python
gl = 1 - (0.2 ** 2 + 0.8 ** 2)
gr = 1 - (0.8 ** 2 + 0.2 ** 2)
print(round(0.5 * gl + 0.5 * gr, 4))
```
= 0.32
! Both children have Gini 0.32, and each holds half the samples. The split at 43 (0.2857) is better.

@choice
An unrestricted `DecisionTreeClassifier` scores 1.000 on the training set and 0.923 on the test set, while `max_depth=3` scores 0.977 and 0.944. What is happening?
- The depth-3 tree is underfitting
* The unrestricted tree is overfitting: it memorises noise in the training data
- The test set is too large
- Gini should be replaced by entropy
! Perfect training accuracy with lower test accuracy is the signature of high variance. Limiting depth trades a little training fit for better generalisation.

@choice
Which change makes a tree *simpler* (less likely to overfit)?
- Lower `min_samples_leaf` from 10 to 1
- Raise `max_depth` from 3 to 10
* Raise `min_samples_leaf` from 1 to 10
- Set `max_leaf_nodes=None`
! Requiring at least 10 samples per leaf forbids tiny leaves built around single noisy samples.

@run
Write `entropy(labels)` (base 2, rounded to 4) and `info_gain(parent, left, right)`, the parent's entropy minus the weighted entropy of the two children, rounded to 4. Use `math.log(p, 2)`.
```starter
import math

def entropy(labels):
    pass

def info_gain(parent, left, right):
    pass
```
```test
print(entropy([0, 0, 1, 1]), entropy([1, 1, 1]), entropy([0, 1, 1, 1]))
y = [0, 0, 0, 1, 0, 1, 1, 1, 0, 1]
print(info_gain(y, y[:3], y[3:]))
print(info_gain(y, y[:8], y[8:]))
```
= 1.0 0.0 0.8113
= 0.3958
= 0.0
```solution
import math

def entropy(labels):
    n = len(labels)
    h = 0.0
    for c in set(labels):
        p = labels.count(c) / n
        h -= p * math.log(p, 2)
    return round(h, 4)

def info_gain(parent, left, right):
    n = len(parent)
    w = len(left) / n * entropy(left) + len(right) / n * entropy(right)
    return round(entropy(parent) - w, 4)
```
! The second test is the age ≤ 43 split from the lesson; the third is age ≤ 62, which leaves both sides 50/50 and gains nothing. (If your pure node prints −0.0, start from `h = 0.0` and subtract, or wrap in `abs`.)

@choice
Why does a decision tree not need `StandardScaler`?
- sklearn scales the data automatically
* Each split compares one feature to a threshold, so rescaling a feature just rescales its threshold
- Trees only work with binary features
- Scaling would change the Gini impurity
! Monotonic transformations of a feature do not change which samples fall on each side of a split.

@write
From memory, explain how a decision tree picks the split at a node, and name two hyperparameters that stop it from overfitting and how each one does it.
min: 60
```solution
At a node the tree tries every feature and every candidate threshold (midpoints between sorted distinct values). For each split it computes the impurity of the two children, Gini 1 − Σp² or entropy −Σp log₂ p, and weights each by its share of samples. It keeps the split with the lowest weighted impurity, that is, the largest impurity decrease, and repeats recursively in each child. max_depth caps how many questions can be asked on any path, so the tree cannot carve out tiny regions. min_samples_leaf requires every leaf to keep a minimum number of samples, so a leaf cannot be built around one noisy example.
```
! Check you mentioned weighting by child size and that the search is greedy.

--- recall
Q: Write the Gini impurity and entropy formulas.
A: Gini = 1 − Σ pₖ²; entropy = −Σ pₖ log₂ pₖ.
Q: What is the Gini of a pure node and of a 50/50 two-class node?
A: 0 and 0.5 (entropy: 0 and 1 bit).
Q: What does information gain measure?
A: Parent impurity minus the size-weighted impurity of the children.
Q: Name four sklearn hyperparameters that pre-prune a tree.
A: max_depth, min_samples_split, min_samples_leaf, max_leaf_nodes (also min_impurity_decrease, min_weight_fraction_leaf; ccp_alpha post-prunes).
