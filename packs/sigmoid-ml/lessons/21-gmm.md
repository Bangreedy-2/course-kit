=== gmm | unsup | 8 | Gaussian mixture models and the EM algorithm | d-estep
@@ About 30 min reading · Handbook chapter 13 · Homework 12
## Why this matters

K-means gives every point exactly one cluster and assumes round clusters. Real groups overlap and are stretched: a customer can be 70% "bargain hunter" and 30% "loyal regular", and a cloud of points can be a tilted ellipse. A Gaussian mixture model (GMM) describes the data as a blend of normal distributions, gives each point a **probability** of belonging to each cluster, and learns elliptical shapes. It is also your first encounter with the EM algorithm, a general method used far beyond clustering.

## The model

A GMM with K components says each data point was generated in two steps: first pick a component k with probability πₖ (the **mixing weights**, which sum to 1), then draw the point from that component's normal distribution with mean μₖ and covariance matrix Σₖ. The resulting density is a weighted sum of bells:

$$
p(x) = Σ_k π_k · N(x | μ_k, Σ_k)
$$

N(x | μ, Σ) is the **multivariate normal density** from the handbook: in d dimensions,

$$
N(x | μ, Σ) = exp(−½ (x − μ)ᵀ Σ⁻¹ (x − μ)) / √((2π)^d · det(Σ))
$$

(x − μ)ᵀ Σ⁻¹ (x − μ) is a squared distance from the mean that takes the shape of the cloud into account (the Mahalanobis distance), Σ⁻¹ is the inverse of the covariance matrix and det(Σ) its determinant. In one dimension it reduces to the familiar bell with variance σ². The covariance matrix sets each component's shape: its diagonal holds variances (spread along each axis), its off-diagonal entries the covariances (tilt).

Which component generated each point is unknown: a **latent** (hidden) variable. If we knew it, fitting would be easy (compute each group's share, mean and covariance). If we knew the parameters, guessing the component would be easy (Bayes' theorem). EM alternates between the two.

## The EM algorithm

Start from initial parameters (sklearn initialises with k-means), then repeat:

**E-step** (expectation): for every point n and component k compute the **responsibility**, the posterior probability that component k generated xₙ:

$$
r_nk = π_k N(x_n | μ_k, Σ_k) / Σ_j π_j N(x_n | μ_j, Σ_j)
$$

This is Bayes' theorem: prior πₖ times likelihood, divided by the total. Each row of the responsibility matrix sums to 1.

**M-step** (maximisation): refit each component as a weighted average, with the responsibilities as weights. Let Nₖ = Σₙ rₙₖ, the "effective number of points" in component k:

$$
μ_k = (1 / N_k) Σ_n r_nk x_n
Σ_k = (1 / N_k) Σ_n r_nk (x_n − μ_k)(x_n − μ_k)ᵀ
π_k = N_k / N
$$

where N is the number of points. Each iteration never decreases the **log-likelihood** Σₙ log p(xₙ), and the loop stops when it improves by less than a tolerance (`tol`, default 0.001) or after `max_iter` iterations (default 100). Like k-means, EM finds a local optimum, so `n_init` restarts help.

### Worked example in one dimension

Data: 1, 2, 3, 5, 7, 8, 9. Two components with π = (0.5, 0.5), means 2 and 8, variances 1 and 1.

**E-step for x = 5**: it is 3 away from both means with equal variances and weights, so r = (0.5, 0.5). For x = 4 (not in our data) the densities would be N(4 | 2, 1) = 0.054 and N(4 | 8, 1) ≈ 0.0001, giving responsibilities 0.9975 and 0.0025. Points 1, 2, 3 belong to component 1 with responsibility essentially 1, and 7, 8, 9 to component 2.

**M-step for component 1**: N₁ = 1 + 1 + 1 + 0.5 + (almost 0 three times) = 3.5, so π₁ = 3.5/7 = 0.5. The mean is (1 + 2 + 3 + 0.5 × 5)/3.5 = 8.5/3.5 ≈ 2.4286: half of point 5 pulled it up from 2. The variance is the responsibility-weighted mean squared distance from 2.4286, ≈ 1.6735.

Responsibilities depend on more than distance. With weights (0.8, 0.2) instead, x = 5 gets responsibility 0.8 for component 1. With the second component's variance raised to 4, x = 5 goes 0.94 to the wider component 2: a wide bell reaches further. Your drill `d-estep` performs a full E-step and M-step.

## GMM versus k-means

K-means is a special, "hard" case: if every component has the same spherical covariance σ²I that shrinks toward 0, the responsibilities become 0 or 1 (nearest mean wins) and the M-step for μ becomes the centroid update. GMM adds:

- **soft assignments**: `predict_proba` returns the responsibilities; points with no responsibility above, say, 0.9 are genuinely ambiguous (6 of 400 in the example below);
- **elliptical clusters** of different sizes and orientations;
- a **density** estimate: `score_samples(X)` returns log p(x), and very low values flag anomalies.

The handbook's stretched-blobs example (`make_blobs(400, centers=4, cluster_std=0.6, random_state=0)`, axes flipped, multiplied by a random 2 × 2 matrix from seed 13) makes this concrete. Agreement with the true groups (adjusted Rand index, 1 = perfect):

| model | ARI |
|---|---|
| KMeans(4) | 0.813 |
| GMM, covariance_type="spherical" | 0.803 |
| GMM, "diag" | 0.852 |
| GMM, "full" | 0.987 |

## Covariance types

`covariance_type` controls the shape freedom, and so the number of parameters:

- `"full"` (**the default**; the handbook says the default is "diag", which is incorrect): each component has its own unrestricted covariance, an ellipse with any orientation.
- `"tied"`: all components share one full covariance.
- `"diag"`: axis-aligned ellipses (only variances, no covariances).
- `"spherical"`: circles, one variance per component, closest to k-means.

More freedom fits better but needs more data and can overfit; in high dimensions a full covariance has d(d + 1)/2 numbers per component.

## Choosing the number of components

Because a GMM is a probability model, you can use information criteria that reward likelihood and penalise parameters: **BIC** (Bayesian information criterion) and **AIC**. Lower is better. For the stretched blobs with full covariances:

| K | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|
| BIC | 2319.7 | 2050.3 | 1867.8 | 1672.6 | 1697.8 | 1720.0 | 1752.5 |

The minimum is at K = 4, the true number of groups. The silhouette score works too, on the hard labels from `predict`.

```
from sklearn.mixture import GaussianMixture

gmm = GaussianMixture(n_components=4, covariance_type="full", n_init=5, random_state=42).fit(X)
labels = gmm.predict(X)            # most responsible component
probs = gmm.predict_proba(X)       # responsibilities, shape (n_samples, n_components)
gmm.weights_, gmm.means_, gmm.covariances_
gmm.bic(X)
```

Scale features first when their units differ, as for k-means.

## Reading the handbook's GMM class

The from-scratch class follows the formulas above with three issues worth knowing before you copy it for homework. First, it updates each covariance with `np.cov(X.T, aweights=r[:, k], ddof=0)` and then divides by Nₖ again; `np.cov` with `aweights` already divides by the sum of the weights, so the covariances shrink every iteration. Drop the extra `1/N[k]`. Second, `predict` picks the component with the highest density N(x | μₖ, Σₖ) and ignores the weights πₖ; the posterior uses πₖ N(·). Third, it initialises by splitting the rows into consecutive chunks with `np.array_split`, so the result depends on the row order; shuffle first, or start from k-means as sklearn does. (The attribute is also spelled `n_componets` throughout; consistent, so it works.)

## Common mistakes

> **Reading `predict` as certain.** Check `predict_proba` for points near boundaries.

> **Using full covariances with few points per component.** Covariance matrices can become singular; use `"diag"` or raise `reg_covar`.

> **Forgetting it is a local optimum.** Use `n_init` > 1.

## Summary

A GMM models data as p(x) = Σ πₖ N(x | μₖ, Σₖ). EM alternates the E-step (responsibilities rₙₖ ∝ πₖ N(xₙ | μₖ, Σₖ), rows summing to 1) and the M-step (Nₖ = Σ rₙₖ; weighted means and covariances; πₖ = Nₖ/N), never decreasing the log-likelihood. It gives soft assignments, elliptical clusters and densities; k-means is its hard, spherical limit. sklearn's default covariance_type is "full"; choose K with BIC.

--- practice
@predict
A point has densities 0.05 under component 1 and 0.20 under component 2, with weights π = (0.8, 0.2). What is its responsibility for component 1? Type a decimal.
```python
a, b = 0.8 * 0.05, 0.2 * 0.20
print(round(a / (a + b), 4))
```
= 0.5
! 0.04 versus 0.04: the larger weight of component 1 exactly offsets its lower density.

@choice
What does the M-step of EM compute?
- The responsibility of each component for each point
* New weights, means and covariances, as averages weighted by the responsibilities
- The number of components
- The silhouette score
! The E-step computes responsibilities; the M-step uses them as weights to refit each Gaussian.

@predict
After an E-step, component 1 has responsibilities 1, 1, 0.5 and 0 for the points 2, 4, 6 and 10. What is its new mean?
```python
r = [1, 1, 0.5, 0]
x = [2, 4, 6, 10]
print(sum(a * b for a, b in zip(r, x)) / sum(r))
```
= 3.6
! (2 + 4 + 3)/2.5 = 9/2.5. Nₖ = 2.5 is the effective number of points.

@choice
How is k-means related to a GMM?
- They are unrelated algorithms
- A GMM is k-means with more iterations
* K-means is the limit of a GMM with equal spherical covariances shrinking to zero, which makes assignments hard
- K-means is a GMM with full covariances
! Equal tiny spherical variances make the nearest mean take responsibility 1, and the mean update becomes the centroid update.

@run
Write `normal(x, mu, var)` (the 1-D normal density) and `responsibilities(x, pi, mu, var)` returning the list of posteriors for one point, rounded to 4. Use `math.exp`, `math.sqrt` and `math.pi`.
```starter
import math

def normal(x, mu, var):
    pass

def responsibilities(x, pi, mu, var):
    pass
```
```test
print(round(normal(4, 2, 1), 4), round(normal(0, 0, 1), 4))
print(responsibilities(5, [0.5, 0.5], [2, 8], [1, 1]))
print(responsibilities(4, [0.5, 0.5], [2, 8], [1, 1]))
print(responsibilities(5, [0.5, 0.5], [2, 8], [1, 4]))
```
= 0.054 0.3989
= [0.5, 0.5]
= [0.9975, 0.0025]
= [0.0641, 0.9359]
```solution
import math

def normal(x, mu, var):
    return math.exp(-(x - mu) ** 2 / (2 * var)) / math.sqrt(2 * math.pi * var)

def responsibilities(x, pi, mu, var):
    w = [p * normal(x, m, v) for p, m, v in zip(pi, mu, var)]
    total = sum(w)
    return [round(v / total, 4) for v in w]
```
! The last test: the wider component 2 takes x = 5 even though both means are 3 away, because its bell is still high there while component 1's has fallen off.

@choice
sklearn's `GaussianMixture` uses which covariance_type by default?
* "full"
- "diag"
- "spherical"
- "tied"
! The handbook says "diag", but the default is "full", each component with its own unrestricted covariance.

@write
From memory, explain the E-step and the M-step of EM for a Gaussian mixture, and give two things a GMM can do that k-means cannot.
min: 60
```solution
In the E-step, for every point and component we compute the responsibility: the component's weight times its normal density at the point, divided by the same quantity summed over all components, so each point gets probabilities that sum to 1. In the M-step we refit every component using the responsibilities as weights: Nₖ is the sum of its responsibilities, the new mean is the responsibility-weighted mean of the points, the covariance the weighted average of the outer products of deviations, and the weight is Nₖ/N. Repeating never lowers the likelihood. Unlike k-means, a GMM gives soft membership probabilities and can model elliptical clusters with different sizes and orientations; it also gives a density, useful for anomaly detection, and BIC for choosing K.
```
! Check that you mentioned weights πₖ in the E-step and Nₖ in the M-step.

--- recall
Q: Write the GMM density.
A: p(x) = Σₖ πₖ N(x | μₖ, Σₖ), with the weights πₖ summing to 1.
Q: Write the responsibility formula.
A: rₙₖ = πₖ N(xₙ | μₖ, Σₖ) / Σⱼ πⱼ N(xₙ | μⱼ, Σⱼ).
Q: Give the M-step updates.
A: Nₖ = Σₙ rₙₖ; μₖ = Σₙ rₙₖ xₙ / Nₖ; Σₖ = Σₙ rₙₖ (xₙ − μₖ)(xₙ − μₖ)ᵀ / Nₖ; πₖ = Nₖ / N.
Q: How do you choose the number of components in a GMM?
A: Fit several K and pick the lowest BIC (or AIC); silhouette also works on hard labels.
