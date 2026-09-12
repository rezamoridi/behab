// src/features/farm-registration/hooks/useDraggableWindow.js
import { useState, useRef, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'farm_window_position_v2';

const DEFAULT_CONFIG = {
  width: 720,
  height: 640,
  minWidth: 500,
  minHeight: 400,
  margin: 16,
};

/**
 * هوک مدیریت درگ پنجره شناور
 */
export const useDraggableWindow = ({
  isOpen,
  config = DEFAULT_CONFIG,
  persistPosition = true,
} = {}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const windowRef = useRef(null);
  const headerRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const positionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  const getDefaultPosition = useCallback(() => {
    if (typeof window === 'undefined') return { x: 0, y: 0 };
    const x = Math.max(config.margin, (window.innerWidth - config.width) / 2);
    const y = 60;
    return { x, y };
  }, [config.margin, config.width]);

  const loadPosition = useCallback(() => {
    if (!persistPosition) return getDefaultPosition();

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return getDefaultPosition();

      const parsed = JSON.parse(saved);
      const maxX = Math.max(0, window.innerWidth - config.width);
      const maxY = Math.max(0, window.innerHeight - 100);

      return {
        x: Math.max(0, Math.min(parsed.x ?? 0, maxX)),
        y: Math.max(0, Math.min(parsed.y ?? 0, maxY)),
      };
    } catch {
      return getDefaultPosition();
    }
  }, [persistPosition, getDefaultPosition, config.width]);

  const savePosition = useCallback(
    (pos) => {
      if (!persistPosition) return;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
      } catch {
        // ignore
      }
    },
    [persistPosition]
  );

  useEffect(() => {
    if (isOpen) setPosition(loadPosition());
  }, [isOpen, loadPosition]);

  const handleDragStart = useCallback((e) => {
    if (!headerRef.current?.contains(e.target)) return;
    if (e.target.closest('button, input, select, textarea, a')) return;

    e.preventDefault();

    const rect = windowRef.current?.getBoundingClientRect();
    if (!rect) return;

    dragOffsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    setIsDragging(true);
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const newX = e.clientX - dragOffsetRef.current.x;
      const newY = e.clientY - dragOffsetRef.current.y;

      const maxX = Math.max(0, window.innerWidth - config.width);
      const maxY = Math.max(0, window.innerHeight - 100);

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      savePosition(positionRef.current);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, config.width, savePosition]);

  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      const maxX = Math.max(0, window.innerWidth - config.width);
      const maxY = Math.max(0, window.innerHeight - 100);

      setPosition((prev) => ({
        x: Math.max(0, Math.min(prev.x, maxX)),
        y: Math.max(0, Math.min(prev.y, maxY)),
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, config.width]);

  useEffect(() => {
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, []);

  return {
    position,
    isDragging,
    windowRef,
    headerRef,
    handleDragStart,
    config,
  };
};