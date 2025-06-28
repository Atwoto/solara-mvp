// /src/lib/serviceOptions.ts

// This array is the single source of truth for all possible services.
// 'value' is what's stored in the database as the 'slug'.
// 'label' is the human-readable text shown in the dropdown.
export const serviceOptions = [
  { value: 'water-pump-installation', label: 'Water Pump Installation' },
  { value: 'industrial-solar-solutions', label: 'Industrial Solar Solutions' },
  { value: 'commercial-solar-solutions', label: 'Commercial Solar Solutions' },
  { value: 'residential-power-backup-systems', label: 'Residential Power Backup Systems' },
  { value: 'residential-solar-hybrid-8kw', label: 'Residential Solar Hybrid 8kW' },
  { value: 'residential-solar-hybrid-5kw', label: 'Residential Solar Hybrid 5kW' },
  { value: 'residential-solar-hybrid-3kw', label: 'Residential Solar Hybrid 3kW' },
];

/**
 * A helper function to find the human-readable label for a given service value (slug).
 * @param value The slug of the service (e.g., 'water-pump-installation').
 * @returns The display label (e.g., 'Water Pump Installation') or a default string.
 */
export const getServiceLabel = (value: string | null | undefined): string => {
    if (!value) return 'Unknown Service';
    return serviceOptions.find(opt => opt.value === value)?.label || value;
}