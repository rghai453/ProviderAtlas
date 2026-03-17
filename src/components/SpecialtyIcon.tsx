import { cn } from '@/lib/utils';

interface SpecialtyIconProps {
  specialty: string;
  className?: string;
}

interface IconDefinition {
  paths: string[];
  viewBox?: string;
  strokeWidth?: number;
}

function getIconDefinition(specialty: string): IconDefinition {
  const s = specialty.toLowerCase();

  if (s.includes('cardio')) {
    // Heart
    return {
      paths: [
        'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
      ],
    };
  }

  if (s.includes('neuro')) {
    // Brain (simplified)
    return {
      paths: [
        'M9.5 2a2.5 2.5 0 0 1 2.5 2.5V5h1a2.5 2.5 0 0 1 0 5h-.5v2h.5a2.5 2.5 0 0 1 0 5H12v.5a2.5 2.5 0 0 1-5 0V19H6.5a2.5 2.5 0 0 1 0-5H7v-2h-.5a2.5 2.5 0 0 1 0-5H7v-.5A2.5 2.5 0 0 1 9.5 2z',
        'M14.5 2a2.5 2.5 0 0 0-2.5 2.5V5h-1',
      ],
    };
  }

  if (s.includes('orthop')) {
    // Bone
    return {
      paths: [
        'M18.5 3.5a2.121 2.121 0 0 1 0 3l-11 11a2.121 2.121 0 0 1-3-3l11-11a2.121 2.121 0 0 1 3 0z',
        'M5.5 5.5 3 8',
        'M18.5 18.5 21 16',
        'M5.5 18.5 3 16',
        'M18.5 5.5 21 8',
      ],
    };
  }

  if (s.includes('pediatr')) {
    // Child/person with smaller frame
    return {
      paths: [
        'M12 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
        'M9 10h6l1 7h-2l-.5-3h-3L10 17H8l1-7z',
        'M9.5 14.5S10 18 12 18s2.5-3.5 2.5-3.5',
      ],
    };
  }

  if (s.includes('dermat')) {
    // Hand outline
    return {
      paths: [
        'M18 11V7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v-.5a2 2 0 0 0-2-2 2 2 0 0 0-2 2V7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v4l-.5 1.5A3 3 0 0 0 7 16v1a4 4 0 0 0 4 4h3a5 5 0 0 0 5-5v-5z',
      ],
    };
  }

  if (s.includes('psych') || s.includes('mental')) {
    // Head with thought bubble / mind
    return {
      paths: [
        'M12 2a7 7 0 1 0 0 14 7 7 0 0 0 0-14z',
        'M12 16v6',
        'M9 19h6',
        'M9.5 8.5c.5-1.5 3-1.5 3 0 0 2-3 1.5-3 4',
        'M12 15h.01',
      ],
    };
  }

  if (s.includes('dental') || s.includes('dentist')) {
    // Tooth
    return {
      paths: [
        'M12 2c-2.5 0-5 1.5-5 4 0 .9.2 1.7.5 2.4C8 9.7 8 11 8 12c0 2.8.8 7 2.5 9.5.5.7 1 1 1.5 1s1-.3 1.5-1C15.2 19 16 14.8 16 12c0-1 0-2.3.5-3.6.3-.7.5-1.5.5-2.4 0-2.5-2.5-4-5-4z',
      ],
    };
  }

  if (s.includes('ophthal') || s.includes('optom') || s.includes('eye')) {
    // Eye
    return {
      paths: [
        'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z',
        'M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0',
      ],
    };
  }

  if (s.includes('surg')) {
    // Scalpel (simplified scissors-like)
    return {
      paths: [
        'M20 7l-8.5 8.5',
        'M4 4l3.5 3.5',
        'M6 6 4.5 7.5A2.121 2.121 0 1 0 7.5 10.5l8-8A2.121 2.121 0 1 0 12.5 3l-1.5 1.5',
        'M6 20l7-7',
        'M7.5 13.5 6 15a2.121 2.121 0 1 0 3 3l1.5-1.5',
      ],
    };
  }

  // Default: stethoscope
  return {
    paths: [
      'M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3',
      'M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4',
      'M20 10m-2 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0',
    ],
  };
}

export function SpecialtyIcon({ specialty, className }: SpecialtyIconProps): React.ReactNode {
  const { paths, viewBox = '0 0 24 24', strokeWidth = 2 } = getIconDefinition(specialty);

  return (
    <div className={cn('inline-flex items-center justify-center', className)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox={viewBox}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </svg>
    </div>
  );
}
