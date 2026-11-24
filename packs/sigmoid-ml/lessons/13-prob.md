=== prob | math | 5 | Probability, conditional probability and Bayes' theorem | d-bayes
@@ About 30 min reading · Handbook chapter 8.1 to 8.9 · Needed for naive Bayes, GMM and every probability output
## Why this matters

Classifiers output probabilities (`predict_proba`), naive Bayes is built directly on Bayes' theorem, GMMs (week 8) are mixtures of probability distributions, and the evaluation lesson's precision and recall are conditional probabilities in disguise. The handbook's chapter 8 introduces the vocabulary; this lesson makes each rule concrete and shows the one result people get wrong most often.

## Two views of probability

The handbook names two interpretations. **Frequentist**: the probability of an event is the long-run share of times it happens if you repeat the experiment. **Bayesian**: probability is a degree of belief, updated as evidence arrives. The rules below are the same for both; naive Bayes uses the Bayesian reading.

## Sample spaces, events and the axioms

The **sample space** S is the set of all possible outcomes (a die: {1, 2, 3, 4, 5, 6}). An **event** A is a subset of it ("even" = {2, 4, 6}). If all outcomes are equally likely and S is finite, the classical definition applies:

$$
P(A) = (number of outcomes in A) / (number of outcomes in S)
$$

So P(even) = 3/6 = 0.5. The general definition only requires three **axioms**:

1. 0 ≤ P(A) ≤ 1 for every event.
2. P(S) = 1: something happens.
3. If A and B are **mutually exclusive** (cannot both happen), P(A ∪ B) = P(A) + P(B).

Symbols: **∪** is "or" (union), **∩** is "and" (intersection), **Aᶜ** is "not A" (complement).

## Basic rules

**Complement rule**: P(Aᶜ) = 1 − P(A). The chance of at least one six in 4 rolls is easiest as 1 − P(no six) = 1 − (5/6)⁴ ≈ 0.518.

**Addition rule** for any events: P(A ∪ B) = P(A) + P(B) − P(A ∩ B). The subtraction removes the overlap that was counted twice. With P(A) = 0.3, P(B) = 0.5, P(A ∩ B) = 0.1: P(A ∪ B) = 0.7.

## Conditional probability

P(A | B), read "the probability of A given B", is the probability of A once we know B happened. We restrict the world to B and ask what share of it is also A:

$$
P(A | B) = P(A ∩ B) / P(B)
$$

(The handbook prints this formula with P(A) in the denominator in one place; the denominator is the probability of the event you condition on, B.)

Example from a table of 100 patients:

| | Disease | No disease | Total |
|---|---|---|---|
| Smoker | 20 | 10 | 30 |
| Non-smoker | 10 | 60 | 70 |
| Total | 30 | 70 | 100 |

P(disease | smoker) = 20/30 ≈ 0.667, while P(smoker | disease) = 20/30 also happens to be 0.667 here, but P(disease) overall is only 0.3. In general P(A | B) ≠ P(B | A): the share of smokers among the sick is not the share of the sick among smokers. Mixing them up is called the **inverse fallacy**.

**Multiplication rule** (rearranged definition): P(A ∩ B) = P(B) · P(A | B) = P(A) · P(B | A).

**Independence**: A and B are independent if knowing one does not change the other, P(A | B) = P(A), which is the same as P(A ∩ B) = P(A) · P(B). Two coin flips are independent; smoking and disease in the table are not (0.2 ≠ 0.3 × 0.3).

**Law of total probability**: if B₁, …, B_k split S into non-overlapping pieces, P(A) = Σ P(A | Bᵢ) P(Bᵢ). You use it to get the denominator of Bayes' theorem.

## Bayes' theorem

Combining the two forms of the multiplication rule:

$$
P(A | B) = P(B | A) · P(A) / P(B)
$$

In classification language, with C a class and x the observed features:

$$
P(C | x) = P(x | C) · P(C) / P(x)
posterior = likelihood × prior / evidence
$$

- **Prior** P(C): how common the class is before looking at the features.
- **Likelihood** P(x | C): how typical these features are for that class.
- **Evidence** P(x): how common these features are overall; the same for every class, so it only rescales.
- **Posterior** P(C | x): what we want.

### The classic worked example

A disease affects 1% of people. A test detects it 90% of the time when present (sensitivity, which is recall!) and gives a false positive 5% of the time when absent. You test positive. How likely is it that you have the disease?

- Prior: P(D) = 0.01, P(no D) = 0.99.
- Likelihoods: P(+ | D) = 0.9, P(+ | no D) = 0.05.
- Evidence by total probability: P(+) = 0.9 × 0.01 + 0.05 × 0.99 = 0.009 + 0.0495 = 0.0585.
- Posterior: P(D | +) = 0.009 / 0.0585 ≈ **0.154**.

Only about 15%, despite a "90% accurate" test, because the disease is rare: among 10,000 people, 90 sick people test positive, but so do 495 healthy ones. With a prior of 50% the same test gives a posterior of 0.947. The prior matters enormously. In ML terms, a model's precision depends on how common the positive class is, which is why precision drops on imbalanced data even when recall is good.

## Counting: combinatorics

Equally-likely probabilities need counts. The handbook covers:

- **Permutations** of n different things (all arranged in a row): n! = 1 × 2 × … × n. Three letters a, b, c have 3! = 6 orders. (`!` is "factorial"; 0! = 1.)
- **Permutations with repeated items**: n! / (n₁! n₂! … n_c!) when the items fall into classes of identical things. The letters of "AAB" have 3!/(2! 1!) = 3 distinct orders: AAB, ABA, BAA.
- **Combinations** without repetition (order does not matter): choosing k of n,

$$
C(n, k) = n! / (k! (n − k)!)
$$

  Choosing 2 features out of 5 to plot: C(5, 2) = 10 pairs. Choosing 3 of 10: 120.
- **Combinations with repetition**: C(n + k − 1, k).

You will use C(n, k) when counting hyperparameter grids, feature subsets (2ᵈ − 1 non-empty subsets of d features is why exhaustive feature selection is impractical), and pairs in a correlation table (C(d, 2)).

## Random variables and distributions

A **random variable** X assigns a number to each outcome (the sum of two dice, a patient's cholesterol).

- **Discrete** X takes countable values; its **probability function** f(x) = P(X = x) gives each value's probability, summing to 1. Examples: **Bernoulli** (one yes/no trial with P(1) = p, the model behind each label in logistic regression and Bernoulli naive Bayes) and **binomial** (number of successes in n independent Bernoulli trials).
- **Continuous** X takes values in an interval; it has a **density** f(x) ≥ 0 whose area is 1. Probabilities are areas: P(a < X ≤ b) = F(b) − F(a), where F is the **distribution function** F(x) = P(X ≤ x). The **normal** distribution from homework 2 is the main example.

**Mean** (expected value) μ = Σ xⱼ f(xⱼ) for discrete X (an integral for continuous). For a fair die: (1 + 2 + … + 6)/6 = 3.5. **Variance** σ² = Σ (xⱼ − μ)² f(xⱼ), the expected squared distance from the mean. (The handbook prints the continuous mean with F(x); it should be the density f(x).)

## Common mistakes

> **Confusing P(A | B) with P(B | A).** Always ask: which event is known?

> **Adding probabilities of events that overlap** without subtracting P(A ∩ B).

> **Ignoring the prior.** A positive result from a good test for a rare condition is still probably a false alarm.

## Summary

Probabilities follow three axioms; P(not A) = 1 − P(A); P(A or B) = P(A) + P(B) − P(A and B). Conditional probability P(A | B) = P(A ∩ B)/P(B) restricts the world to B. Independence means P(A ∩ B) = P(A)P(B). Bayes' theorem: posterior = likelihood × prior / evidence, with the evidence from the law of total probability. n! counts orders; C(n, k) counts unordered choices. Discrete variables have probability functions; continuous ones have densities whose areas are probabilities.

--- practice
@predict
A test has sensitivity 0.9 and a false positive rate 0.05. The condition affects 1% of people. What is P(condition | positive), rounded to 4 decimals?
```python
prior, sens, fpr = 0.01, 0.9, 0.05
print(round(sens * prior / (sens * prior + fpr * (1 - prior)), 4))
```
= 0.1538
! Evidence P(+) = 0.009 + 0.0495 = 0.0585, and 0.009 / 0.0585 ≈ 0.1538. Most positives come from the large healthy group.

@predict
P(A) = 0.3, P(B) = 0.5, P(A ∩ B) = 0.1. What is P(A | B)?
```python
print(0.1 / 0.5)
```
= 0.2
! Condition on B: divide the overlap by P(B). Since 0.2 ≠ 0.3, A and B are not independent.

@choice
In the 100-patient table, 20 smokers have the disease, 30 people are smokers and 30 have the disease. Are smoking and disease independent?
- Yes, because P(disease | smoker) = P(smoker | disease)
* No, because P(disease ∩ smoker) = 0.2 but P(disease) · P(smoker) = 0.09
- Yes, because both totals are 30
- It cannot be decided from counts
! Independence requires P(A ∩ B) = P(A)P(B). Here 0.2 is much larger than 0.09: smokers are over-represented among the sick.

@predict
How many different pairs of features can you plot from 6 features (order does not matter)?
```python
import math
print(math.comb(6, 2))
```
= 15
! C(6, 2) = 6!/(2!·4!) = (6·5)/2 = 15.

@run
Write `p_at_least_one(p, n)`: the probability that an event with probability p happens at least once in n independent trials, rounded to 4. Then `perms_with_repeats(word)`: the number of distinct orderings of the letters of a word (n!/(n₁!n₂!…)).
```starter
def p_at_least_one(p, n):
    pass

def perms_with_repeats(word):
    pass
```
```test
print(p_at_least_one(1 / 6, 4))
print(p_at_least_one(0.05, 20))
print(perms_with_repeats("AAB"), perms_with_repeats("ABC"), perms_with_repeats("MISSISSIPPI"))
```
= 0.5177
= 0.6415
= 3 6 34650
```solution
def p_at_least_one(p, n):
    return round(1 - (1 - p) ** n, 4)

def fact(n):
    r = 1
    for i in range(2, n + 1):
        r *= i
    return r

def perms_with_repeats(word):
    counts = {}
    for ch in word:
        counts[ch] = counts.get(ch, 0) + 1
    r = fact(len(word))
    for c in counts.values():
        r //= fact(c)
    return r
```
! The complement rule turns "at least once" into 1 − P(never). The second test is the chance of at least one false alarm in 20 tests at a 5% error rate: 64%.

@choice
What is the expected value of a fair six-sided die?
- 3
* 3.5
- 6
- 21
! Σ x·f(x) = (1 + 2 + 3 + 4 + 5 + 6)/6 = 21/6 = 3.5. An expected value need not be a possible outcome.

@write
From memory, state Bayes' theorem with the names of its four parts, and explain why a positive result from a 90%-sensitive test for a 1%-prevalence disease still leaves the patient probably healthy.
min: 60
```solution
P(C | x) = P(x | C) P(C) / P(x): the posterior P(C | x) equals the likelihood P(x | C) times the prior P(C), divided by the evidence P(x). With prevalence 1%, the prior of disease is tiny. Out of 10,000 people, 100 are sick and 90 of them test positive, but 9,900 are healthy and 5% of them, 495, also test positive. So of 585 positives only 90 are sick, about 15%. The false positives from the large healthy group outnumber the true positives.
```
! Check that you computed or described the evidence with the law of total probability.

--- recall
Q: State Bayes' theorem with its parts named.
A: P(C | x) = P(x | C) · P(C) / P(x): posterior = likelihood × prior / evidence.
Q: Write the definition of conditional probability.
A: P(A | B) = P(A ∩ B) / P(B)
Q: What is the addition rule for any two events?
A: P(A ∪ B) = P(A) + P(B) − P(A ∩ B)
Q: How many ways to choose k items from n, order ignored?
A: C(n, k) = n! / (k!(n − k)!)
