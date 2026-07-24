import styled from 'styled-components';
import { Wifi } from 'lucide-react';
import { NETWORK_LABELS } from '@/features/cards/constants';
import type { CreditCard } from '@/features/cards/types';
import { formatAnnualFee, formatCurrency } from '@/lib/utils';

interface CardArtworkProps {
  card: Pick<
    CreditCard,
    | 'name'
    | 'issuer'
    | 'network'
    | 'imageUrl'
    | 'annualFee'
    | 'rewardsSummary'
    | 'joiningFee'
    | 'cardType'
  >;
  className?: string;
}

/** Premium Altiora credit-card visual shared by grids, details, and comparisons. */
export function CardArtwork({ card, className }: CardArtworkProps) {
  const hasImage = Boolean(card.imageUrl?.trim());

  return (
    <StyledWrapper className={className}>
      <div
        className="flip-card"
        tabIndex={0}
        role="img"
        aria-label={`${card.name}. Focus or hover to show fees, rewards, and card type.`}
      >
        <div className="flip-card-inner">
          <div className="card-face flip-card-front">
            {hasImage && <img className="card-image" src={card.imageUrl} alt="" />}
            {hasImage && <div className="image-scrim" />}
            {!hasImage && <div className="card-glow" />}

            <div className="card-topline">
              <div className="identity-block">
                <span className="micro-label">BANK / ISSUER</span>
                <span className="issuer">{card.issuer}</span>
              </div>
              <div className="identity-block identity-type">
                <span className="micro-label">CARD TYPE</span>
                <span className="network">{NETWORK_LABELS[card.network]}</span>
              </div>
            </div>

            <div className="payment-row">
              <span className="chip" aria-hidden="true">
                <i />
                <i />
              </span>
              <Wifi className="contactless" aria-hidden="true" />
            </div>

            <div className="card-name-block">
              <span className="micro-label">CARD NAME</span>
              <p className="card-name">{card.name}</p>
            </div>
          </div>

          <div className="card-face flip-card-back">
            <div className="brand-mark">ALTIORA</div>
            <div className="magnetic-strip" />
            <dl className="card-facts">
              <div className="fact">
                <dt>Annual fee</dt>
                <dd>{formatAnnualFee(card.annualFee)}</dd>
              </div>
              <div className="fact fact-wide">
                <dt>Rewards</dt>
                <dd>{card.rewardsSummary}</dd>
              </div>
              <div className="fact fact-wide">
                <dt>Joining fee</dt>
                <dd>{formatCurrency(card.joiningFee)}</dd>
              </div>
              <div className="fact">
                <dt>Card type</dt>
                <dd>{card.cardType}</dd>
              </div>
            </dl>
            <div className="signature-row">
              <span className="signature">AUTHORIZED SIGNATURE</span>
              <span className="security-code">•••</span>
            </div>
            <p className="product-name">{card.name}</p>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  width: 100%;

  .flip-card {
    width: 100%;
    aspect-ratio: 1.586 / 1;
    color: #ffffff;
    perspective: 1200px;
  }

  .flip-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transition: transform 700ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .flip-card:hover .flip-card-inner,
  .flip-card:focus .flip-card-inner {
    transform: rotateY(180deg);
  }

  .flip-card:focus-visible {
    border-radius: 16px;
    outline: 3px solid #34c6f3;
    outline-offset: 4px;
  }

  .card-face {
    position: absolute;
    inset: 0;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    box-shadow:
      0 18px 38px -18px rgba(6, 42, 109, 0.72),
      inset 0 1px 0 rgba(255, 255, 255, 0.24);
    backface-visibility: hidden;
  }

  .flip-card-front,
  .flip-card-back {
    background:
      radial-gradient(circle at 86% 15%, rgba(109, 213, 247, 0.4), transparent 28%),
      linear-gradient(135deg, #062a6d 0%, #0b4ea2 48%, #11b5e4 100%);
  }

  .flip-card-front {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 7%;
  }

  .card-image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: inherit;
  }

  .image-scrim {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(7, 19, 41, 0.78), rgba(6, 42, 109, 0.3) 55%, rgba(7, 19, 41, 0.68));
  }

  .card-glow {
    position: absolute;
    right: -12%;
    bottom: -44%;
    width: 65%;
    aspect-ratio: 1;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 50%;
    box-shadow: 0 0 60px rgba(52, 198, 243, 0.22);
  }

  .card-topline,
  .payment-row {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .identity-block {
    display: flex;
    min-width: 0;
    flex: 1;
    flex-direction: column;
    align-items: flex-start;
  }

  .identity-type {
    align-items: flex-end;
    text-align: right;
  }

  .issuer,
  .network {
    max-width: 100%;
    overflow: hidden;
    font-size: clamp(0.52rem, 2.7vw, 0.75rem);
    font-weight: 700;
    letter-spacing: 0.14em;
    text-overflow: ellipsis;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .network {
    max-width: 100%;
    font-size: clamp(0.48rem, 2.4vw, 0.68rem);
    opacity: 0.9;
  }

  .payment-row {
    justify-content: flex-start;
    gap: 9px;
  }

  .chip {
    position: relative;
    display: block;
    width: clamp(30px, 13%, 42px);
    aspect-ratio: 1.3 / 1;
    overflow: hidden;
    border: 1px solid rgba(93, 63, 5, 0.35);
    border-radius: 6px;
    background: linear-gradient(135deg, #fff0a6, #d6a82f 48%, #fff2ae);
  }

  .chip::before,
  .chip::after,
  .chip i {
    position: absolute;
    content: '';
    background: rgba(97, 69, 11, 0.34);
  }

  .chip::before {
    top: 50%;
    left: 0;
    width: 100%;
    height: 1px;
  }

  .chip::after {
    top: 0;
    left: 50%;
    width: 1px;
    height: 100%;
  }

  .chip i:first-child {
    top: 18%;
    left: 0;
    width: 32%;
    height: 1px;
  }

  .chip i:last-child {
    right: 0;
    bottom: 18%;
    width: 32%;
    height: 1px;
  }

  .contactless {
    width: clamp(17px, 7%, 23px);
    height: auto;
    transform: rotate(90deg);
    opacity: 0.9;
  }

  .card-name-block {
    position: relative;
    z-index: 1;
    text-align: left;
  }

  .card-name {
    display: -webkit-box;
    overflow: hidden;
    margin: 0;
    font-family: 'Poppins', 'Inter', sans-serif;
    font-size: clamp(0.7rem, 3.8vw, 1.05rem);
    font-weight: 600;
    line-height: 1.2;
    text-shadow: 0 1px 3px rgba(7, 19, 41, 0.7);
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .micro-label {
    display: block;
    margin-bottom: 1px;
    font-size: clamp(0.35rem, 1.8vw, 0.48rem);
    font-weight: 500;
    letter-spacing: 0.12em;
    opacity: 0.72;
  }

  .flip-card-back {
    display: flex;
    flex-direction: column;
    padding: 7%;
    transform: rotateY(180deg);
  }

  .brand-mark,
  .product-name {
    margin: 0;
    overflow: hidden;
    font-size: clamp(0.48rem, 2.5vw, 0.68rem);
    font-weight: 700;
    letter-spacing: 0.18em;
    text-overflow: ellipsis;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .magnetic-strip {
    display: none;
  }

  .signature-row {
    display: none;
  }

  .signature,
  .security-code {
    display: flex;
    height: clamp(18px, 13%, 28px);
    align-items: center;
    border-radius: 4px;
    background: #ffffff;
    color: #6b7280;
    font-size: clamp(0.35rem, 1.8vw, 0.48rem);
    font-style: italic;
  }

  .signature {
    flex: 1;
    padding: 0 5%;
  }

  .security-code {
    width: 22%;
    justify-content: center;
    color: #111827;
    font-weight: 700;
  }

  .product-name {
    display: none;
  }

  .card-facts {
    display: grid;
    flex: 1;
    grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
    gap: 4% 6%;
    align-content: center;
    margin: 4% 0 0;
    text-align: left;
  }

  .fact {
    min-width: 0;
    padding-top: 4%;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
  }

  .fact dt {
    margin-bottom: 2px;
    color: rgba(255, 255, 255, 0.7);
    font-size: clamp(0.35rem, 1.75vw, 0.48rem);
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .fact dd {
    display: -webkit-box;
    overflow: hidden;
    margin: 0;
    font-size: clamp(0.45rem, 2.25vw, 0.66rem);
    font-weight: 700;
    line-height: 1.25;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .fact-wide dd {
    font-size: clamp(0.4rem, 2vw, 0.59rem);
  }

  @media (prefers-reduced-motion: reduce) {
    .flip-card-inner {
      transition-duration: 1ms;
    }
  }
`;

export default CardArtwork;
