# KeyError 'time' Fix Analysis

## Problem
The firebase decorator wrapper expects `event["time"]` but the mock events don't consistently provide it via dict-style access.

## Attempted Solutions

### 1. Using `"wrapped"` attribute ❌
- **Result**: Still calls the decorator wrapper
- **Evidence**: Logs show `on_message_published_wrapped` is still being called
- **Reason**: The `"wrapped"` attribute IS the decorator wrapper, not the original function

### 2. Using `__wrapped__` attribute ❌
- **Not tested yet** - may not exist on firebase decorator

### 3. Helper function to extract underlying function ⚠️
- **Status**: Implemented but may not work if decorator doesn't store original function accessibly
- **Approach**: Checks multiple attributes and closure cells

### 4. Ensuring MockCloudEvent works with decorator ✅
- **Status**: MockCloudEvent already inherits from dict and has "time" key
- **Issue**: Decorator might be accessing event in a way that doesn't work

## Current Implementation

The code now:
1. Uses `get_underlying_function()` helper to try to extract the original function
2. Falls back to calling the decorated function if extraction fails
3. MockCloudEvent has "time" in dict and as attribute

## Root Cause Analysis

Looking at the error:
```
File "/usr/local/lib/python3.11/site-packages/firebase_functions/pubsub_fn.py", line 109, in _message_handler
    if "." not in event_dict["time"]:
                  ~~~~~~~~~~^^^^^^^^
KeyError: 'time'
```

The decorator is:
1. Converting the event to a dict: `event_dict = dict(event)` or similar
2. Accessing `event_dict["time"]`
3. Failing because "time" is not in the resulting dict

## Possible Issues

1. **Dict conversion not working**: When `dict(event)` is called on MockCloudEvent, it might not include "time"
2. **Decorator using vars()**: If decorator uses `vars(event)`, it might not include dict keys
3. **Decorator accessing differently**: The decorator might be accessing the event in a way we haven't accounted for

## Next Steps

1. **Test the get_underlying_function helper** - see if it can extract the original function
2. **Inspect decorator internals** - find where original function is stored
3. **Ensure MockCloudEvent dict conversion works** - test `dict(event)` includes "time"
4. **Alternative**: Refactor main.py to separate implementation from decorator

## Recommended Solution

The best long-term solution (as mentioned in original instructions) is to:
1. Refactor main.py: Move business logic into plain functions (e.g., `_process_ingestion_task_impl(event_or_data)`)
2. Keep firebase-decorated functions as thin adapters that call the impl
3. Flask routes call the impl directly

This avoids the decorator entirely and is cleaner architecture.

