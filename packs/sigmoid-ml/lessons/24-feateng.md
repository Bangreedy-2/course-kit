=== feateng | craft | 9 | Feature engineering: scaling, encoding and transforming | d-scale
@@ About 30 min reading · Handbook chapter 17 · Homework 15
## Why this matters

Models only see numbers, and *how* a feature is turned into numbers often matters more than which model you pick. Distance-based models (KNN, SVM, k-means) and gradient descent need features on comparable scales; linear models need categories encoded so they do not invent a false order; skewed features can hide a simple relationship. The handbook covers the classical tools (scaling, dummy variables) and Sigmoid's own library, imperio (Box-Cox, ZCA, frequency and target encoding). This lesson explains each, with the sklearn equivalents, and how to apply them without leaking information.

## The transformer interface

Every sklearn transformer (and every imperio transformer) has the same three methods:

- `fit(X, y=None)`: learn what the transformation needs from the data (means, minimums, categories) and store it.
- `transform(X)`: apply the stored transformation.
- `fit_transform(X)`: both, on the same data.

The rule: **fit on the training set, transform both sets**. `scaler.fit_transform(X_train)` then `scaler.transform(X_test)`. (The handbook writes `fit_trainsform` twice; that typo raises an `AttributeError`.) Putting transformers in a `Pipeline` enforces the rule automatically, including inside cross-validation.

## Scaling numeric features

Gradient descent on unscaled features zig-zags: with height in metres and weight in kilograms, the cost surface is a long narrow valley, and a learning rate that suits one weight is too large or too small for the other. Distances are dominated by the largest-range feature. Trees and forests do not care, because they split on order.

For the values 2, 4, 6, 8, 100:

| scaler | formula | result |
|---|---|---|
| `StandardScaler` | (x − mean)/std | −0.578, −0.526, −0.473, −0.420, 1.997 |
| `MinMaxScaler` | (x − min)/(max − min) | 0, 0.020, 0.041, 0.061, 1 |
| `RobustScaler` | (x − median)/IQR | −1, −0.5, 0, 0.5, 23.5 |
| `MaxAbsScaler` | x / max(abs(x)) | 0.02, 0.04, 0.06, 0.08, 1 |

**Standardisation** gives each feature mean 0 and standard deviation 1. (The handbook describes it as bringing data "between −3 and 3"; there is no such bound, the 100 above could just as well be 1000. Most values of a roughly normal feature fall in that range.) **Normalisation** (min-max) squeezes values into [0, 1], which suits methods that need non-negative input such as multinomial naive Bayes; one outlier squashes everything else toward 0, as in the table. **RobustScaler** uses the median and IQR, so the outlier does not distort the other values. **MaxAbsScaler** keeps zeros at zero, useful for sparse data. Your drill `d-scale` implements three of them.

## Encoding categorical features

### Why not just number the categories?

Coding red = 0, green = 1, blue = 2 tells a linear model that blue is "twice green" and that green lies between red and blue. Unless the categories really are ordered (small < medium < large, which `OrdinalEncoder` handles), this invents structure that is not there.

### Dummy variables (one-hot encoding)

Create one 0/1 column per category, with a 1 in the column of the row's category:

| colour | green | red |
|---|---|---|
| red | 0 | 1 |
| green | 1 | 0 |
| blue | 0 | 0 |
| green | 1 | 0 |

That table is `pd.get_dummies(colours, drop_first=True, dtype=int)`: the columns are sorted (blue, green, red) and the first, blue, is dropped. Blue is now the **reference category**, represented by all zeros.

Why drop one? With an intercept, the full set of dummy columns always sums to 1, exactly equal to the intercept's column of ones. That is **perfect multicollinearity**, the **dummy variable trap**: the coefficients have no unique solution, so one of them is arbitrary. (The handbook says the trap breaks the assumption that observations are independent; it is the columns, not the observations, that become dependent.) Dropping one dummy fixes it, and each remaining coefficient means "difference from the reference category". Regularised models and trees cope with all k columns, so dropping is mainly a linear-regression concern.

In a pipeline, prefer sklearn's `OneHotEncoder`, which remembers the training categories:

```
from sklearn.preprocessing import OneHotEncoder
enc = OneHotEncoder(handle_unknown="ignore", sparse_output=False).fit(train[["city"]])
enc.transform(test[["city"]])          # a city never seen in training becomes all zeros
```

`pd.get_dummies` applied separately to train and test can produce different columns if a category is missing from one of them.

One-hot is fine for a handful of categories (the handbook suggests fewer than ten); with hundreds it creates many sparse columns.

### Frequency encoding

Replace each category with its share of the rows. If A is 50% of the column, B 20% and C 30%, A → 0.5, B → 0.2, C → 0.3. (The handbook's text says B is 30%, but its own table, with A five times, B twice and C three times in ten rows, gives B 0.2 and C 0.3.) It produces one column regardless of the number of categories. Its weakness is **collision**: two categories with the same frequency become indistinguishable. imperio: `FrequencyImputationTransformer`.

### Target encoding

Replace each category with the mean of the target for that category (regression) or the share of the positive class (classification). In the handbook's example, category A's targets 100, 240, 130, 200, 100 average 154, B's 500 and 600 average 550, C's 30, 20, 40 average 30. One column, and very informative, but **dangerous**: the encoding is computed from the target, so a category seen only once gets exactly its own target value and the model learns to trust it. Compute it on training data only, ideally out-of-fold, and shrink rare categories toward the overall mean (smoothing). sklearn 1.3 and later has `TargetEncoder`, which does both; imperio: `TargetImputationTransformer`.

## Transforming distributions

### Log and Box-Cox

Many real features are right-skewed (incomes, prices, counts): most values small, a long tail of large ones. A log transform compresses the tail. The **Box-Cox** transformation generalises it with a parameter λ (lambda):

$$
y(λ) = (y^λ − 1) / λ   if λ ≠ 0
y(λ) = log(y)          if λ = 0
$$

λ = 1 only shifts the data, λ = 0.5 is a square-root type transform, λ = 0 is the log. Box-Cox requires **strictly positive** values; the **Yeo-Johnson** variant handles zero and negative values. For values 1, 2, 4, 8, 16: λ = 0 gives 0, 0.693, 1.386, 2.079, 2.773 (evenly spaced, because each value doubles); λ = 0.5 gives 0, 0.828, 2, 3.657, 6.

sklearn's `PowerTransformer(method="box-cox")` (or the default `"yeo-johnson"`) estimates the best λ from the training data. For 1,000 log-normal values (skewness 3.17), it estimates λ ≈ −0.012, essentially a log, and the skewness drops to 0.0. imperio's `BoxCoxTransformer` uses a fixed `l=0.5` by default instead of estimating it.

### ZCA whitening

**Whitening** transforms the features so they are uncorrelated and each has variance 1. PCA whitening rotates the data onto its principal components and rescales them; **ZCA** (zero-phase component analysis; the handbook calls it "zero component analysis") then rotates back, so the whitened features stay as close as possible to the originals. It removes multicollinearity, which can help linear models. imperio: `ZCATransformer`.

### Other ideas

- **Binning**: turn a numeric feature into ranges (`pd.cut`, `KBinsDiscretizer`), useful when the effect is a step.
- **Interactions and polynomials**: x₁·x₂, x² (`PolynomialFeatures`) let linear models fit curves.
- **Domain features**: body mass index from height and weight; day of week from a date; ratios such as debt/income. These often help more than any automatic method.

## Putting it together

```
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder, PowerTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression

pre = ColumnTransformer([
    ("num", make_pipeline(SimpleImputer(strategy="median"), PowerTransformer(), StandardScaler()), num_cols),
    ("cat", make_pipeline(SimpleImputer(strategy="most_frequent"), OneHotEncoder(handle_unknown="ignore")), cat_cols),
])
model = make_pipeline(pre, LogisticRegression(max_iter=1000)).fit(X_train, y_train)
```

`ColumnTransformer` applies a different pipeline to each list of columns and joins the results. Every statistic is learned from `X_train` only. For homework 15 to 17, record the test score before and after each transformation, and remember that a change of one or two test rows is noise: cross-validate when the difference is small. (The handbook reports Pima accuracy rising from 0.72 to 0.77 with Box-Cox and to 0.83 with ZCA, each on one split.)

## Common mistakes

> **Fitting a scaler or encoder on all data before splitting.** Test statistics leak into training.

> **Target encoding without out-of-fold estimates.** Rare categories memorise the target.

> **Box-Cox on zeros or negatives.** Use Yeo-Johnson or shift the data.

## Summary

Fit transformers on training data and transform both sets, ideally in a Pipeline. Standardise (mean 0, std 1) for gradient descent and distances; min-max into [0, 1]; RobustScaler for outliers. One-hot encode unordered categories and drop one dummy for unregularised linear models (the dummy trap is perfect multicollinearity). Frequency encoding uses category shares (collisions possible); target encoding uses the target mean per category (leakage risk; smooth and compute out-of-fold). Box-Cox (positive values) and Yeo-Johnson reduce skew; ZCA whitening removes correlations.

--- practice
@predict
MinMaxScaler is fitted on training values 10, 20, 30. What does it output for a test value of 35? Type a decimal.
```python
lo, hi = 10, 30
print((35 - lo) / (hi - lo))
```
= 1.25
! The scaler keeps the training min and max, so new data can fall outside [0, 1]. That is correct behaviour, not a bug.

@choice
Why does a linear regression with an intercept and all k dummy columns of one category fail to have unique coefficients?
- The dummy columns are not numeric
* The k columns always sum to 1, duplicating the intercept column (perfect multicollinearity)
- Observations become dependent on each other
- There are too many rows
! Drop one dummy (drop_first=True); it becomes the reference category.

@predict
Box-Cox with λ = 0.5 transforms y into (y^0.5 − 1)/0.5. What is the result for y = 9?
```python
print((9 ** 0.5 - 1) / 0.5)
```
= 4.0
! (3 − 1)/0.5 = 4. With λ = 0 the transform would be log(9) ≈ 2.197.

@choice
A "city" column has 800 distinct values. Which encoding is the most practical for a linear model, if done carefully?
- One-hot with 800 columns, always
- Label encoding 0 to 799
* Target encoding with smoothing, computed out-of-fold on the training data
- Dropping every row with a rare city
! One-hot becomes huge and sparse; integer labels invent an order. Target encoding compresses the information into one column, as long as it does not leak.

@run
Write `freq_encode(train, test)`: compute each category's share in `train` (rounded to 3) and return the encoded test list, using 0 for categories never seen in training. Then `target_encode(cats, ys)` returning a dict from category to the mean target for that category, rounded to 3.
```starter
def freq_encode(train, test):
    pass

def target_encode(cats, ys):
    pass
```
```test
tr = ["A", "A", "B", "C", "B", "A", "C", "A", "C", "A"]
print(freq_encode(tr, ["A", "B", "C", "D"]))
cats = ["A", "A", "B", "C", "B", "A", "C", "A", "C", "A"]
ys = [100, 240, 500, 30, 600, 130, 20, 200, 40, 100]
enc = target_encode(cats, ys)
print(enc["A"], enc["B"], enc["C"])
```
= [0.5, 0.2, 0.3, 0]
= 154.0 550.0 30.0
```solution
def freq_encode(train, test):
    n = len(train)
    share = {}
    for c in train:
        share[c] = share.get(c, 0) + 1
    for c in share:
        share[c] = round(share[c] / n, 3)
    return [share.get(c, 0) for c in test]

def target_encode(cats, ys):
    sums, counts = {}, {}
    for c, y in zip(cats, ys):
        sums[c] = sums.get(c, 0) + y
        counts[c] = counts.get(c, 0) + 1
    return {c: round(sums[c] / counts[c], 3) for c in sums}
```
! These reproduce the handbook's tables. A category unseen in training gets 0 here; sklearn's TargetEncoder would use the overall target mean instead.

@choice
Which scaler is least affected by a single extreme value?
- StandardScaler
- MinMaxScaler
* RobustScaler
- MaxAbsScaler
! It centres on the median and divides by the IQR; one outlier does not move either.

@write
From memory, explain how target encoding works, why it can leak the target, and two ways to make it safe.
min: 50
```solution
Target encoding replaces each category with the mean of the target among the training rows in that category (for classification, the share of the positive class). It leaks because the encoded value is computed from the very targets the model is trained to predict: a category that appears once gets exactly its own target, so the model learns that the feature is perfectly predictive and fails on new data. To make it safe, compute the encoding only on training data and out-of-fold, so each row's value comes from other rows, and smooth rare categories toward the global mean. sklearn's TargetEncoder does both.
```
! Check you mentioned training-only fitting.

--- recall
Q: Write the standardisation and min-max formulas.
A: (x − mean)/std; (x − min)/(max − min).
Q: What is the dummy variable trap?
A: With an intercept, all k dummies sum to 1 and duplicate the intercept column (perfect multicollinearity); drop one.
Q: Write the Box-Cox transformation.
A: (y^λ − 1)/λ for λ ≠ 0, log y for λ = 0; y must be positive (Yeo-Johnson handles any sign).
Q: What is frequency encoding's weakness, and target encoding's?
A: Frequency: categories with equal frequency collide. Target: leaks the target unless fitted out-of-fold and smoothed.
