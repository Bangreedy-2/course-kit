=== outliers | craft | 9 | Outliers: detecting and deciding what to do | d-iqr
@@ About 30 min reading · Handbook chapter 16 · Homework 14
## Why this matters

An **outlier** is an observation that differs markedly from the rest: a 45-year-old in a list of teenagers' ages, a house priced at 100 times the median, a sensor reading of −999. Some are errors, some are rare but real, and some are exactly what you are looking for (fraud, faults). They matter because many models and statistics are sensitive to them: one extreme value moves a mean, a variance, a linear regression line and a k-means centroid. Homework 14 has you run four sklearn detectors on the same data, compare which points each flags, and measure how removing them changes a regression. This lesson explains how each detector thinks, so the differences make sense.

## First: what kind of outlier?

Before removing anything, ask where the value came from.

- **Errors** (typos, unit mix-ups, placeholder codes such as 999, broken sensors): fix them if you can, otherwise treat them as missing.
- **Rare but genuine** values (a billionaire's income): they belong to the population. Removing them makes the model wrong for such cases; robust methods or transformations (log, Box-Cox next lesson) are often better than deletion.
- **The signal itself** (fraud, intrusion, machine failure): this is **anomaly detection**, and the outliers are what you want to find, not remove.

Also distinguish **training-time cleaning** (remove outliers from the training set so they do not distort the fit) from **prediction time** (new data may still contain them, as the handbook's conclusion warns). Only ever decide on removal using the training data, never the test set.

## Univariate rules

### z-score

z = (x − mean)/std counts how many standard deviations a value is from the mean; |z| > 3 is a common cut-off. It has a weakness called **masking**: the outlier inflates the mean and the standard deviation that are supposed to expose it. For the ages 12, 13, 14, 15, 15, 16, 17, 18, 19, 45: the mean is 18.4, the standard deviation (dividing by n) 9.10, and the 45 has z = 2.92, below 3. The rule misses the obvious outlier.

### The box-plot (IQR) rule

Robust statistics are barely affected by extreme values. The **interquartile range** IQR = Q3 − Q1 measures the spread of the middle half of the data, and the box-plot rule (Tukey's fences) flags values outside:

$$
[Q1 − 1.5 · IQR,  Q3 + 1.5 · IQR]
$$

For the same ages, numpy's default percentiles give Q1 = 14.25 and Q3 = 17.75, so IQR = 3.5 and the fences are 9.0 and 23.0. The 45 is flagged; the others are not. This is the "dots beyond the whiskers" in a box plot, the handbook's last method, and your drill `d-iqr`. Using 3 instead of 1.5 flags only "far out" values.

Univariate rules check one column at a time. A 2-metre-tall person and a 40-kilogram person are each plausible; a 2-metre person weighing 40 kg is an outlier only in the combination. That is what the multivariate detectors are for.

## The four sklearn detectors

All four follow the same interface: `fit_predict(X)` returns **+1 for inliers and −1 for outliers**; `decision_function` or `score_samples` gives a continuous score (lower means more abnormal). Their `contamination` (or `nu`) parameter is your guess of the outlier share, and it directly sets how many points get flagged.

### Isolation Forest

Build many random trees: each split picks a random feature and a random threshold between that feature's min and max. Keep splitting until every point is alone. An outlier, being few and different, gets **isolated in few splits** (a short path from the root); a normal point in a dense region needs many. The anomaly score comes from the average path length over the trees. It is fast, works in high dimensions and needs no scaling. Default `contamination="auto"`.

### Elliptic Envelope

Assume the inliers come from one multivariate normal distribution. Fit its mean and covariance **robustly** (the Minimum Covariance Determinant estimator, which ignores the most extreme points while fitting), then flag points with a large Mahalanobis distance, that is, outside the fitted ellipse. Good for roughly Gaussian, single-cluster data; poor for several clusters or curved shapes. Default `contamination=0.1`.

### Local Outlier Factor

Compare each point's local density with that of its k nearest neighbours (`n_neighbors=20` by default). A point in a sparse spot surrounded by dense neighbours has a **LOF** well above 1 and is an outlier; points in uniformly dense or uniformly sparse regions have LOF around 1. Because it is local, it finds outliers next to dense clusters that a global rule misses. sklearn stores the negated value in `negative_outlier_factor_`, so there **lower** means more outlying. It uses distances, so scale first; and as the handbook notes, distances become less informative as the number of features grows (the curse of dimensionality).

### One-Class SVM

Learn a boundary that encloses most of the data in kernel space (RBF by default), treating everything outside as an outlier. `nu` is an upper bound on the share of training points outside the boundary, and **its default is 0.5**, not 0.1 as the handbook says: with defaults, One-Class SVM flags about half of your data. Always set `nu` (and scale features, as for any SVM).

### On the same data

205 points: 200 drawn from a standard 2-D normal, plus 5 planted far away ((6, 6), (−5, 5), (7, −6), (0, 8), (5, 0)). With `contamination=0.05` (or `nu=0.05`):

| detector | points flagged | planted points caught |
|---|---|---|
| IsolationForest | 11 | 5 of 5 |
| EllipticEnvelope | 11 | 5 of 5 |
| LocalOutlierFactor | 11 | 5 of 5 |
| OneClassSVM (gamma="auto") | 16 | 3 of 5 |

With their defaults the counts change completely: IsolationForest flags 21, EllipticEnvelope 21 and One-Class SVM 102. The contamination setting decides how many; the method decides which. That is why homework 14 asks you to plot the number of outliers against contamination.

## Removing flagged rows correctly

The handbook's pattern `df["outlier"] = pd.Series(model.fit_predict(df.values))` has a trap: a new Series gets the index 0, 1, 2, …, and assigning it to a DataFrame aligns by index. If `df` was filtered or shuffled earlier, rows get the wrong labels (or NaN). Assign the array directly:

```
from sklearn.ensemble import IsolationForest

iso = IsolationForest(contamination=0.02, random_state=0)
mask = iso.fit_predict(X_train) == 1          # True for inliers
X_train_clean, y_train_clean = X_train[mask], y_train[mask]
print((~mask).sum(), "rows removed")
```

Then compare the model trained on all rows and on clean rows **on the same untouched test set**, which is exactly homework 14's last part. Expect linear regression to change more than a tree or KNN: squared error lets single far points pull the line.

### Alternatives to deletion

- **Capping** (winsorising): clip values to the fences or to the 1st/99th percentiles (`s.clip(lower, upper)`).
- **Transforming**: a log or Box-Cox transform shrinks long tails.
- **Robust models and losses**: `HuberRegressor`, median-based statistics, trees (which split on order, not distance).
- **RobustScaler**: scales with the median and IQR instead of mean and standard deviation.

## Common mistakes

> **Deleting outliers from the test set.** It makes the reported score optimistic.

> **Leaving One-Class SVM's nu at 0.5.** Half the data disappears.

> **Trusting z > 3 on small samples.** The outlier masks itself; use the IQR rule or robust z-scores.

## Summary

Decide first whether an outlier is an error, a rare real value or the target of interest. The z-score rule suffers from masking; the IQR rule flags values beyond Q1 − 1.5·IQR and Q3 + 1.5·IQR. Isolation Forest isolates anomalies in few random splits; Elliptic Envelope fits a robust Gaussian ellipse; Local Outlier Factor compares local density with neighbours; One-Class SVM learns a boundary around the data (set nu; the default is 0.5). All return −1 for outliers. contamination decides how many points are flagged. Clean only the training set, and compare models on the same test set.

--- practice
@predict
For the ages 12, 13, 14, 15, 15, 16, 17, 18, 19, 45, what are the IQR fences (Q1 − 1.5·IQR, Q3 + 1.5·IQR), using numpy's default percentiles? Type them separated by a space.
```python
import numpy as np
q1, q3 = np.percentile([12, 13, 14, 15, 15, 16, 17, 18, 19, 45], [25, 75])
iqr = q3 - q1
print(q1 - 1.5 * iqr, q3 + 1.5 * iqr)
```
= 9.0 23.0
! Q1 = 14.25, Q3 = 17.75, IQR = 3.5. The 45 is outside; its z-score is only 2.92 because it inflates the standard deviation (masking).

@choice
What does `fit_predict` of sklearn's outlier detectors return?
- 0 for inliers and 1 for outliers
* +1 for inliers and −1 for outliers
- The anomaly score of each point
- The indices of the outliers
! Keep the rows where the result equals 1.

@choice
How does Isolation Forest decide that a point is an outlier?
- It is far from the mean in standard deviations
* Random splits isolate it after only a few cuts, so its average path length is short
- Its local density is lower than its neighbours'
- It lies outside a fitted ellipse
! Few, different points are separated quickly by random thresholds; points in dense regions need many cuts.

@choice
You run `OneClassSVM(gamma="auto").fit_predict(X)` on 205 points and 102 are flagged. Why?
- The data has 102 outliers
* nu defaults to 0.5, allowing up to about half the points outside the boundary
- gamma="auto" removes half the data
- One-Class SVM always flags half
! Set nu to your expected outlier share, for example 0.05.

@run
Write `zscores(xs)` returning the list of z-scores rounded to 2 (population standard deviation), and `fences(xs, k)` returning `(lower, upper)` = (Q1 − k·IQR, Q3 + k·IQR) rounded to 3, with numpy-style linear interpolation for the quartiles. Then `flag(xs, k)` returning the sorted values outside the fences.
```starter
def zscores(xs):
    pass

def fences(xs, k):
    pass

def flag(xs, k):
    pass
```
```test
ages = [12, 13, 14, 15, 15, 16, 17, 18, 19, 45]
print(max(zscores(ages)))
print(fences(ages, 1.5), fences(ages, 3))
print(flag(ages, 1.5), flag([10, 12, 11, 13, 12, 95, 11, 14, -20, 12], 1.5))
```
= 2.92
= (9.0, 23.0) (3.75, 28.25)
= [45] [-20, 95]
```solution
def zscores(xs):
    n = len(xs)
    m = sum(xs) / n
    sd = (sum((x - m) ** 2 for x in xs) / n) ** 0.5
    return [round((x - m) / sd, 2) for x in xs]

def _pct(s, p):
    pos = p * (len(s) - 1)
    lo = int(pos)
    if lo + 1 >= len(s):
        return s[lo]
    return s[lo] + (pos - lo) * (s[lo + 1] - s[lo])

def fences(xs, k):
    s = sorted(xs)
    q1, q3 = _pct(s, 0.25), _pct(s, 0.75)
    iqr = q3 - q1
    return round(q1 - k * iqr, 3), round(q3 + k * iqr, 3)

def flag(xs, k):
    lo, hi = fences(xs, k)
    return sorted(x for x in xs if x < lo or x > hi)
```
! The z-score of 45 stays under 3, while the IQR rule flags it. With k = 3 the fences widen to 3.75 and 28.25, and 45 is still out.

@choice
After removing outliers with Isolation Forest, how should you compare the models trained with and without them?
- Remove outliers from the test set too, then compare
* Evaluate both models on the same untouched test set
- Compare training scores
- Compare the number of removed rows
! Cleaning the test set changes the question being answered and inflates scores.

@write
From memory, explain the masking problem of the z-score rule and why the IQR rule avoids it; then describe one situation where you should not remove outliers.
min: 60
```solution
The z-score uses the mean and standard deviation, but an extreme value pulls the mean toward itself and inflates the standard deviation, so its own z-score shrinks and it can fall under the cut-off of 3: the outlier hides itself. The IQR rule uses the first and third quartiles, which depend on the middle of the data and barely move when one extreme value is added, so the fences stay where the bulk of the data is. You should not remove outliers when they are genuine and the model must handle such cases, or when they are the thing you are looking for, as in fraud detection, where the rare cases are the target.
```
! Check that you explained why quartiles are robust.

--- recall
Q: Write the box-plot (IQR) outlier rule.
A: Outlier if x < Q1 − 1.5·IQR or x > Q3 + 1.5·IQR, with IQR = Q3 − Q1.
Q: What does each detector's fit_predict return for an outlier?
A: −1 (inliers are +1).
Q: One line each: Isolation Forest, Elliptic Envelope, LOF, One-Class SVM.
A: Few random splits isolate it; outside a robust Gaussian ellipse; lower density than its neighbours; outside a kernel boundary around the data (set nu).
Q: Why can a z-score miss an outlier?
A: Masking: the outlier inflates the mean and standard deviation used to judge it.
