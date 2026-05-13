/**
 * Stroke icon set used across the reputation system.
 * Kept in a single file so every badge/card shares the same look.
 */
const ReputationIcon = ({ name, className = 'w-4 h-4', filled = false }) => {
  const common = {
    className,
    viewBox: '0 0 24 24',
    fill: filled ? 'currentColor' : 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }
  switch (name) {
    case 'sparkles':
      return (
        <svg {...common}>
          <path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z" />
          <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" />
        </svg>
      )
    case 'flame':
      return (
        <svg {...common}>
          <path d="M12 2s3 4 3 8a3 3 0 0 1-6 0c0-1 .5-2 1-3 0 0-4 3-4 8a6 6 0 0 0 12 0c0-6-6-13-6-13z" />
        </svg>
      )
    case 'star':
      return (
        <svg {...common} fill="currentColor">
          <path d="M12 2l3.1 6.3 7 1-5 4.9 1.2 6.9L12 17.8 5.7 21.1 6.9 14.2l-5-4.9 7-1L12 2z" />
        </svg>
      )
    case 'trophy':
      return (
        <svg {...common}>
          <path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4z" />
          <path d="M7 4H4v2a3 3 0 0 0 3 3M17 4h3v2a3 3 0 0 1-3 3" />
        </svg>
      )
    case 'rocket':
      return (
        <svg {...common}>
          <path d="M4 14s1-4 6-9a9 9 0 0 1 9 0c1 5-3 10-9 15-5-5-6-6-6-6z" />
          <circle cx="14" cy="10" r="1.5" />
          <path d="M6 14l-3 1 1-3M16 20l1 3-3-1" />
        </svg>
      )
    case 'crown':
      return (
        <svg {...common}>
          <path d="M3 18h18M4 8l4 4 4-7 4 7 4-4v10H4V8z" />
        </svg>
      )
    case 'zap':
      return (
        <svg {...common}>
          <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
        </svg>
      )
    case 'seed':
      return (
        <svg {...common}>
          <path d="M12 22v-6" />
          <path d="M12 16c-4 0-7-3-7-7 4 0 7 3 7 7zM12 16c4 0 7-3 7-7-4 0-7 3-7 7z" />
        </svg>
      )
    case 'trending':
      return (
        <svg {...common}>
          <path d="M3 17l6-6 4 4 8-8" />
          <path d="M14 7h7v7" />
        </svg>
      )
    case 'heart':
      return (
        <svg {...common}>
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.6z" />
        </svg>
      )
    case 'bookmark':
      return (
        <svg {...common}>
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      )
    case 'message':
      return (
        <svg {...common}>
          <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z" />
        </svg>
      )
    case 'arrow-up':
      return (
        <svg {...common}>
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      )
    default:
      return null
  }
}

export default ReputationIcon
