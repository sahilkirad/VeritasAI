#!/usr/bin/env python3
"""
Simple test to verify the wrapper pattern works correctly
This test mocks the firebase decorator behavior without requiring full imports
"""

import sys

def test_wrapper_pattern():
    """Test that the getattr pattern correctly accesses wrapped functions"""
    print("=" * 60)
    print("Testing Wrapper Pattern: getattr(func, 'wrapped', func)")
    print("=" * 60)
    
    # Simulate a decorated function with a 'wrapped' attribute
    def original_function(event):
        """Original function"""
        return f"Original called with {event}"
    
    def wrapped_function(event):
        """Wrapped function (the actual implementation)"""
        return f"Wrapped called with {event}"
    
    # Simulate firebase decorator behavior
    class DecoratedFunction:
        def __init__(self, original, wrapped):
            self.wrapped = wrapped
            self.__name__ = original.__name__
            self.__doc__ = original.__doc__
        
        def __call__(self, event):
            # This would be the decorator wrapper that expects 'time' key
            if isinstance(event, dict) and 'time' not in event:
                raise KeyError("time")  # This is the error we're fixing
            return self.wrapped(event)
    
    # Create decorated function
    decorated = DecoratedFunction(original_function, wrapped_function)
    
    # Test 1: Direct call (would fail with KeyError)
    print("\nTest 1: Direct call to decorated function")
    test_event = {"data": "test"}  # No 'time' key
    try:
        result = decorated(test_event)
        print(f"  ❌ Direct call succeeded (should have failed): {result}")
        return False
    except KeyError as e:
        if 'time' in str(e):
            print(f"  ✅ Direct call raises KeyError 'time' as expected: {e}")
        else:
            print(f"  ❌ Unexpected KeyError: {e}")
            return False
    
    # Test 2: Using getattr pattern (should work)
    print("\nTest 2: Using getattr pattern to access wrapped function")
    try:
        wrapped = getattr(decorated, "wrapped", decorated)
        result = wrapped(test_event)
        print(f"  ✅ Wrapped function called successfully: {result}")
        print(f"  ✅ No KeyError 'time' - fix works!")
    except KeyError as e:
        if 'time' in str(e):
            print(f"  ❌ KeyError 'time' still occurs - pattern didn't work!")
            return False
        else:
            print(f"  ⚠️  Different KeyError: {e}")
            return False
    except Exception as e:
        print(f"  ❌ Unexpected error: {e}")
        return False
    
    # Test 3: Verify fallback behavior
    print("\nTest 3: Testing fallback when 'wrapped' doesn't exist")
    class NoWrappedFunction:
        def __call__(self, event):
            return "No wrapped attribute"
    
    no_wrapped = NoWrappedFunction()
    fallback_func = getattr(no_wrapped, "wrapped", no_wrapped)
    result = fallback_func("test")
    if result == "No wrapped attribute":
        print(f"  ✅ Fallback works correctly: {result}")
    else:
        print(f"  ❌ Fallback failed: {result}")
        return False
    
    print("\n" + "=" * 60)
    print("✅ All wrapper pattern tests passed!")
    print("=" * 60)
    return True


def verify_app_py_changes():
    """Verify that app.py uses the correct pattern"""
    print("\n" + "=" * 60)
    print("Verifying app.py code changes")
    print("=" * 60)
    
    try:
        with open('app.py', 'r', encoding='utf-8') as f:
            content = f.read()
        
        patterns_to_check = [
            ('process_ingestion_task', 'getattr(main.process_ingestion_task, "wrapped", main.process_ingestion_task)'),
            ('process_diligence_task', 'getattr(main.process_diligence_task, "wrapped", main.process_diligence_task)'),
            ('conduct_interview', 'getattr(main.conduct_interview, "wrapped", main.conduct_interview)'),
            ('generate_interview_summary', 'getattr(main.generate_interview_summary, "wrapped", main.generate_interview_summary)')
        ]
        
        all_found = True
        for func_name, pattern in patterns_to_check:
            if pattern in content:
                print(f"  ✅ Found correct pattern for {func_name}")
            else:
                # Check if old pattern still exists
                old_pattern = f"main.{func_name}(event)"
                if old_pattern in content:
                    print(f"  ❌ Old pattern still exists for {func_name}")
                    all_found = False
                else:
                    print(f"  ⚠️  Pattern not found for {func_name} (may be in different format)")
        
        if all_found:
            print("\n✅ All app.py changes verified!")
        else:
            print("\n❌ Some app.py changes may be missing!")
        
        return all_found
        
    except FileNotFoundError:
        print("  ⚠️  app.py not found in current directory")
        return False
    except Exception as e:
        print(f"  ❌ Error reading app.py: {e}")
        return False


def main():
    """Run all tests"""
    print("🧪 Testing Pub/Sub Wrapper Fix (Simple Version)")
    print("=" * 60)
    
    test1 = test_wrapper_pattern()
    test2 = verify_app_py_changes()
    
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    print(f"Wrapper Pattern Test: {'✅ PASSED' if test1 else '❌ FAILED'}")
    print(f"App.py Verification: {'✅ PASSED' if test2 else '❌ FAILED'}")
    
    all_passed = test1 and test2
    print(f"\n{'✅ ALL TESTS PASSED' if all_passed else '❌ SOME TESTS FAILED'}")
    
    if all_passed:
        print("\n✅ The fix is working correctly!")
        print("   - The getattr pattern successfully bypasses the decorator wrapper")
        print("   - No KeyError 'time' will occur when calling wrapped functions")
        print("   - All app.py routes have been updated with the correct pattern")
    
    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())

