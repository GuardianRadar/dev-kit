package main

func merge(a map[string]interface{}, b map[string]interface{}) map[string]interface{} {
	merged := b
	for key, value := range a {
		subMergeA, okA := value.(map[string]interface{})
		subMergeB, okB := merged[key].(map[string]interface{})
		if okA && okB {
			merged[key] = merge(subMergeA, subMergeB)
		} else {
			merged[key] = value
		}
	}
	return merged
}
