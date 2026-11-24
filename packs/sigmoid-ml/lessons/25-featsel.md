=== featsel | craft | 9 | Feature selection: filters, p-values and LASSO | d-onehot
@@ About 30 min reading · Handbook chapter 18 · Homework 16
## Why this matters

More features are not always better. Irrelevant features add noise the model can overfit to, make distance-based models worse (in many dimensions all points look far apart), slow training (the handbook's complexity table: almost every algorithm's cost grows with the number of features d) and make the model harder to explain. Feature selection keeps the columns that carry information about the target. The handbook teaches four methods through Sigmoid's library kydavra; this lesson explains what each computes, adds the sklearn equivalents, and warns about the most common way selection inflates scores.

## Three families

- **Filter methods** score each feature on its own, against the target, before any model: correlation, point-biserial correlation, the ANOVA F-test, chi-squared, mutual information. Fast; blind to interactions between features.
- **Wrapper methods** train a model on different subsets and keep the best: backward elimination by p-value, recursive feature elimination (`RFE`), sequential selection (`SequentialFeatureSelector`). Better at capturing interactions; slower.
- **Embedded methods** select as part of training: LASSO sets weights to exactly zero; tree models provide importances (`SelectFromModel`).

Remember that selection works on columns as the model sees them: after one-hot encoding, a category becomes several columns, and dropping one of them changes the reference category rather than removing the feature. Selecting whole groups of dummies together is usually what you want.

## P-value feature selection (regression)

A linear regression fitted with statsmodels' `OLS` reports, for each coefficient, a **p-value** for the **null hypothesis** that the true coefficient is 0 (the feature has no linear effect once the other features are in the model).

The p-value is the probability, *assuming the null hypothesis is true*, of getting an estimate at least as far from 0 as the one observed. A small p-value (below the **significance level** α, usually 0.05) means the data would be surprising if the feature had no effect, so we keep it. A large p-value means the data are compatible with no effect; it does not prove the feature is useless, and it says nothing direct about production performance (the handbook's informal reading). p-values also depend on the other features in the model and on the sample size.

kydavra's `PValueSelector` performs **backward elimination**:

1. Fit OLS with all features.
2. Find the feature with the largest p-value.
3. If that p-value is below α, stop; otherwise remove the feature and go back to 1.

On sklearn's diabetes data (442 patients, 10 features, target = disease progression), backward elimination with α = 0.05 removes, in order: age (p = 0.867), s3 (0.639), s6 (0.304) and s4 (0.262). It keeps sex, bmi, bp, s1, s2 and s5, all with p < 0.05, while the adjusted R² stays at about 0.508. Four features dropped, no fit lost.

```
import statsmodels.api as sm
model = sm.OLS(y, sm.add_constant(X[cols])).fit()   # add_constant adds the intercept column
model.pvalues                                         # one p-value per coefficient
```

Notice that s2 had a large p-value early on and became significant once s4 was removed: s1, s2 and s4 are correlated blood measurements, and correlated features share and blur each other's evidence. Removing one at a time, rather than all large p-values at once, is why the algorithm loops.

## LASSO selection (regression)

LASSO is linear regression with an **L1 penalty**:

$$
cost = (1/n) Σ_i (y_i − ŷ_i)² + α Σ_j |w_j|
$$

The penalty α Σ|wⱼ| charges for the absolute size of every weight. Unlike the squared L2 penalty of Ridge, which shrinks weights toward 0 but rarely to exactly 0, the L1 penalty's constant pull drives weak features' weights **exactly to zero**. The larger α, the more weights reach zero. Features must be standardised first, or the penalty treats them unequally.

Standardised diabetes data with sklearn's `Lasso` (whose cost uses 1/(2n) in front of the squared errors, so its α values are on a different scale from the formula above):

| α | non-zero weights | kept features |
|---|---|---|
| 0.1 | 9 | all but s3 |
| 1 | 7 | sex, bmi, bp, s1, s3, s5, s6 |
| 5 | 5 | sex, bmi, bp, s3, s5 |
| 10 | 4 | bmi, bp, s3, s5 |
| 20 | 3 | bmi, bp, s5 |

bmi, bp and s5 survive the strongest penalty: they are the most informative. kydavra's `LassoSelector` searches α between `alpha_start` and `alpha_finish` for the lowest error and keeps features whose weight is not below 10^−power. In sklearn, `LassoCV` picks α by cross-validation (here α ≈ 0.079, keeping 9 features: the best-predicting α is often mild), and `SelectFromModel(Lasso(alpha=...))` turns any α into a selector.

## Correlation selection

**Pearson correlation** r = cov(x, y)/(σₓ σ_y) measures linear association, from −1 to +1. kydavra's `PearsonCorrelationSelector` keeps features whose absolute correlation with the target lies between `min_corr` (0.5) and `max_corr` (0.8): weak features are dropped, and suspiciously strong ones are dropped too, because a near-perfect correlation with the target often means a **leak** (a column computed from the target or recorded after it). With `erase_corr=True` it also drops features highly correlated with each other (multicollinearity: they carry the same information). On the diabetes data only bmi (0.586) and s5 (0.566) pass the 0.5 threshold, a much stricter cut than p-values or LASSO.

**Spearman** correlation is Pearson on ranks, capturing any monotonic relationship; **Kendall** counts concordant pairs. Both are more robust to outliers.

## Point-biserial correlation (binary classification)

When the target is 0/1 and the feature continuous, the **point-biserial correlation** is:

$$
r_pb = (M₁ − M₀) / s · √(n₁ n₀ / n²)
$$

M₁ and M₀ are the feature's means in class 1 and class 0, s the feature's standard deviation (dividing by n), n₁ and n₀ the class sizes and n the total. It equals the Pearson correlation computed with the 0/1 labels as numbers. The handbook writes M₀ − M₁, which only flips the sign; selectors use the absolute value.

Example: feature values 2, 3, 3, 4 in class 0 and 5, 6, 6, 7 in class 1. M₀ = 3, M₁ = 6, s ≈ 1.658, √(4·4/64) = 0.5, so r_pb = 3/1.658 × 0.5 ≈ 0.905: a strongly separating feature. kydavra's `PointBiserialCorrSelector` groups features into correlation bands of width 0.1 and keeps the top `last_level` bands, which makes it one of the strictest selectors.

## Selection without fooling yourself

If you choose features using all the data and then cross-validate, the selection has already seen the validation folds: with enough random features, some will correlate with the target by chance, and the score will be optimistic. Do selection inside the pipeline so it is refitted in every fold:

```
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score

pipe = make_pipeline(StandardScaler(), SelectKBest(f_classif, k=5), LogisticRegression(max_iter=1000))
cross_val_score(pipe, X_train, y_train, cv=5).mean()
```

kydavra's `select(df, "target")` takes a whole DataFrame; call it on the training part only, then keep the same columns for the test set.

For homework 16, report the test metric with all features and with each selector's subset, plus the number of features kept: a selector that keeps 4 of 13 features at the same accuracy is a real gain.

## Common mistakes

> **Reading a large p-value as "useless".** It means "no evidence of a linear effect given the other features".

> **Selecting on the full dataset.** Selection is part of training.

> **Keeping a feature with correlation 0.99 to the target.** Check it is not a leak.

## Summary

Filters score features one at a time (Pearson, Spearman, point-biserial, F-test, mutual information); wrappers search subsets with a model (p-value backward elimination, RFE); embedded methods select while training (LASSO, tree importances). Backward elimination removes the largest p-value until all are below α. LASSO's L1 penalty α Σ|w| sets weak weights exactly to zero; scale first. Point-biserial r = (M₁ − M₀)/s · √(n₁n₀/n²) equals Pearson with 0/1 labels. Always select inside the training data or pipeline.

--- practice
@choice
What does a p-value of 0.80 for a regression coefficient tell you?
- The feature explains 80% of the target
- There is an 80% chance the feature is useless
* If the true coefficient were 0, an estimate this far from 0 would be very common, so there is no evidence of an effect
- The feature must be kept
! The p-value is computed assuming the null hypothesis is true. It is not the probability that the null hypothesis is true.

@predict
Class 0 has feature values 2, 3, 3, 4 and class 1 has 5, 6, 6, 7. What is the point-biserial correlation, rounded to 3?
```python
x = [2, 3, 3, 4, 5, 6, 6, 7]
m = sum(x) / 8
s = (sum((v - m) ** 2 for v in x) / 8) ** 0.5
print(round((6 - 3) / s * (4 * 4 / 64) ** 0.5, 3))
```
= 0.905
! M₁ − M₀ = 3, s ≈ 1.658, √(n₁n₀/n²) = 0.5.

@choice
Why does LASSO produce exactly-zero weights while Ridge usually does not?
- LASSO uses a larger alpha
* The L1 penalty's pull on a weight does not weaken as the weight approaches 0, so weak weights are pushed all the way to 0
- Ridge does not use a penalty
- LASSO removes features with large p-values
! Ridge's squared penalty has a gradient 2αw that vanishes near 0, so weights shrink but rarely reach it; L1's gradient stays α·sign(w).

@choice
A feature has correlation 0.99 with the target. What should you do first?
- Keep only that feature
* Check whether it leaks the target (computed from it or recorded after it)
- Drop all other features
- Standardise it
! Real predictors are rarely that perfect. kydavra's max_corr default of 0.8 exists for this reason.

@run
Write `backward_eliminate(pvals_by_step, alpha)`: you get a function `pvals_by_step(cols)` that returns a dict of p-values for the given columns. Starting from all its columns (call it with `None` first to get them), repeatedly remove the column with the largest p-value while that p-value is ≥ alpha. Return `(kept_sorted, removed_in_order)`.
```starter
def backward_eliminate(pvals_by_step, alpha):
    pass
```
```test
table = {
    "age": 0.867, "sex": 0.001, "bmi": 0.0, "bp": 0.0, "s1": 0.06,
    "s2": 0.16, "s3": 0.639, "s4": 0.304, "s5": 0.0, "s6": 0.262}
def pv(cols):
    if cols is None:
        cols = list(table)
    out = {c: table[c] for c in cols}
    if "s4" not in cols and "s1" in out:
        out["s1"], out["s2"] = 0.001, 0.003
    return out
print(backward_eliminate(pv, 0.05))
print(backward_eliminate(pv, 0.5))
```
= (['bmi', 'bp', 's1', 's2', 's5', 'sex'], ['age', 's3', 's4', 's6'])
= (['bmi', 'bp', 's1', 's2', 's4', 's5', 's6', 'sex'], ['age', 's3'])
```solution
def backward_eliminate(pvals_by_step, alpha):
    cols = list(pvals_by_step(None))
    removed = []
    while cols:
        p = pvals_by_step(cols)
        worst = max(cols, key=lambda c: p[c])
        if p[worst] < alpha:
            break
        cols.remove(worst)
        removed.append(worst)
    return sorted(cols), removed
```
! The fake p-value table mimics the diabetes example: s1 and s2 only become significant once their correlated partner s4 has gone, which is why the algorithm refits after every removal instead of dropping all large p-values at once.

@choice
You pick the 10 features most correlated with the target on the whole dataset, then report 5-fold cross-validation accuracy. What is wrong?
- Nothing, correlation is a filter method
* The selection used the validation folds, so the score is optimistically biased
- Correlation cannot be used for classification
- You should use 10-fold CV
! Put the selector inside a Pipeline so it is refitted on the training folds only.

@write
From memory, describe backward elimination by p-values and LASSO selection, and give one advantage of each.
min: 60
```solution
Backward elimination fits an OLS regression with all features, finds the feature whose coefficient has the largest p-value, and removes it if that p-value is at least the significance level, usually 0.05; it refits and repeats until every remaining p-value is below the threshold. Its advantage is that it is easy to explain statistically and refitting after each removal handles correlated features fairly. LASSO adds the penalty alpha times the sum of absolute weights to the squared error, which drives the weights of weak features exactly to zero; features with zero weight are dropped. Its advantage is that selection happens in one model fit and alpha can be tuned by cross-validation for prediction quality.
```
! Check that you mentioned refitting after each removal and standardising before LASSO.

--- recall
Q: Name the three families of feature selection with one example each.
A: Filter (correlation, F-test), wrapper (backward elimination, RFE), embedded (LASSO, tree importances).
Q: Write the LASSO cost function.
A: (1/n) Σ(yᵢ − ŷᵢ)² + α Σ|wⱼ|.
Q: What is a p-value?
A: The probability, assuming the null hypothesis (no effect) is true, of a result at least as extreme as observed.
Q: Write the point-biserial correlation.
A: r = (M₁ − M₀)/s · √(n₁n₀/n²), the Pearson correlation with 0/1 labels.
