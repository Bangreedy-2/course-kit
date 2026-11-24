=== balance | craft | 9 | Imbalanced classes: weights, resampling and SMOTE | d-smote
@@ About 30 min reading · Handbook chapter 19 · Homework 17
## Why this matters

In most real classification problems the interesting class is rare: churners among telecom clients, frauds among payments, legendary Pokémon among all Pokémon (8% in the handbook's example). A model can then score high accuracy by ignoring the rare class altogether, which is useless. This lesson shows how to recognise the problem, how to measure it properly, and the main fixes: class weights, undersampling, oversampling, SMOTE and its relatives from Sigmoid's crucio library, plus the rule that keeps all of them honest.

## How imbalance fools accuracy

A synthetic dataset built with `make_classification(n_samples=4000, weights=[0.95], ...)` has 3,774 negatives and 226 positives (5.7%). On a stratified test set of 1,000 rows (944 negatives, 56 positives), a plain `LogisticRegression` scores:

- accuracy **0.940**, below the 0.944 you get by predicting "negative" for everyone;
- recall for the positive class **0.0**: it did not find a single positive. It predicted only 4 positives, all wrong.

Training minimises average loss, and with 94% negatives the cheapest way to look good is to lean toward "negative" everywhere. The confusion matrix shows it at a glance: the bottom row (true positives on the right, false negatives on the left) is almost all false negatives.

So for imbalanced problems, report **precision, recall and F1 for the rare class**, the confusion matrix, **balanced accuracy** (mean of per-class recall) and, for scores, **average precision** (area under the precision-recall curve), which unlike ROC-AUC is sensitive to how rare the positives are. Always compare with the majority-class baseline. Use a **stratified** split so the test set keeps the real class ratio.

## Fix 1: class weights

Most sklearn classifiers accept `class_weight`. Each training example's loss is multiplied by its class weight, so errors on the rare class cost more. `class_weight="balanced"` sets:

$$
w_c = n / (k · n_c)
$$

where n is the number of training rows, k the number of classes and n_c the number of rows in class c. With 920 negatives and 80 positives: w₀ = 1000/(2 × 920) ≈ 0.543 and w₁ = 1000/(2 × 80) = 6.25, so the two classes contribute equally to the total loss. It is supported by LogisticRegression, SVC, LinearSVC, DecisionTreeClassifier, RandomForestClassifier and others (the handbook lists the first three it mentions; there are more). No data is created or removed, which makes it the simplest first fix.

## Fix 2: resampling

- **Random undersampling**: keep all minority rows and a random subset of the majority, down to equal size. Fast; throws information away, which hurts when data is small.
- **Random oversampling**: duplicate random minority rows until the classes are equal. Keeps all data; exact duplicates encourage overfitting to those points.
- **SMOTE** (synthetic minority oversampling technique): create **new** minority points between existing ones.

### How SMOTE makes a point

1. Pick a minority sample xᵢ.
2. Find its k nearest neighbours **among the minority class** (k = 5 by default).
3. Pick one of them, x_j, at random.
4. Create x_new = xᵢ + λ · (x_j − xᵢ), with λ a random number between 0 and 1 (the "gap").

The new point lies on the line segment between two real minority points. Repeat until the classes are balanced (M − m new points, where M and m are the majority and minority counts). Example: xᵢ = (1, 1), x_j = (2, 2), λ = 0.25 gives (1.25, 1.25). Your drill `d-smote` computes the neighbours, a synthetic point and the balanced class weights.

SMOTE needs numeric features (interpolating "red" and "blue" is meaningless; imbalanced-learn has `SMOTENC` for mixed data, and crucio's `binary_columns` rounds 0/1 columns) and scaled features, since it uses distances.

### SMOTEENN

A minority point sitting inside majority territory (noise or an outlier) makes SMOTE generate more points in the wrong place. **ENN** (edited nearest neighbours) cleans the data: it removes samples whose class disagrees with the majority of their k nearest neighbours. **SMOTEENN** combines the two. (In imbalanced-learn's version SMOTE runs first and ENN then cleans both classes; the handbook describes crucio's version as cleaning first.) Expect fewer, cleaner points near the class boundary.

### Other crucio methods

- **ICOTE** (immune centroids oversampling) treats minority points as immune cells: it clones them and mutates the clones away from nearby majority points.
- **TKRKNN** (top-k reversed KNN) changes only some features of a minority sample toward a neighbour, so new points are not limited to straight segments.

All crucio balancers share `balanced_df = balancer.balance(df, "target")`.

## The rule: balance only the training data

Resampling changes the data distribution. If you balance before splitting, synthetic points built from test rows' neighbours leak into training, and the test set no longer reflects reality (it would be 50/50 instead of 5/95). The handbook's own snippet splits into `train_df` and `test_df` and then calls `smote.balance(df, "Legendary")` on the full `df`; balance `train_df` only. Its reported 100% accuracy after SMOTE on the Pokémon data should be read with that in mind.

The clean way in code is imbalanced-learn's pipeline, which applies samplers during `fit` only and never during `predict`, so cross-validation stays honest:

```
from imblearn.pipeline import make_pipeline        # not sklearn's: it supports samplers
from imblearn.over_sampling import SMOTE
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

model = make_pipeline(StandardScaler(), SMOTE(random_state=0), LogisticRegression(max_iter=1000))
model.fit(X_train, y_train)
```

## What the fixes actually do

Same data, same test set, logistic regression with each fix:

| method | accuracy | precision | recall | F1 | average precision |
|---|---|---|---|---|---|
| none | 0.940 | 0.000 | 0.000 | 0.000 | 0.183 |
| class_weight="balanced" | 0.706 | 0.130 | 0.750 | 0.222 | 0.192 |
| random undersampling | 0.713 | 0.124 | 0.679 | 0.209 | 0.192 |
| random oversampling | 0.704 | 0.127 | 0.732 | 0.217 | 0.193 |
| SMOTE | 0.711 | 0.132 | 0.750 | 0.225 | 0.195 |
| SMOTEENN | 0.671 | 0.118 | 0.750 | 0.203 | 0.193 |

Three lessons. Every fix raises recall from 0 to about 0.7 at the cost of accuracy and precision: it trades false negatives for false positives. The fixes perform similarly to one another. And **average precision barely moves** (0.183 to 0.195): the model's ranking of cases is about the same; what changes is mainly where the decision threshold falls.

That suggests the simplest alternative: keep the plain model and **lower the threshold**. Predicting positive when the probability is at least 0.2 instead of 0.5 gives precision 0.297, recall 0.339, F1 0.317 for the plain model; at 0.07, recall 0.643 with precision 0.140. Choose the threshold from the costs of each error type (a missed churner versus a wasted discount), using validation data, not the test set.

## Common mistakes

> **Reporting accuracy on imbalanced data.** Report recall, precision, F1 and the confusion matrix.

> **Balancing before the split, or balancing the test set.** Balance only the training folds.

> **Expecting resampling to add information.** It reweights or reshapes what you have; better features add information.

## Summary

On imbalanced data accuracy rewards ignoring the rare class; use per-class precision, recall, F1, balanced accuracy and average precision with a stratified split. Fixes: class_weight="balanced" (w_c = n/(k·n_c)), random under- or oversampling, SMOTE (x_new = xᵢ + λ(x_j − xᵢ) between minority neighbours) and SMOTEENN (SMOTE plus ENN cleaning). Apply them only to training data, ideally in an imbalanced-learn pipeline. They mostly shift the precision-recall trade-off, much like moving the decision threshold.

--- practice
@predict
A test set has 944 negatives and 56 positives. What accuracy does a model get by predicting "negative" for every row? Round to 3.
```python
print(round(944 / 1000, 3))
```
= 0.944
! The majority-class baseline. A model must beat it, and on the rare class's recall, to be useful.

@predict
With `class_weight="balanced"`, a training set of 900 negatives and 100 positives gets which weight for the positive class? Type a decimal.
```python
print(1000 / (2 * 100))
```
= 5.0
! n/(k·n_c) = 1000/200. The negatives get 1000/1800 ≈ 0.556.

@choice
When should SMOTE be applied?
- To the whole dataset before splitting
- To the training and test sets separately
* To the training data only (inside the pipeline, per cross-validation fold)
- To the test set only
! The test set must keep the real class ratio and contain no synthetic points built from training neighbours.

@choice
SMOTE creates a new point by:
- Copying a random minority row
- Averaging all minority rows
* Interpolating between a minority sample and one of its k nearest minority neighbours at a random fraction λ
- Adding Gaussian noise to majority rows
! x_new = xᵢ + λ(x_j − xᵢ), with λ between 0 and 1.

@run
Write `smote_point(xi, xj, lam)` returning the synthetic point rounded to 3, `balanced_weights(y)` returning a dict class → n/(k·n_c) rounded to 3, and `rare_metrics(y_true, y_pred)` returning (accuracy, precision, recall) for class 1, rounded to 3 (precision 0 when nothing is predicted positive).
```starter
def smote_point(xi, xj, lam):
    pass

def balanced_weights(y):
    pass

def rare_metrics(y_true, y_pred):
    pass
```
```test
print(smote_point([1, 1], [2, 2], 0.25), smote_point([0, 4, 2], [2, 0, 2], 0.5))
w = balanced_weights([0] * 920 + [1] * 80)
print(w[0], w[1])
yt = [0] * 18 + [1, 1]
print(rare_metrics(yt, [0] * 20))
print(rare_metrics(yt, [0] * 15 + [1, 1, 1, 1, 0]))
```
= [1.25, 1.25] [1.0, 2.0, 2.0]
= 0.543 6.25
= (0.9, 0, 0.0)
= (0.8, 0.25, 0.5)
```solution
def smote_point(xi, xj, lam):
    return [round(a + lam * (b - a), 3) for a, b in zip(xi, xj)]

def balanced_weights(y):
    n, classes = len(y), sorted(set(y))
    return {c: round(n / (len(classes) * y.count(c)), 3) for c in classes}

def rare_metrics(y_true, y_pred):
    tp = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 1)
    fp = sum(1 for t, p in zip(y_true, y_pred) if t == 0 and p == 1)
    fn = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 0)
    acc = sum(1 for t, p in zip(y_true, y_pred) if t == p) / len(y_true)
    prec = round(tp / (tp + fp), 3) if tp + fp else 0
    return round(acc, 3), prec, round(tp / (tp + fn), 3)
```
! The all-negative model has 0.9 accuracy and finds nothing. The second model has lower accuracy (0.8) but finds one of the two positives, with three false alarms (precision 0.25).

@choice
After balancing, recall rose from 0 to 0.75 while average precision went from 0.183 to 0.195. What does this suggest?
* Balancing mainly moved the decision threshold; the model's ranking of cases barely changed
- The balanced model is four times better in every way
- Average precision is the wrong metric
- SMOTE added new information to the data
! Threshold-independent metrics changed little. Lowering the plain model's threshold gives a similar trade-off.

@write
From memory, explain why a classifier trained on 95/5 data may never predict the rare class, and compare class weights with SMOTE as fixes, including where each is applied.
min: 60
```solution
Training minimises the average loss over all examples, and with 95% negatives the model can reach low loss and 95% accuracy by pushing every prediction toward negative, so at the 0.5 threshold it may never predict the rare class. Class weights multiply the loss of each example by a weight for its class, for example n/(k·n_c), so errors on rare examples cost more; no data changes, and it is set on the model. SMOTE creates synthetic minority examples by interpolating between a minority point and one of its nearest minority neighbours until the classes are balanced; it changes the training data, so it must be applied only to the training set, inside the pipeline, never to the test set. Both mainly trade precision for recall.
```
! Check you said where each fix is applied.

--- recall
Q: Write sklearn's "balanced" class weight.
A: w_c = n/(k·n_c): total rows divided by (number of classes × rows in class c).
Q: How does SMOTE generate a sample?
A: x_new = xᵢ + λ(x_j − xᵢ), with x_j one of xᵢ's k nearest minority neighbours and λ random in (0, 1).
Q: Which metrics should you report on imbalanced data?
A: Precision, recall, F1 for the rare class, confusion matrix, balanced accuracy, average precision; compare with the majority baseline.
Q: What does ENN do in SMOTEENN?
A: Removes samples whose class disagrees with most of their k nearest neighbours, cleaning noise near the boundary.
