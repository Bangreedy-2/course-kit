=== kmeans | unsup | 8 | K-means clustering and the silhouette score | d-kmeans, d-silhouette
@@ About 30 min reading · Handbook chapter 14 · Homework 10 and 11
## Why this matters

Most data has no labels. Clustering finds groups of similar rows anyway: customer segments for a marketing campaign (the handbook's mall customers example), types of patients, families of products. K-means is the workhorse: simple, fast and the baseline every other clustering method is compared with. Because there is no "correct answer" to score against, you also need a way to judge a clustering, and that is the silhouette score.

## The goal

K-means splits n points into k clusters, each represented by its **centroid** (the mean of its points). It looks for the assignment that minimises the **inertia**, also called the within-cluster sum of squares:

$$
inertia = Σ_i ‖x_i − μ_c(i)‖²
$$

where μ_c(i) is the centroid of the cluster that point i belongs to and ‖·‖² the squared Euclidean distance. A good k-means solution has two properties: each centroid is the mean of its points, and each point is closer to its own centroid than to any other.

## Lloyd's algorithm

1. **Initialise**: choose k starting centroids.
2. **Assign** (the E-step in the handbook's language): put every point in the cluster of its nearest centroid.
3. **Update** (the M-step): move each centroid to the mean of its assigned points.
4. Repeat 2 and 3 until the assignments stop changing.

Each step can only lower the inertia (or leave it unchanged), so the algorithm always stops, but at a **local** minimum that depends on the starting centroids.

### Worked example

Six points: A(1, 1), B(1, 2), C(2, 1), D(8, 8), E(8, 9), F(9, 8), k = 2, with a deliberately poor start: centroids at A(1, 1) and B(1, 2).

- **Assign**: A goes to centroid 0 (distance 0). B goes to centroid 1. C(2, 1) is at squared distance 1 from (1, 1) and 2 from (1, 2), so centroid 0. D, E and F are all slightly closer to (1, 2) than to (1, 1) (for D: 49 + 36 = 85 versus 49 + 49 = 98), so centroid 1. Clusters: {A, C} and {B, D, E, F}.
- **Update**: centroid 0 = mean of A and C = (1.5, 1). Centroid 1 = mean of B, D, E, F = (26/4, 27/4) = (6.5, 6.75).
- **Assign**: B is now at squared distance 0.25 + 1 = 1.25 from (1.5, 1) and about 52.8 from (6.5, 6.75), so it moves to cluster 0. Clusters: {A, B, C} and {D, E, F}.
- **Update**: centroids (1.333, 1.333) and (8.333, 8.333).
- **Assign**: nothing changes. Stop.

Inertia: in each cluster the squared distances are 2/9, 5/9 and 5/9, totalling 4/3, so 8/3 ≈ 2.667 overall. Your drill `d-kmeans` implements exactly this loop.

## Initialisation and n_init

A bad start can converge to a bad local minimum, for example two centroids sharing one real group while another centroid covers two groups. (The handbook demonstrates this by "changing the random seed", although its second call reuses the same default seed; pass `rseed=` explicitly to reproduce it.) Two defences, both in sklearn:

- **k-means++** (default `init="k-means++"`): pick the first centroid at random, then pick each next one with probability proportional to its squared distance from the nearest centroid chosen so far, so starting centroids are spread out.
- **n_init**: run the whole algorithm several times from different starts and keep the run with the lowest inertia. The handbook says the default is 10; since sklearn 1.4 it is `"auto"` (one run with k-means++). Set `n_init=10` for more robust results.

## Scaling and other assumptions

K-means uses Euclidean distance, so a feature in thousands (annual income) will dominate one in tens (age). Standardise first, as the handbook does for the mall data, and use `scaler.inverse_transform(kmeans.cluster_centers_)` to read the centroids in original units.

K-means also assumes clusters are roughly round (spherical), similar in size and separated by straight boundaries. On the two interleaved half-moons of `make_moons(500, noise=0.06)`, k-means with k = 2 cuts straight across both moons: its agreement with the true moons, measured by the adjusted Rand index (1 = perfect, 0 = chance), is only 0.257. `SpectralClustering` or `DBSCAN` follow such shapes; Gaussian mixtures (next lesson) handle elongated ellipses.

## Choosing k

K-means will happily find any k you ask for. Two common guides:

**Elbow method**: plot inertia against k. Inertia always falls as k grows (with k = n it is 0), so look for the "elbow" where extra clusters stop paying off. On the handbook's `make_blobs(n_samples=420, centers=3, cluster_std=0.4, random_state=0)` data:

| k | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| inertia | 1922.5 | 715.9 | 130.1 | 113.4 | 98.4 | 84.5 |
| silhouette | | 0.623 | 0.775 | 0.620 | 0.470 | 0.324 |

The drop from 2 to 3 is huge, from 3 to 4 small: the elbow is at 3.

**Silhouette score**: for each point i,

- a(i) = mean distance from i to the other points of its own cluster (how tight its cluster is),
- b(i) = mean distance from i to the points of the **nearest other** cluster, taking the smallest such mean over all other clusters,

$$
s(i) = (b(i) − a(i)) / max(a(i), b(i))
$$

s(i) ranges from −1 to 1: near 1 means well inside its cluster and far from others; near 0, on a border; negative, probably in the wrong cluster. A point alone in its cluster gets 0. The **silhouette score** is the mean s(i) over all points (`sklearn.metrics.silhouette_score`); `silhouette_samples` gives each s(i). It needs 2 ≤ k ≤ n − 1. In the table, k = 3 has the highest silhouette (0.775), agreeing with the elbow.

For the six-point example with clusters {A, B, C} and {D, E, F}, every point has a small a and a large b, so the score is close to 1 (your drill `d-silhouette` checks it).

Silhouette plots (the handbook's `draw_silhouette_plot`) show each cluster's sorted s(i) values as a horizontal band: look for bands that reach past the average line, similar sizes and no negative values, the three criteria the handbook uses to pick 4 clusters for the mall customers.

## In sklearn

```
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score

X = StandardScaler().fit_transform(df[["Age", "Annual Income (k$)", "Spending Score (1-100)"]])
for k in range(2, 9):
    km = KMeans(n_clusters=k, n_init=10, random_state=0).fit(X)
    print(k, round(km.inertia_, 1), round(silhouette_score(X, km.labels_), 3))
```

Useful attributes: `labels_` (cluster of each training point), `cluster_centers_`, `inertia_`, `n_iter_`; `predict(new_X)` assigns new points to the nearest centroid. `MiniBatchKMeans` updates centroids from small random batches, the speed fix the handbook mentions for large data.

Interpreting clusters is the real deliverable: describe each centroid in original units ("younger, high income, high spending") and check the cluster sizes.

## Common mistakes

> **Not scaling features.** The largest-range feature decides the clusters.

> **Comparing inertia across different k to pick the "best" k.** It always decreases; use the elbow or silhouette.

> **Treating cluster numbers as meaningful.** Label 0 in one run may be label 2 in another.

## Summary

K-means minimises inertia Σ‖x − μ‖² by alternating "assign to nearest centroid" and "move centroid to mean" until assignments stop changing. It finds a local minimum, so use k-means++ and n_init. Scale features; expect round, similar-sized clusters. Choose k with the elbow of the inertia curve and with the silhouette score, the mean of (b − a)/max(a, b), where a is the mean distance within the point's cluster and b the mean distance to the nearest other cluster.

--- practice
@predict
Cluster {(0, 0), (2, 0), (1, 3)} has centroid (1, 1). What is its contribution to the inertia?
```python
pts = [(0, 0), (2, 0), (1, 3)]
print(sum((x - 1) ** 2 + (y - 1) ** 2 for x, y in pts))
```
= 8
! Squared distances 2, 2 and 4, total 8. Inertia uses squared distances, not distances.

@choice
Why does sklearn run k-means several times (n_init) or use k-means++?
- To find the correct value of k
* Because the algorithm converges to a local minimum that depends on the starting centroids
- Because one run is not guaranteed to stop
- To scale the features
! Each run always stops, but possibly at a poor solution; more starts, or spread-out starts, make a good one more likely.

@predict
A point has a = 2 (mean distance within its cluster) and b = 5 (mean distance to the nearest other cluster). What is its silhouette value?
```python
a, b = 2, 5
print((b - a) / max(a, b))
```
= 0.6
! (5 − 2)/5. If a were larger than b, the value would be negative.

@choice
Inertia falls from 1922 (k=1) to 716 (k=2) to 130 (k=3), then to 113, 98 and 85. Which k does the elbow method suggest?
- 1
- 2
* 3
- 6, because inertia is lowest
! The big gains stop after k = 3. Inertia always decreases with k, so its minimum is never the answer.

@run
Write `assign(X, centers)` returning, for each point, the index of the nearest center (squared Euclidean distance; ties go to the lower index), and `update(X, labels, k)` returning the new centers as the mean of each cluster's points, rounded to 3 (assume no cluster is empty).
```starter
def assign(X, centers):
    pass

def update(X, labels, k):
    pass
```
```test
X = [[1, 1], [1, 2], [2, 1], [8, 8], [8, 9], [9, 8]]
lab = assign(X, [[1, 1], [1, 2]])
print(lab)
c = update(X, lab, 2)
print(c)
lab = assign(X, c)
print(lab, update(X, lab, 2))
```
= [0, 1, 0, 1, 1, 1]
= [[1.5, 1.0], [6.5, 6.75]]
= [0, 0, 0, 1, 1, 1] [[1.333, 1.333], [8.333, 8.333]]
```solution
def assign(X, centers):
    labels = []
    for x in X:
        d = [sum((a - b) ** 2 for a, b in zip(x, c)) for c in centers]
        labels.append(d.index(min(d)))
    return labels

def update(X, labels, k):
    centers = []
    for j in range(k):
        pts = [x for x, l in zip(X, labels) if l == j]
        centers.append([round(sum(col) / len(pts), 3) for col in zip(*pts)])
    return centers
```
! These are the lesson's first two iterations. `d.index(min(d))` returns the first minimum, which gives ties to the lower index.

@choice
You cluster customers on age (20 to 70) and annual income (15,000 to 140,000) without scaling. What happens?
- Nothing; k-means is scale-invariant
* Income dominates the distances, so the clusters are essentially income bands
- Age dominates because it has fewer distinct values
- The algorithm fails to converge
! Squared differences in income are millions of times larger than in age. Standardise first.

@write
From memory, describe the two alternating steps of k-means, what quantity they reduce, and how the silhouette score of a single point is computed and interpreted.
min: 60
```solution
K-means starts from k centroids and alternates two steps: assign every point to its nearest centroid, then move every centroid to the mean of the points assigned to it. Both steps can only reduce the inertia, the sum of squared distances from points to their centroids, and the loop stops when assignments no longer change. For one point, a is its mean distance to the other points in its cluster and b is its mean distance to the points of the nearest other cluster; the silhouette is (b − a)/max(a, b). Close to 1 means the point is well inside its cluster, around 0 means it is on a border, and negative means it is probably in the wrong cluster.
```
! Check that you said "mean distance" for both a and b, and "nearest other cluster" for b.

--- recall
Q: What does k-means minimise?
A: Inertia: the sum of squared distances from each point to its cluster centroid.
Q: What are the two steps of Lloyd's algorithm?
A: Assign each point to the nearest centroid; move each centroid to the mean of its points. Repeat until assignments stop changing.
Q: Write the silhouette of a point.
A: s = (b − a)/max(a, b); a = mean intra-cluster distance, b = mean distance to the nearest other cluster.
Q: What do k-means++ and n_init protect against?
A: Bad local minima caused by poor starting centroids.
