=== stats | math | 1 | Descriptive statistics and correlation | d-pearson
@@ About 30 min reading · Handbook chapters 3 and 7 (covariance) · Homework 1
## Why this matters

Homework 1 asks you to study each column with six statistics (mean, median, mode, standard deviation, variance, range) and then find the columns most correlated with the target and explain why. Behind those calls are a handful of formulas, and the same formulas come back later: standard deviation in feature scaling and PCA, variance in naive Bayes and GMMs, covariance in PCA, correlation in feature selection. Knowing what each number means and how it is computed lets you spot nonsense in your output instead of copying it into a report.

Notation used below: a column of n values is written x₁, x₂, …, xₙ. The symbol **Σ** (capital sigma) means "add up": Σ xᵢ is x₁ + x₂ + … + xₙ. A bar over a letter, **x̄**, means the mean of x.

## Centre: mean, median, mode

The **mean** is the sum divided by the count:

$$
x̄ = (1/n) · Σ xᵢ
$$

The **median** is the middle value after sorting. For an odd count it is the single middle value; for an even count, the average of the two middle values. The **mode** is the most frequent value (there can be several).

Worked example: ages of 6 patients, `29, 41, 45, 52, 58, 77`.

- Mean: (29 + 41 + 45 + 52 + 58 + 77) / 6 = 302 / 6 ≈ 50.33.
- Median: n = 6 is even, so average the 3rd and 4th sorted values: (45 + 52) / 2 = 48.5.
- Mode: every value appears once, so there is no single mode (pandas returns all six).

Now change 77 to 270, a typing error. The mean jumps to 495 / 6 = 82.5, but the median stays 48.5. The median is **robust**: a single extreme value cannot drag it. Two practical rules follow. When mean and median of a column are far apart, the column is skewed or has outliers; look at a histogram before trusting the mean. And when you fill missing values (week 7), the median is usually the safer choice for skewed columns.

The mode is the natural centre for categorical columns: the most common chest-pain type, the most common passenger class.

## Spread: range, variance, standard deviation

Two columns can have the same mean and look nothing alike: `48, 50, 52` and `0, 50, 100` both average 50. Spread measures how far values sit from the centre.

The **range** is max − min. Easy, but decided entirely by the two most extreme values.

The **variance** is the average squared distance from the mean:

$$
population variance:  σ² = (1/n)     · Σ (xᵢ − x̄)²
sample variance:      s² = (1/(n−1)) · Σ (xᵢ − x̄)²
$$

The **standard deviation** is the square root of the variance, σ or s. Taking the root brings the number back to the column's own units (years, not years squared), which is why std is what you report.

Why square the distances? Because plain distances cancel: Σ (xᵢ − x̄) is always exactly 0. Squaring makes every term positive.

Why two versions, n and n − 1? Dividing by n − 1 (called **Bessel's correction**) gives an unbiased estimate when your data is a sample of a larger population. The difference matters for small n and vanishes for large n. What you must remember is which library uses which default:

| Call | Divides by |
|---|---|
| pandas `df['x'].std()`, `.var()` | n − 1 |
| NumPy `np.std(x)`, `np.var(x)` | n |
| scikit-learn `StandardScaler` | n |
| NumPy `np.cov(x)` | n − 1 |

You can change it with the `ddof` argument ("delta degrees of freedom"): `np.std(x, ddof=1)` divides by n − 1, `df['x'].std(ddof=0)` by n. If a homework number differs from a classmate's in the third decimal, this is usually why.

Worked example with `48, 50, 52`: mean 50, squared distances 4, 0, 4, sum 8. Population variance 8/3 ≈ 2.667, std ≈ 1.633. Sample variance 8/2 = 4, std = 2.

The homework's word "variation" is sometimes meant as variance; another useful number with a similar name is the **coefficient of variation**, std / mean, which compares spread between columns on different scales (std 10 on a mean of 20 is huge; std 10 on a mean of 5,000 is tiny).

## Covariance and correlation

Do two columns move together? The **covariance** answers in raw units:

$$
cov(x, y) = (1/(n−1)) · Σ (xᵢ − x̄)(yᵢ − ȳ)
$$

Each term multiplies how far a row is from the mean in x by how far it is in y. If high x tends to come with high y, both factors are positive together (or negative together), the products are positive, and the sum is positive. If high x comes with low y, the products are negative. The trouble: the size of the covariance depends on units. Measure height in centimetres instead of metres and the covariance is 100 times bigger, though the relationship is identical.

**Pearson correlation** fixes this by dividing by both standard deviations, which is what the handbook writes as ρ = cov(x, y) / (σₓ σᵧ):

$$
r = Σ (xᵢ − x̄)(yᵢ − ȳ) / √( Σ (xᵢ − x̄)² · Σ (yᵢ − ȳ)² )
$$

The n or n − 1 cancels between top and bottom, so you can leave it out. The result is always between −1 and +1:

- **+1**: the points lie exactly on a rising straight line.
- **−1**: exactly on a falling line.
- **0**: no *linear* relationship.

Worked example: hours studied `x = 1, 2, 3, 4` and exam score `y = 2, 4, 5, 9`. Means: x̄ = 2.5, ȳ = 5.

| xᵢ − x̄ | yᵢ − ȳ | product | (xᵢ − x̄)² | (yᵢ − ȳ)² |
|---|---|---|---|---|
| −1.5 | −3 | 4.5 | 2.25 | 9 |
| −0.5 | −1 | 0.5 | 0.25 | 1 |
| 0.5 | 0 | 0 | 0.25 | 0 |
| 1.5 | 4 | 6 | 2.25 | 16 |

Sums: products 11, x-squares 5, y-squares 26. r = 11 / √(5 · 26) = 11 / √130 ≈ 11 / 11.40 ≈ 0.965. A strong positive relationship.

### Reading a correlation

As a rough guide for |r|: below 0.3 weak, 0.3 to 0.7 moderate, above 0.7 strong. Homework 3 and 4 ask you to build a feature subset with |r| between 0.5 and 0.8 with the target, so you will use these bands directly.

Three warnings you should write into your homework conclusions when relevant:

1. **Correlation is not causation.** Ice-cream sales and drownings correlate because both rise in summer. When you "explain why" a column correlates with the target, propose a mechanism and say it is a hypothesis.
2. **Pearson only sees straight lines.** y = x² on x from −3 to 3 has r = 0, although y is entirely determined by x. Plot before concluding "unrelated". **Spearman** correlation (`df.corr(method='spearman')`) ranks the values first and catches any monotonic relationship.
3. **Outliers distort r.** One extreme point can create or destroy a strong correlation. Check with a scatter plot.

### Correlation with a binary target

In classification homework the target is 0/1. Pearson r between a numeric column and a 0/1 column still works: it is called the **point-biserial** correlation (you will meet it again in feature selection), and it is larger when the column's mean differs strongly between the two classes relative to its spread. In the heart data, for instance, `thalach` (maximum heart rate) has a clearly positive correlation with `target`, and `exang` (exercise-induced angina) a clearly negative one; in your homework you check those numbers on your own dataset and then explain them.

## Doing it in pandas

```
df.mean(numeric_only=True)
df.median(numeric_only=True)
df.mode().iloc[0]           # first mode of each column
df.std(numeric_only=True)   # n − 1
df.var(numeric_only=True)
df.max(numeric_only=True) - df.min(numeric_only=True)    # range
corr = df.corr(numeric_only=True)['target'].drop('target')
corr.abs().sort_values(ascending=False).head(3)
```

A compact way to show all of them in one table for the homework: `df.agg(['mean', 'median', 'std', 'var', 'min', 'max']).T` (the `.T` transposes, so each column of your data becomes a row of the summary).

## Common mistakes

> **Reporting correlations including the target with itself.** The top entry of `corr['target']` is always 1.0. Drop it.

> **Averaging categorical codes.** The mean of `cp` (chest pain type 0 to 3) is not meaningful. Use `value_counts()` and the mode for categorical columns.

> **Comparing std values from different libraries** without checking n vs n − 1.

## Summary

Mean is pulled by outliers; median is not; mode suits categories. Range, variance and standard deviation measure spread; pandas divides by n − 1, NumPy and StandardScaler by n. Covariance measures joint movement in raw units; Pearson r rescales it to −1…+1 and only detects linear relationships. Correlation suggests where to look; it never proves cause.

--- practice
@predict
For the values `2, 4, 4, 4, 5, 5, 7, 9`, what is the **population** standard deviation (divide by n)? Type just the number.
```python
import math
d = [2, 4, 4, 4, 5, 5, 7, 9]
m = sum(d) / len(d)
print(math.sqrt(sum((x - m) ** 2 for x in d) / len(d)))
```
= 2.0
=| 2
! The mean is 40 / 8 = 5. Squared distances: 9, 1, 1, 1, 0, 0, 4, 16, which sum to 32. 32 / 8 = 4, and √4 = 2.

@choice
A column's mean is 82.5 and its median 48.5. What is the most likely explanation?
- The column is perfectly symmetric
* A few very large values (outliers or a long right tail) pull the mean up
- The column has missing values
- The mean was computed with n − 1
! The median ignores how extreme the largest values are; the mean does not. A big gap signals skew or outliers.

@run
Write `var(xs, ddof)` and `std(xs, ddof)` where `ddof=0` divides by n and `ddof=1` divides by n − 1 (like NumPy's argument). Return the values rounded to 4 decimals.
```starter
import math

def var(xs, ddof):
    pass

def std(xs, ddof):
    pass
```
```test
print(var([48, 50, 52], 0), var([48, 50, 52], 1))
print(std([48, 50, 52], 0), std([48, 50, 52], 1))
print(std([2, 4, 4, 4, 5, 5, 7, 9], 1))
```
= 2.6667 4.0
= 1.633 2.0
= 2.1381
```solution
import math

def var(xs, ddof):
    m = sum(xs) / len(xs)
    return round(sum((x - m) ** 2 for x in xs) / (len(xs) - ddof), 4)

def std(xs, ddof):
    m = sum(xs) / len(xs)
    return round(math.sqrt(sum((x - m) ** 2 for x in xs) / (len(xs) - ddof)), 4)
```
! Only the denominator changes. With 8 values the n − 1 version (2.1381) is about 7% larger than the n version (2.0).

@predict
What is the Pearson correlation of `x = [1, 2, 3, 4]` and `y = [2, 4, 5, 9]`, rounded to 3 decimals?
```python
import math
x = [1, 2, 3, 4]; y = [2, 4, 5, 9]
mx, my = sum(x) / 4, sum(y) / 4
sxy = sum((a - mx) * (b - my) for a, b in zip(x, y))
sxx = sum((a - mx) ** 2 for a in x); syy = sum((b - my) ** 2 for b in y)
print(round(sxy / math.sqrt(sxx * syy), 3))
```
= 0.965
! This is the worked example: 11 / √(5 · 26) = 11 / √130 ≈ 0.965.

@choice
For x from −3 to 3 in steps of 1, y = x². What is the Pearson correlation between x and y?
- Close to +1
- Close to −1
* Exactly 0
- Undefined
! The relationship is perfect but not linear: the left half falls and the right half rises, and the products cancel. Pearson r only measures straight-line association.

@choice
Homework 3 asks for columns with absolute correlation between 0.5 and 0.8 with the target. Which correlations qualify? r = 0.45, r = −0.62, r = 0.79, r = −0.91
- 0.45 and 0.79
* −0.62 and 0.79
- −0.62, 0.79 and −0.91
- Only 0.79
! Take the absolute value first: 0.45, 0.62, 0.79, 0.91. Only 0.62 and 0.79 fall between 0.5 and 0.8.

@write
From memory, explain why Pearson correlation divides covariance by both standard deviations, and give one reason a high correlation between a feature and the target might not mean the feature causes the target.
min: 50
```solution
Covariance depends on the units of the two columns: rescaling one column (metres to centimetres) multiplies the covariance by the same factor even though the relationship does not change. Dividing by both standard deviations removes the units and bounds the result between −1 and +1, so correlations can be compared across columns. A high correlation can come from a third variable that drives both (season drives ice-cream sales and drownings), from reverse causation, or from chance in a small sample, so it does not prove the feature causes the target.
```
! Make sure you named units/scale for the first part and a confounder or reverse causation for the second.

--- recall
Q: Which divides by n − 1 by default: pandas `.std()` or NumPy `np.std()`?
A: pandas `.std()` (ddof=1). NumPy `np.std()` and StandardScaler divide by n (ddof=0).
Q: Write the Pearson correlation formula.
A: r = Σ (xᵢ − x̄)(yᵢ − ȳ) / √( Σ (xᵢ − x̄)² · Σ (yᵢ − ȳ)² )
Q: Why is the median called robust?
A: One extreme value cannot move it much, unlike the mean.
Q: What does r = 0 mean, and what does it not mean?
A: No linear relationship; it does not mean no relationship (y = x² can have r = 0).
