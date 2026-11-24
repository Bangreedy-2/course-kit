=== bayes | sup | 5 | Naive Bayes classifiers | d-gnb
@@ About 30 min reading · Handbook chapter 8.10 · Homework 6
## Why this matters

Naive Bayes is the handbook's first model that is built from probability rather than from a cost function and gradient descent. It trains in one pass over the data (it only counts and averages), works with very little data, scales to millions of rows, and is a strong baseline for text. Homework 6 asks you to train its three sklearn variants, Gaussian, Multinomial and Bernoulli, on Telco churn and compare them in a table. Knowing what each variant assumes about the features tells you in advance which one should win.

## From Bayes' theorem to a classifier

For a sample with features x = (x₁, …, x_d) and a class C, Bayes' theorem gives:

$$
P(C | x) = P(x | C) · P(C) / P(x)
$$

To classify, compute this for every class and pick the largest. P(x) is the same for every class, so it does not change which class wins; we can compare the numerators P(x | C) · P(C) directly and only divide by their sum if we want probabilities.

The prior P(C) is easy: the share of training rows in class C. The hard part is P(x | C), the probability of seeing this whole combination of feature values in class C. With 20 features there are too many combinations to estimate from data.

## The naive assumption

Naive Bayes assumes the features are **conditionally independent given the class**: once you know the class, knowing one feature tells you nothing more about another. Then the joint likelihood splits into a product of one-feature likelihoods:

$$
P(x | C) = P(x₁ | C) · P(x₂ | C) · … · P(x_d | C)
$$

and the classifier is:

$$
predicted class = argmax over C of  P(C) · Π_j P(x_j | C)
$$

**Π** (capital pi) is the product sign, the multiplication version of Σ. **argmax** means "the C that gives the largest value".

The assumption is almost always false (in the heart data, age and blood pressure are related even within one class). Naive Bayes still classifies well surprisingly often, because it only needs the *ranking* of classes to be right, not the probabilities themselves. Its probability outputs, though, tend to be overconfident, pushed toward 0 and 1, so don't read `predict_proba` from naive Bayes as calibrated risk.

## A worked example (Bernoulli features)

Six emails, two binary features: does the email contain "free"? does it contain "meeting"?

| Email | free | meeting | Class |
|---|---|---|---|
| 1 | 1 | 0 | spam |
| 2 | 1 | 0 | spam |
| 3 | 0 | 0 | spam |
| 4 | 1 | 1 | ham |
| 5 | 0 | 1 | ham |
| 6 | 0 | 0 | ham |

Training is counting: P(spam) = P(ham) = 3/6 = 0.5. Within spam, "free" appears in 2 of 3, "meeting" in 0 of 3. Within ham, "free" in 1 of 3, "meeting" in 2 of 3.

New email: free = 1, meeting = 0.

- spam: 0.5 × P(free = 1 | spam) × P(meeting = 0 | spam) = 0.5 × 2/3 × 3/3 = 0.333
- ham: 0.5 × 1/3 × 1/3 = 0.0556
- Normalise: P(spam | x) = 0.333 / (0.333 + 0.0556) ≈ **0.857**.

Now an email with free = 1, meeting = 1. For spam, P(meeting = 1 | spam) = 0/3 = 0, so the whole product is 0: one unseen word vetoes the class regardless of all other evidence. That is the **zero-frequency problem**.

### Laplace smoothing

Add a pseudo-count α (usually 1) to every count. For a binary feature: P(xⱼ = 1 | C) = (count + α) / (n_C + 2α). With α = 1, P(meeting = 1 | spam) becomes (0 + 1)/(3 + 2) = 0.2 instead of 0. For the free = 1, meeting = 1 email:

- spam: 0.5 × (2 + 1)/5 × (0 + 1)/5 = 0.5 × 0.6 × 0.2 = 0.06
- ham: 0.5 × (1 + 1)/5 × (2 + 1)/5 = 0.5 × 0.4 × 0.6 = 0.12
- P(spam | x) = 0.06 / 0.18 ≈ 0.333. Ham wins, but spam is no longer impossible.

In sklearn, `alpha=1.0` is the default for `MultinomialNB` and `BernoulliNB`.

## Products of small numbers: work in logs

Multiplying 50 probabilities of 0.01 gives 10⁻¹⁰⁰, close to the smallest number a float can hold; with more features the product **underflows** to exactly 0 for every class. The fix: take logarithms, which turn products into sums and preserve the ranking:

$$
log score(C) = log P(C) + Σ_j log P(x_j | C)
$$

All libraries do this. Your Gaussian naive Bayes drill does too.

## The three variants

They differ only in how P(xⱼ | C) is modelled.

### Gaussian naive Bayes: continuous features

Each feature, within each class, is assumed normal. Training stores a mean μ_Cj and standard deviation σ_Cj per class and feature; prediction plugs xⱼ into the normal density from homework 2:

$$
P(x_j | C) = 1/(σ_Cj √(2π)) · exp(−½ ((x_j − μ_Cj)/σ_Cj)²)
$$

This is the handbook's `Gauss` class: `fit` stores `priors`, `mu` and `std` per class (with `np.mean(..., axis=0)`, one value per feature); `predict_proba` multiplies the densities with `reduce(mul, [...])` (`reduce(mul, list)` multiplies all items of a list together) and the prior; `predict` takes the argmax. Two details to notice when you read its code: the density's normalising factor is written with σ² instead of σ, and the final normalisation divides by the vector's Euclidean length (`np.linalg.norm`) rather than by its sum, so its "probabilities" do not sum to 1. Neither changes which class has the largest score when the σ values are similar, which is why its accuracy (0.855 on standardised heart data, per the handbook) is close to sklearn's (0.881). If you copy the class for homework, you can fix both.

Use it for: measurements (age, blood pressure, charges, tenure). Skewed features hurt it; a log or Box-Cox transform (week 9) can help.

### Multinomial naive Bayes: counts

Each sample is treated as counts of events, typically words in a document. P(xⱼ | C) is the share of all counts in class C that belong to feature j (smoothed). Features must be **non-negative**; sklearn raises an error on negative values, so standardised data cannot be used. For homework 6 on mixed numeric data, scale to [0, 1] with `MinMaxScaler` first; it runs, but the "counts" assumption is a poor fit, so expect it to do worst.

### Bernoulli naive Bayes: binary features

Each feature is present or absent; the model uses P(xⱼ = 1 | C) and, unlike multinomial, also counts the *absence* of a feature as evidence (the "meeting = 0" factor above). sklearn's `BernoulliNB` binarises inputs with `binarize=0.0`: any value above 0 becomes 1. On standardised data that means "above average", which can work tolerably. Use it for one-hot encoded categories and yes/no columns, which Telco has plenty of (Partner, PhoneService, PaperlessBilling, and so on).

## Homework 6 in practice

```
from sklearn.naive_bayes import GaussianNB, MultinomialNB, BernoulliNB
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import accuracy_score

scaler = MinMaxScaler().fit(X_train)              # fit on train only
Xtr, Xte = scaler.transform(X_train), scaler.transform(X_test)
rows = []
for name, model in [('Gaussian', GaussianNB()), ('Multinomial', MultinomialNB()), ('Bernoulli', BernoulliNB(binarize=0.5))]:
    model.fit(Xtr, y_train)
    rows.append({'ML Model': name, 'Accuracy': accuracy_score(y_test, model.predict(Xte))})
pd.DataFrame(rows)
```

Telco preprocessing reminders: drop `customerID`, convert `TotalCharges` with `pd.to_numeric(..., errors='coerce')` and handle its few blanks, map `Churn` to 0/1, and turn the Yes/No and multi-category columns into numbers (`map` or `pd.get_dummies`). Compare each model with the majority-class baseline (about 0.73), and add recall for churners to your conclusion: accuracy alone will not tell you which variant finds churners.

## Common mistakes

> **Negative inputs to MultinomialNB** (`ValueError: Negative values in data`). Use MinMaxScaler or raw counts.

> **Trusting the probabilities.** Naive Bayes ranks well but its probabilities are overconfident.

> **Fitting the scaler on all data.** Fit on X_train only.

## Summary

Naive Bayes picks argmax_C P(C) Π P(xⱼ | C), assuming features are independent given the class. Training is counting (priors and per-class statistics). Laplace smoothing (α) prevents one zero count from vetoing a class; logs prevent underflow. Gaussian NB models continuous features with per-class normal densities; Multinomial models non-negative counts; Bernoulli models presence/absence and also uses absences. It is fast and a strong baseline, with overconfident probabilities.

--- practice
@predict
Using the six-email table without smoothing, what is P(spam | free = 1, meeting = 0)? Round to 4 decimals.
```python
s = 0.5 * (2 / 3) * 1
h = 0.5 * (1 / 3) * (1 / 3)
print(round(s / (s + h), 4))
```
= 0.8571
! Spam score 0.5 × 2/3 × 1 = 0.333; ham score 0.5 × 1/3 × 1/3 = 0.0556; normalise.

@choice
What does the "naive" assumption say?
- All classes are equally likely
* Features are independent of each other once the class is known
- Features are normally distributed
- The prior can be ignored
! Conditional independence lets P(x | C) factor into a product of single-feature terms.

@predict
With Laplace smoothing α = 1, a binary feature that appears in 0 of 3 training emails of a class gets which probability of being present? Type a decimal.
```python
print((0 + 1) / (3 + 2))
```
= 0.2
! (count + α)/(n + 2α) = 1/5. Without smoothing it would be 0 and veto the class.

@choice
Homework 6: after StandardScaler, `MultinomialNB().fit(X, y)` raises an error. Why?
- Multinomial NB only supports two classes
* Standardised data has negative values, and multinomial NB models non-negative counts
- The data must be one-hot encoded first
- The scaler was fitted on the test set
! Multinomial likelihoods are proportions of counts, which cannot be negative. Use MinMaxScaler (values in [0, 1]) instead.

@run
Write `train(rows, labels)` for Bernoulli naive Bayes with Laplace smoothing α = 1: for each class store its prior and, for each feature, P(x = 1 | class) = (count + 1)/(n_class + 2). Then `posterior(model, x)` returning a dict of normalised posteriors rounded to 4, using P(x=0|C) = 1 − P(x=1|C).
```starter
def train(rows, labels):
    pass

def posterior(model, x):
    pass
```
```test
X = [[1, 0], [1, 0], [0, 0], [1, 1], [0, 1], [0, 0]]
y = ["spam", "spam", "spam", "ham", "ham", "ham"]
m = train(X, y)
print(posterior(m, [1, 1]))
print(posterior(m, [1, 0]))
```
= {'ham': 0.6667, 'spam': 0.3333}
= {'ham': 0.25, 'spam': 0.75}
```solution
def train(rows, labels):
    model = {}
    for c in sorted(set(labels)):
        rs = [r for r, l in zip(rows, labels) if l == c]
        probs = [(sum(r[j] for r in rs) + 1) / (len(rs) + 2) for j in range(len(rows[0]))]
        model[c] = (len(rs) / len(rows), probs)
    return model

def posterior(model, x):
    scores = {}
    for c, (prior, probs) in model.items():
        s = prior
        for xj, p in zip(x, probs):
            s *= p if xj == 1 else 1 - p
        scores[c] = s
    total = sum(scores.values())
    return {c: round(s / total, 4) for c, s in scores.items()}
```
! The first test is the lesson's smoothed example (spam 0.333). These are exactly sklearn's `BernoulliNB(alpha=1)` outputs on this table.

@choice
Which naive Bayes variant suits columns like tenure in months and monthly charges?
* Gaussian
- Multinomial
- Bernoulli
- None of them
! Continuous measurements fit a per-class normal model. Yes/No columns suit Bernoulli; word counts suit Multinomial.

@write
From memory, explain why naive Bayes computes in logarithms, and why it can classify well even though its independence assumption is usually false.
min: 50
```solution
The likelihood is a product of many probabilities smaller than 1, so with many features it becomes so small that it underflows to 0 in floating point for every class. Taking logs turns the product into a sum of log probabilities, which stays in a safe range and keeps the same ranking of classes because log is increasing. The independence assumption distorts the probability values, but classification only needs the correct class to have the highest score; the errors often affect all classes similarly, so the ranking stays right even when the probabilities are overconfident.
```
! Check you mentioned underflow and that ranking, not calibration, is what classification needs.

--- recall
Q: Write the naive Bayes decision rule.
A: argmax over C of P(C) · Π_j P(x_j | C), usually computed as log P(C) + Σ log P(x_j | C).
Q: What does Laplace smoothing fix, and how?
A: The zero-frequency problem; add α to every count: (count + α)/(n + kα).
Q: Which data does each sklearn NB variant expect?
A: GaussianNB: continuous; MultinomialNB: non-negative counts; BernoulliNB: binary (binarizes at 0 by default).
Q: Why not trust naive Bayes `predict_proba` as a risk estimate?
A: Its probabilities are overconfident because the independence assumption is violated.
