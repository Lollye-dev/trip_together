import { useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { toast } from "react-toastify";
import type { ToastLocationState } from "../types/toastType";

export function useToast() {
  const location = useLocation();
  const prevPathRef = useRef<string>("");

  useEffect(() => {
    const state = location.state as ToastLocationState | null;

    if (state?.toast && prevPathRef.current !== location.pathname) {
      prevPathRef.current = location.pathname;
      toast[state.toast.type](state.toast.message);
    }
  }, [location.pathname, location.state]);
}
