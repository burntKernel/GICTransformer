# pyrefly: ignore [missing-import]
import numpy as np

def calculate_hss(hits, misses, false_alarms, correct_negatives):
    """
    Calculates Heidke Skill Score (HSS).
    """
    total = hits + misses + false_alarms + correct_negatives
    if total == 0:
        return 0.0
        
    expected_hits = ((hits + misses) * (hits + false_alarms)) / total
    expected_cn = ((correct_negatives + misses) * (correct_negatives + false_alarms)) / total
    
    numerator = (hits + correct_negatives) - (expected_hits + expected_cn)
    denominator = total - (expected_hits + expected_cn)
    
    if denominator == 0:
        return 0.0
    return numerator / denominator

def evaluate_risk(y_true, y_pred, threshold=1.0):
    """
    Evaluates GIC risk warnings based on a geoelectric field threshold.
    """
    # Exceedance events
    true_events = (y_true >= threshold)
    pred_events = (y_pred >= threshold)
    
    hits = np.sum(true_events & pred_events)
    misses = np.sum(true_events & ~pred_events)
    false_alarms = np.sum(~true_events & pred_events)
    correct_negatives = np.sum(~true_events & ~pred_events)
    
    hss = calculate_hss(hits, misses, false_alarms, correct_negatives)
    
    return {
        'hits': hits,
        'misses': misses,
        'false_alarms': false_alarms,
        'correct_negatives': correct_negatives,
        'hss': hss
    }
