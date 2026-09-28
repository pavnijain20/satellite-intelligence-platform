# Change Detection & False-Alarm Suppression

This module performs multi-temporal satellite image change analysis and false-alarm suppression.

## Main Features

- Before/after satellite image comparison
- Change percentage calculation
- Change mask generation
- Spatial consistency analysis
- Temporal persistence analysis
- False-alarm checks
- Cloud/haze and shadow checks
- Misalignment/registration checks
- No-data/data-quality checks
- Seasonal change consideration
- Change category estimation
- Evidence-level assessment
- Confidence score generation
- Latitude/longitude mapping
- JSON and CSV output

## Change Categories

- CONSTRUCTION
- ROAD_INFRASTRUCTURE
- VEGETATION_LOSS
- VEGETATION_GAIN
- WATER
- VEHICLE_OR_ACTIVITY
- UNKNOWN

## Output

The main output is:

`change_detection_results.csv`

It contains change analysis results for 1920 tile-pair comparisons.

Important output fields include:

- change_percent
- false_alarm_class
- false_alarm_reason
- spatial_status
- persistence_status
- supported_change_intervals
- evidence_level
- confidence_score
- change_category
- lat
- lon
- change_mask_path

## Important Limitation

The current module is optimized for meaningful area-level changes in satellite imagery.

Small-object activity such as individual vehicles may not be reliably detected at the available imagery resolution and should be treated as an uncertain indication requiring analyst review.

Confidence scores are model/heuristic evidence scores and should not be interpreted as absolute probability or validated accuracy.

## Running the Notebook

The notebook was developed and tested in Google Colab.

Input satellite data and generated mask paths may need to be changed when running in another environment.
