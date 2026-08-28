import { useCallback, useEffect, useRef, useState } from 'react';
import type { CvData, SavedState } from '@/types/cv';
import { STORAGE_KEY } from '@/types/cv';
import { createEmptyCv } from '@/lib/cv-data';

function isValidCv(value: unknown): value is CvData {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    !!v.personal &&
    typeof v.personal === 'object' &&
    Array.isArray(v.experience) &&
    Array.isArray(v.education) &&
    Array.isArray(v.skills) &&
    Array.isArray(v.languages) &&
    Array.isArray(v.certifications) &&
    Array.isArray(v.projects) &&
    Array.isArray(v.referees) &&
    Array.isArray(v.interests) &&
    Array.isArray(v.customSections) &&
    !!v.settings &&
    typeof v.settings === 'object'
  );
}

function loadCv(): CvData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyCv();
    const parsed = JSON.parse(raw) as SavedState | CvData;
    const cv = (parsed as SavedState).cv ?? (parsed as CvData);
    if (isValidCv(cv)) return cv;
    return createEmptyCv();
  } catch {
    return createEmptyCv();
  }
}

export function useCvStore() {
  const [cv, setCv] = useState<CvData>(() => loadCv());
  const [savedAt, setSavedAt] = useState<string>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SavedState | CvData;
        return (parsed as SavedState).updatedAt ?? new Date().toISOString();
      }
    } catch {
      /* ignore */
    }
    return '';
  });

  // Debounced autosave
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      try {
        const state: SavedState = { cv, updatedAt: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        setSavedAt(state.updatedAt);
      } catch {
        /* storage may be full or disabled */
      }
    }, 500);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [cv]);

  const resetCv = useCallback(() => {
    setCv(createEmptyCv());
  }, []);

  const loadSample = useCallback((sample: CvData) => {
    setCv(sample);
  }, []);

  return { cv, setCv, savedAt, resetCv, loadSample };
}
