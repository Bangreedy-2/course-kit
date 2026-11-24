=== interp | ship | 10 | Model interpretation: weights, permutation importance, LIME and SHAP | d-permimp
@@ About 30 min reading · Handbook chapter 20 · Homework 18
## Why this matters

A model with 99% accuracy can still be wrong for the wrong reasons: leaning on a leaked column, on an artefact of how data was collected, or on a feature that will not exist at prediction time. In medicine, credit and hiring you must also explain individual decisions. Interpretation answers two questions: **globally**, which features drive the model overall; **locally**, why this particular prediction came out as it did. Homework 18 asks for all of it: weight plots, a tree drawing, the evaluation tables, SHAP bar, waterfall, beeswarm and force plots, and LIME explanations of the worst regression errors.

## Interpretable by design

### Linear models

A linear model predicts ŷ = w₀ + w₁x₁ + … + w_d x_d, so each weight says how much the prediction changes when that feature rises by one unit, with the others held fixed. Two cautions the handbook's wine example skips:

- **Weights are only comparable when features are on the same scale.** The handbook finds "density" has the largest weight in its wine model; density varies only between about 0.99 and 1.00 g/cm³, so a one-unit change is enormous and the weight must be huge to matter at all. Standardise first; then each weight is the change per standard deviation. On standardised diabetes data, linear regression gives s5 34.5, bmi 28.9, s1 −26.5, bp 14.3 and s3 only −0.4.
- **Correlated features share and swap credit.** s1 (−26.5) and s2 (+12.4) are strongly correlated blood measurements pulling in opposite directions; individually their weights are unstable.

### Trees

A shallow tree is a readable set of rules, and features used near the root on many samples tend to matter most. Draw one with `sklearn.tree.plot_tree(model, feature_names=..., class_names=..., filled=True)` or `export_text`; `dtreeviz` makes richer drawings (its API changed in version 2: `dtreeviz.model(...).view()`, and it needs Graphviz installed for SVG output).

## Evaluation tables (a recap)

Homework 18 asks for the classification table (accuracy, precision, recall, F1) and the regression table (MSE, MAE, RMSE), which you met in weeks 3 and 4. Three corrections to the handbook's code:

- sklearn metrics take **`(y_true, y_pred)`** in that order. The handbook writes `recall_score(y_pred, y_test)`, which silently **swaps precision and recall**, since one is the other with the roles reversed. Accuracy, F1 and MSE do not care about the order; precision and recall do.
- `root_mean_square_error` does not exist. Use `root_mean_squared_error` (sklearn 1.4+) or `np.sqrt(mean_squared_error(y_test, y_pred))`.
- `plot_confusion_matrix` was removed in sklearn 1.2: use `ConfusionMatrixDisplay.from_estimator(model, X_test, y_test)`.

For a regression model, a predicted-versus-actual scatter with the line y = x shows at a glance where it over- and under-predicts.

## Permutation importance (global, any model)

Shuffle one feature's column in the test set, breaking its link with the target, and measure how much the score drops. A feature the model relies on causes a big drop; an ignored one, none.

$$
importance_j = score(original data) − score(data with column j shuffled)
$$

Repeat with several shuffles (`n_repeats`) and average. Unlike impurity-based importance (MDI, the forest lesson), it is computed on held-out data and is not biased toward high-cardinality features. To show this, add a column of random IDs (a permutation of 0 to 441) to the diabetes data and fit a 300-tree random forest:

| feature | MDI (training) | permutation importance (test R² drop) |
|---|---|---|
| bmi | 0.336 | 0.175 |
| s5 | 0.262 | 0.117 |
| bp | 0.080 | 0.025 |
| random ID | **0.061** (4th) | 0.009 |
| s4 | 0.025 | −0.011 |

MDI ranks pure noise fourth because its many distinct values offer many splits to overfit; permutation importance gives it almost nothing. Small negative values mean "no importance, plus noise". Correlated features are its weak spot: shuffle one and the model can still read the information from its twin, so both look less important. Your drill `d-permimp` implements it.

```
from sklearn.inspection import permutation_importance
r = permutation_importance(model, X_test, y_test, n_repeats=20, random_state=0)
r.importances_mean, r.importances_std
```

## LIME (local, any model)

**LIME** (local interpretable model-agnostic explanations) explains one prediction of a black-box model f by fitting a simple model g that imitates f **only near that point**:

1. Generate perturbed samples z around the instance x.
2. Ask the black box for its predictions f(z).
3. Weight each sample by its closeness to x with a kernel, π_x(z) = exp(−D(x, z)²/σ²).
4. Fit a sparse linear model g to (z, f(z)) with those weights.

Formally LIME minimises the weighted loss of g against f plus a complexity penalty Ω(g) (for a linear g, the number of non-zero weights). g's weights are the explanation: which features pushed this prediction up or down, near this point.

```
from lime.lime_tabular import LimeTabularExplainer
explainer = LimeTabularExplainer(X_train, feature_names=names, class_names=["no", "yes"],
                                 categorical_features=cat_idx, mode="classification")
exp = explainer.explain_instance(X_test[2], model.predict_proba, num_features=8)
exp.as_list()                     # [(feature condition, weight), ...]
exp.save_to_file("lime.html")
```

For a classifier use `mode="classification"` and pass `predict_proba`. The handbook's example uses `mode="regression"` with a classifier's `predict`, which explains hard 0/1 labels as if they were a continuous target. `categorical_features` takes column **indices**, not names. For homework 18's regression part, `mode="regression"` with `model.predict` is right.

LIME is fast and intuitive, but explanations depend on the random perturbations and the kernel width; run it twice and they can differ.

## SHAP (local and global, any model)

**SHAP** (SHapley additive explanations) borrows the **Shapley value** from cooperative game theory: the "players" are the features, the "payout" is the prediction, and each feature receives its average **marginal contribution** over all orders in which features could be added.

A two-feature example. Suppose a model's expected prediction with no features known is 40 (the average, the **base value**), with only "higher education" known it is 50, with only "family" known 45, and with both 60. Education's contribution is 50 − 40 = 10 if it comes first and 60 − 45 = 15 if it comes second; its Shapley value is the average, **12.5**. Family's: (45 − 40 + 60 − 50)/2 = **7.5**. They add up to 20 = 60 − 40.

That is SHAP's key property, **additivity**: for every prediction,

$$
prediction = base value + Σ_j SHAP_j
$$

In general, a marginal contribution that adds feature j to a coalition, making it size s out of F features, gets weight 1/(s · C(F, s)), where C(F, s) is the number of coalitions of size s. With F = 3: 1/3 for s = 1, 1/6 for each of the two s = 2 edges, 1/3 for s = 3, as the handbook's power-set diagram shows. (Its expanded formula writes C(2, 1) in the first term; it should be C(3, 1).) Exact computation needs all 2^F coalitions, so the `shap` library approximates, except for trees, where `TreeExplainer` computes exact values quickly.

```
import shap
explainer = shap.Explainer(model, X_train)       # picks TreeExplainer for tree models
sv = explainer(X_test)
shap.plots.bar(sv)            # global: mean |SHAP| per feature
shap.plots.beeswarm(sv)       # global: every sample's SHAP per feature, coloured by feature value
shap.plots.waterfall(sv[0])   # local: how one prediction is built from the base value
shap.plots.force(sv[0])       # local: the same as a horizontal force diagram
```

Read a beeswarm row by colour: red (high feature values) on the right means high values push predictions up. To save a plot with `plt.savefig`, pass `show=False`; force plots need `matplotlib=True` to be saved. For classifiers, SHAP values may be in log-odds or per class; check which output you are explaining.

## Common mistakes

> **Comparing raw linear weights across features with different units.** Standardise first.

> **Passing (y_pred, y_true) to precision or recall.** The arguments are (y_true, y_pred).

> **Treating importance as causation.** A feature can be important because it correlates with the real cause, or because it leaks the target.

## Summary

Linear weights explain a model once features are standardised; shallow trees are readable rules. Permutation importance (score drop when a column is shuffled, on test data) is model-agnostic and not biased toward high-cardinality features, unlike MDI. LIME fits a weighted sparse linear model around one instance. SHAP gives each feature its average marginal contribution (Shapley value); the values add up from the base value to the prediction, and aggregate into global plots (bar, beeswarm). sklearn metrics take (y_true, y_pred).

--- practice
@predict
A model's R² on the test set is 0.62. With column "bmi" shuffled it falls to 0.41. What is bmi's permutation importance? Type a decimal.
```python
print(round(0.62 - 0.41, 2))
```
= 0.21
! The drop in score when the feature's link to the target is broken.

@choice
Why does random forest's impurity-based importance rank a column of random IDs fourth, while permutation importance gives it about zero?
- Permutation importance ignores numeric columns
* MDI is computed on training data and rewards features with many distinct values that the trees can overfit; permutation importance is measured on test data
- The IDs really are predictive
- MDI uses the test set
! Many distinct values mean many candidate thresholds; trees use them to memorise training noise, which earns MDI credit but does not help on new data.

@predict
With no features known a model predicts 40; with only A known 50; with only B known 45; with both 60. What is A's Shapley value?
```python
print(((50 - 40) + (60 - 45)) / 2)
```
= 12.5
! Average of A's marginal contribution when it is added first (10) and second (15). B's is 7.5, and 40 + 12.5 + 7.5 = 60.

@choice
`precision_score(y_pred, y_test)` is called instead of `precision_score(y_test, y_pred)`. What does it return?
- The same precision
* The recall, because swapping truth and prediction swaps the roles of false positives and false negatives
- An error
- The F1-score
! TP stays TP, but FP and FN trade places. Always pass y_true first.

@run
Write `shapley_two(v0, va, vb, vab)` returning the Shapley values (a, b), and `edge_weight(s, F)` returning 1/(s·C(F, s)) rounded to 4, where C is the binomial coefficient (compute it without imports).
```starter
def shapley_two(v0, va, vb, vab):
    pass

def edge_weight(s, F):
    pass
```
```test
print(shapley_two(40, 50, 45, 60))
print(shapley_two(10, 10, 30, 30))
print(edge_weight(1, 3), edge_weight(2, 3), edge_weight(3, 3))
print(edge_weight(2, 4))
```
= (12.5, 7.5)
= (0.0, 20.0)
= 0.3333 0.1667 0.3333
= 0.0833
```solution
def shapley_two(v0, va, vb, vab):
    a = ((va - v0) + (vab - vb)) / 2
    b = ((vb - v0) + (vab - va)) / 2
    return a, b

def comb(n, k):
    r = 1
    for i in range(k):
        r = r * (n - i) // (i + 1)
    return r

def edge_weight(s, F):
    return round(1 / (s * comb(F, s)), 4)
```
! The second test: knowing A never changes the prediction, so A gets 0 and B gets the whole difference of 20. With F = 4 and s = 2 there are 6 coalitions of size 2, so 1/(2·6) = 1/12.

@choice
You want to explain why a gradient-boosted model refused one specific loan. Which tool fits best?
- The forest's feature_importances_
- Permutation importance on the test set
* A local explanation: a SHAP waterfall plot (or LIME) for that applicant
- The confusion matrix
! Global importances describe the model on average; a waterfall shows how this one prediction was built from the base value.

@write
From memory, explain how permutation importance and SHAP each assign importance to features, and one limitation of each.
min: 60
```solution
Permutation importance shuffles one feature's column in held-out data, which breaks its relationship with the target, and measures how much the model's score drops; it repeats this several times and averages. A big drop means the model relies on the feature. Its limitation is that correlated features hide each other: shuffling one leaves its twin, so both look unimportant. SHAP gives each feature its Shapley value for a single prediction: the weighted average of its marginal contributions when it is added to every possible coalition of other features. The values add up from the base value to the prediction, and averaging their absolute values gives a global ranking. Its limitation is cost: exact values need 2^F coalitions, so most models need approximations, except trees.
```
! Check that you mentioned held-out data for permutation importance and additivity for SHAP.

--- recall
Q: How is permutation importance computed?
A: Score on held-out data minus the score after shuffling that feature's column, averaged over repeats.
Q: State SHAP's additivity property.
A: prediction = base value (average prediction) + sum of the features' SHAP values.
Q: What does LIME fit, and where?
A: A sparse linear model to the black box's predictions on perturbed samples, weighted by closeness to the instance being explained.
Q: In what order do sklearn metric functions take their arguments?
A: (y_true, y_pred).
