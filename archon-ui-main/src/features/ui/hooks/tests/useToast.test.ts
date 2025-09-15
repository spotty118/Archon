import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createToastContext } from "../useToast";

// Mock timers for testing auto-dismiss
vi.useFakeTimers();

describe("useToast", () => {
  describe("createToastContext", () => {
    it("should provide convenience methods for different toast types", () => {
      const { result } = renderHook(() => createToastContext());

      expect(result.current.showSuccess).toBeDefined();
      expect(result.current.showError).toBeDefined();
      expect(result.current.showInfo).toBeDefined();
      expect(result.current.showWarning).toBeDefined();
    });

    it("should create success toast with showSuccess", () => {
      const { result } = renderHook(() => createToastContext());

      act(() => {
        result.current.showSuccess("Operation completed!");
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].type).toBe("success");
      expect(result.current.toasts[0].message).toBe("Operation completed!");
    });

    it("should create error toast with showError", () => {
      const { result } = renderHook(() => createToastContext());

      act(() => {
        result.current.showError("Something went wrong!");
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].type).toBe("error");
      expect(result.current.toasts[0].message).toBe("Something went wrong!");
    });

    it("should create info toast with showInfo", () => {
      const { result } = renderHook(() => createToastContext());

      act(() => {
        result.current.showInfo("Here's some information");
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].type).toBe("info");
      expect(result.current.toasts[0].message).toBe("Here's some information");
    });

    it("should create warning toast with showWarning", () => {
      const { result } = renderHook(() => createToastContext());

      act(() => {
        result.current.showWarning("Be careful!");
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].type).toBe("warning");
      expect(result.current.toasts[0].message).toBe("Be careful!");
    });

    it("should support custom duration for convenience methods", () => {
      const { result } = renderHook(() => createToastContext());

      act(() => {
        result.current.showSuccess("Quick message", 1000);
      });

      expect(result.current.toasts[0].duration).toBe(1000);
    });

    it("should auto-dismiss toasts after duration", () => {
      const { result } = renderHook(() => createToastContext());

      act(() => {
        result.current.showSuccess("Test message", 2000);
      });

      expect(result.current.toasts).toHaveLength(1);

      // Fast-forward time by 2000ms
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.toasts).toHaveLength(0);
    });
  });
});
