"use client";
import { useEffect, useRef, useState } from 'react';

type Props = {
  value: string;
  onChange: (address: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  required?: boolean;
  onFocus?: (e: React.FocusEvent) => void;
  onBlur?: (e: React.FocusEvent) => void;
};

const GOOGLE_MAPS_KEY = typeof window !== 'undefined'
  ? (window as any).__NEXT_DATA__?.props?.pageProps?.googleMapsKey
    || process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY
    || ''
  : '';

let googleLoaded = false;
let googleLoading = false;
const loadCallbacks: (() => void)[] = [];

function loadGoogleMaps(callback: () => void) {
  if (googleLoaded) { callback(); return; }
  loadCallbacks.push(callback);
  if (googleLoading) return;
  if (!GOOGLE_MAPS_KEY) { callback(); return; }
  googleLoading = true;
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places&language=de&region=CH`;
  script.async = true;
  script.onload = () => {
    googleLoaded = true;
    loadCallbacks.forEach(cb => cb());
    loadCallbacks.length = 0;
  };
  script.onerror = () => {
    googleLoading = false;
    loadCallbacks.forEach(cb => cb());
    loadCallbacks.length = 0;
  };
  document.head.appendChild(script);
}

export default function AddressAutocomplete({ value, onChange, placeholder, style, required, onFocus, onBlur }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!GOOGLE_MAPS_KEY) return;
    loadGoogleMaps(() => {
      setReady(true);
      if (inputRef.current && (window as any).google?.maps?.places) {
        const ac = new (window as any).google.maps.places.Autocomplete(inputRef.current, {
          types: ['address'],
          componentRestrictions: { country: 'ch' },
          fields: ['formatted_address'],
        });
        ac.addListener('place_changed', () => {
          const place = ac.getPlace();
          if (place?.formatted_address) {
            onChange(place.formatted_address);
          }
        });
        autocompleteRef.current = ac;
      }
    });
    return () => {
      if (autocompleteRef.current) {
        (window as any).google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder || 'Adresse eingeben...'}
      style={style}
      required={required}
      onFocus={onFocus}
      onBlur={onBlur}
      autoComplete="off"
    />
  );
}
