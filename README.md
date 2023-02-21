# howrse.tools

[howrse.tools](https://www.howrse.tools/) is a quick tool to simplify game calculations for the main parts of breeding.

<br />

---
### Maximum Total Skills
---
To calculate the maximum possible total skills a horse can achieve,

`Max skills = 60 + IBS + GP + 2(LPV * LC)`

|Component|Function|
| --- | --- |
|`60`|Maximum skills gained after finishing foal games|
|`IBS`|Inborn skill value of the foal before any foal games|
|`GP`|GP value of the foal|
|`LPV`|Value multiplier of the lessons:<br />`0.214 + (lessonPrice - 31) * 0.00124138`|
|`LC`|Number of lessons completed during horses trainable life:<br />Default: `140`<br />Maximum pieces of cloud: `+40`<br />Water of youth given at 2 years old: `x2`<br />Final value: `-1`<br />(LC is `139` with no WOY/POC, up to `357` with both)|

<br />

---
### Inborn Skills (IBS) of foals
---
Expected IBS range for a foal based on parents GP and BLUP values at time of conception.

`IBS = FoalGP * ((DamBLUP + SireBLUP) / 1000)` [x1.5 if using aphrodite's tears]

Value has a 4% variance

<br />

---
### Genetic Potential (GP) of foals
---

This is calculated using the GP approximation formula I discovered in 2014.

The premise is that GP gains scale according to how far away you are from the highest GP on the server. Horses at the highest GP for the server see very small/minimal gains, ranging from `0.1 - 1.0` though based on factors I haven't figured out.

`GP = p + m(u + ((t - p) / 100))`

|Component|Function|
| --- | --- |
|`p`|Parents average GP: `(DamGP + SireGP) / 2`|
|`b`|Parents average BLUP: `(DamBLUP + SireBLUP) / 2`|
|`m`|BLUP multiplier for GP gain: `(b + 100)^2 / 40000`|
|`t`|Highest GP on the server|
|`u`|Minimum GP gain (ie `0.5`, seen in the highest GP horses on a server)|