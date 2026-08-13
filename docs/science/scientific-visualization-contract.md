# Scientific visualization contract

Every visual shown by The Planetary Atlas must be accompanied by a visible
classification and a machine-readable record before publication.

## Evidence classes

| Label | Meaning | May it imply a visible planet surface? |
| --- | --- | --- |
| Observed imagery | Directly acquired image data. | Only what the instrument resolves. |
| Instrument data product | A calibrated light curve, spectrum, map, or pipeline product. | No; it is data, not an appearance. |
| Scientific simulation | A reproducible model with documented equations and inputs. | Only if the simulated quantity is explicit. |
| Deterministic derived view | A reproducible transformation of cited measurements. | No unmeasured texture or geography. |
| Artist concept | Human-created explanatory art. | Yes, only with an illustrative label. |
| AI-assisted concept | Art materially assisted by generative AI. | Yes, only with an illustrative label and disclosure. |

## Required visual record

Each visual record must include:

1. Evidence class and short public-facing label.
2. Planet, host-star, source dataset, query/version, and retrieval date.
3. Measured inputs and units; `NULL` inputs remain unknown.
4. Derived quantities, method/version, and reproducibility location where applicable.
5. Assumptions, excluded phenomena, and uncertainty/confidence statement.
6. Creator, toolchain (including AI use), rights/credit, and review status.

`High`, `medium`, and `low` confidence describe confidence in the *specific
displayed quantity*, never a claim about life, habitability, or appearance.

## Approval path

1. **Author** prepares the required visual record and explanatory copy.
2. **Scientific reviewer** verifies inputs, assumptions, labels, and claims.
3. **Editorial reviewer** verifies understandable wording, credits, and
placement of caveats.
4. Only a visual with both approvals may be marked `published`; otherwise it
is `draft` or `withheld`.

## UI rules

- The label is adjacent to the visual, not hidden in a tooltip.
- Observed imagery, data products, and artist/AI concepts must never share the
  same generic “image” label.
- Mission spacecraft art and system-wide art must say so; neither is
  target-specific art unless the source confirms it.
- The UI must link the full visual record wherever a visual supports a
  scientific interpretation.
