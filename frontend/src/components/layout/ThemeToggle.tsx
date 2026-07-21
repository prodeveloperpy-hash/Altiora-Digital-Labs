import styled from 'styled-components';
import { useTheme } from '@/context/theme/useTheme';

interface ThemeToggleProps {
  className?: string;
}

/** Controlled, accessible light/dark switch backed by the global theme context. */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <StyledWrapper className={className}>
      <label className="switch">
        <span className="sun" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <g fill="#FFD43B">
              <circle r="5" cy="12" cx="12" />
              <path d="M21 13h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2ZM4 13H3a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2Zm13.66-5.66a1 1 0 0 1-.66-.29 1 1 0 0 1 0-1.41l.71-.71a1 1 0 1 1 1.41 1.41l-.71.71a1 1 0 0 1-.75.29ZM5.64 19.36a1 1 0 0 1-.71-.29 1 1 0 0 1 0-1.41l.71-.66a1 1 0 0 1 1.41 1.41l-.71.71a1 1 0 0 1-.7.24ZM12 5a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v1a1 1 0 0 1-1 1Zm0 17a1 1 0 0 1-1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1-1 1ZM6.34 7.34a1 1 0 0 1-.7-.29l-.71-.71a1 1 0 0 1 1.41-1.41l.71.71a1 1 0 0 1 0 1.41 1 1 0 0 1-.71.29Zm12.02 12.02a1 1 0 0 1-.7-.29l-.66-.71A1 1 0 0 1 18.36 17l.71.71a1 1 0 0 1 0 1.41 1 1 0 0 1-.71.24Z" />
            </g>
          </svg>
        </span>
        <span className="moon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
            <path d="M223.5 32C100 32 0 132.3 0 256s100 224 223.5 224c60.6 0 115.5-24.2 155.8-63.4 5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6-96.9 0-175.5-78.8-175.5-176 0-65.8 36-123.1 89.3-153.3 6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8Z" />
          </svg>
        </span>
        <input
          type="checkbox"
          className="input"
          checked={isDark}
          onChange={toggleTheme}
          role="switch"
          aria-checked={isDark}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        />
        <span className="slider" />
      </label>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  display: inline-flex;

  .switch {
    position: relative;
    display: inline-block;
    width: 64px;
    height: 34px;
  }

  .switch input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
  }

  .slider {
    position: absolute;
    inset: 0;
    cursor: pointer;
    border: 1px solid rgba(6, 42, 109, 0.14);
    border-radius: 30px;
    background-color: #11b5e4;
    box-shadow: inset 0 1px 2px rgba(6, 42, 109, 0.12);
    transition: 250ms ease;
  }

  .slider::before {
    position: absolute;
    bottom: 2px;
    left: 2px;
    z-index: 2;
    width: 28px;
    height: 28px;
    content: '';
    border-radius: 50%;
    background-color: #ffffff;
    box-shadow: 0 3px 8px rgba(6, 42, 109, 0.28);
    transition: 250ms ease;
  }

  .sun svg,
  .moon svg {
    position: absolute;
    z-index: 1;
    width: 22px;
    height: 22px;
  }

  .sun svg {
    top: 6px;
    left: 37px;
    animation: rotate 15s linear infinite;
  }

  .moon svg {
    top: 6px;
    left: 6px;
    fill: #34c6f3;
    animation: tilt 5s linear infinite;
  }

  .input:checked + .slider {
    border-color: rgba(52, 198, 243, 0.3);
    background-color: #08172d;
  }

  .input:checked + .slider::before {
    transform: translateX(30px);
  }

  .input:focus-visible + .slider {
    outline: 2px solid #11b5e4;
    outline-offset: 3px;
  }

  .switch:hover .slider {
    box-shadow: inset 0 1px 2px rgba(6, 42, 109, 0.12), 0 0 0 4px rgba(17, 181, 228, 0.12);
  }

  @keyframes rotate {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes tilt {
    0%,
    100% {
      transform: rotate(0deg);
    }
    25% {
      transform: rotate(-10deg);
    }
    75% {
      transform: rotate(10deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .sun svg,
    .moon svg {
      animation: none;
    }
  }
`;

export default ThemeToggle;
