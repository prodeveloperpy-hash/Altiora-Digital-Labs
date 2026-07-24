"""Idempotent database seeding.

Populates all reference data: banks, categories, reward categories, benefits,
credit cards, FAQs, credit-score tiers, and the full recommendation-engine
configuration (scoring weights, question mappings, recommendation rules, scoring
matrix, eligibility rules). Every aspect of engine behavior is data here — there
is no hardcoded scoring in code.

Run standalone with:  python -m app.database.seed
"""

from __future__ import annotations

import logging

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.core.security import hash_password
from app.database.session import SessionLocal
from app.models.admin_user import AdminUser
from app.models.bank import Bank
from app.models.benefit import Benefit
from app.models.card import CreditCard
from app.models.category import Category
from app.models.eligibility_rule import EligibilityRule
from app.models.faq import Faq
from app.models.question import Question, QuestionOption
from app.models.reward_category import RewardCategory
from app.models.reward_rate import RewardRate
from app.models.rule import CreditScoreTier, RecommendationRule
from app.models.scoring import QuestionMapping, ScoringMatrixEntry, ScoringWeight
from app.models.setting import Setting

logger = logging.getLogger("cardwise.seed")


# --- Reference data -------------------------------------------------------

BANKS: list[dict[str, str]] = [
    {"slug": "hdfc-bank", "name": "HDFC Bank", "website": "https://www.hdfcbank.com/"},
    {"slug": "sbi-card", "name": "SBI Card", "website": "https://www.sbicard.com/"},
    {"slug": "axis-bank", "name": "Axis Bank", "website": "https://www.axisbank.com/"},
    {"slug": "au-small-finance-bank", "name": "AU Small Finance Bank", "website": "https://www.au.bank.in/"},
    {"slug": "american-express-india", "name": "American Express India", "website": "https://www.americanexpress.com/in/"},
    {"slug": "bank-of-baroda", "name": "Bank of Baroda", "website": "https://www.bobfinancial.com/"},
]

CATEGORIES: list[dict[str, str]] = [
    {"slug": "cashback", "name": "Cash back", "description": "Earn cash on everyday spending."},
    {"slug": "travel", "name": "Travel", "description": "Miles, lounge access, and travel perks."},
    {"slug": "rewards", "name": "Rewards", "description": "Flexible points across categories."},
    {"slug": "balance-transfer", "name": "Balance transfer", "description": "Move debt to a lower rate."},
    {"slug": "low-interest", "name": "Low interest", "description": "Keep interest costs down."},
    {"slug": "student", "name": "Student", "description": "Build credit as a student."},
    {"slug": "business", "name": "Business", "description": "Tools and rewards for your business."},
    {"slug": "secured", "name": "Secured", "description": "Rebuild credit with a deposit."},
    {"slug": "no-annual-fee", "name": "No annual fee", "description": "Great value, no yearly cost."},
]

REWARD_CATEGORIES: list[dict[str, str]] = [
    {"code": "all-purchases", "name": "All purchases"},
    {"code": "travel", "name": "Travel & hotels"},
    {"code": "dining", "name": "Dining & restaurants"},
    {"code": "groceries", "name": "Groceries"},
    {"code": "gas", "name": "Gas"},
    {"code": "transit", "name": "Transit"},
    {"code": "streaming", "name": "Streaming"},
    {"code": "entertainment", "name": "Entertainment"},
    {"code": "online-shopping", "name": "Online shopping"},
    {"code": "utilities", "name": "Bills & utilities"},
    {"code": "office-supplies", "name": "Office supplies"},
    {"code": "advertising", "name": "Advertising"},
]

BENEFITS: list[dict[str, str]] = [
    {"code": "reward-points", "name": "Reward points", "category": "Rewards", "description": "Earn points on eligible spending.", "weight": 2.0},
    {"code": "cashback", "name": "Cashback", "category": "Rewards", "description": "Receive cashback on purchases.", "weight": 2.5},
    {"code": "domestic-lounge", "name": "Domestic lounge access", "category": "Travel", "description": "Complimentary domestic airport lounge visits.", "weight": 3.0},
    {"code": "international-lounge", "name": "International lounge access", "category": "Travel", "description": "Complimentary international lounge visits.", "weight": 4.0},
    {"code": "shopping-offers", "name": "Shopping offers", "category": "Shopping", "description": "Accelerated rewards and merchant discounts.", "weight": 1.5},
    {"code": "dining-offers", "name": "Dining offers", "category": "Lifestyle", "description": "Dining discounts and accelerated rewards.", "weight": 1.5},
    {"code": "upi", "name": "UPI payments", "category": "Digital Payments", "description": "Link an eligible RuPay card to UPI.", "weight": 2.0},
    {"code": "fuel-surcharge", "name": "Fuel surcharge waiver", "category": "Fuel", "description": "Waiver of eligible fuel surcharge.", "weight": 1.5},
    {"code": "insurance", "name": "Insurance cover", "category": "Insurance", "description": "Travel, accident, or purchase insurance.", "weight": 2.0},
    {"code": "lifetime-free", "name": "Lifetime free", "category": "Fees", "description": "No joining or annual fee.", "weight": 3.0},
    {"code": "easy-eligibility", "name": "Accessible eligibility", "category": "Eligibility", "description": "Accessible stated income criteria.", "weight": 1.0},
    {"code": "air-miles", "name": "Air-mile redemption", "category": "Reward Redemption", "description": "Redeem points for flights or miles.", "weight": 2.0},
    {"code": "concierge", "name": "Concierge service", "category": "Other Features", "description": "Premium concierge assistance.", "weight": 2.0},
    {"code": "golf", "name": "Golf benefits", "category": "Lifestyle", "description": "Complimentary golf rounds or lessons.", "weight": 2.0},
    {"code": "low-forex", "name": "Low forex markup", "category": "Travel", "description": "Reduced foreign currency markup.", "weight": 2.5},
    {"code": "welcome-bonus", "name": "Welcome bonus", "category": "Rewards", "description": "Bonus points or vouchers on joining.", "weight": 1.0},
    {"code": "fee-waiver", "name": "Annual fee waiver", "category": "Fees", "description": "Spend-based annual fee waiver.", "weight": 1.5},
    {"code": "emi", "name": "EMI conversion", "category": "Digital Payments", "description": "Convert purchases into instalments.", "weight": 1.0},
]

CREDIT_TIERS: list[dict[str, object]] = [
    {"slug": "building", "label": "Building credit", "rank": 1},
    {"slug": "poor", "label": "Poor (below 630)", "rank": 2},
    {"slug": "fair", "label": "Fair (630–689)", "rank": 3},
    {"slug": "good", "label": "Good (690–719)", "rank": 4},
    {"slug": "excellent", "label": "Excellent (720+)", "rank": 5},
]

# --- Engine configuration (all data-driven) ------------------------------

SCORING_WEIGHTS: list[dict[str, object]] = [
    {"key": "goal", "value": 3.0, "description": "Primary-goal match — the strongest signal."},
    {"key": "eligibility", "value": 2.0, "description": "Credit-profile fit."},
    {"key": "spending", "value": 2.0, "description": "Overlap with the user's top spending."},
    {"key": "budget", "value": 1.5, "description": "Annual-fee fit."},
    {"key": "travel", "value": 1.5, "description": "Travel suitability (FX fees, etc.)."},
    {"key": "apr", "value": 1.5, "description": "Interest suitability for balance carriers."},
    {"key": "preference", "value": 1.2, "description": "Rewards-format preference."},
    {"key": "benefit", "value": 1.2, "description": "Relevant benefit coverage."},
    {"key": "rating", "value": 1.0, "description": "General quality signal."},
    {"key": "penalty", "value": 1.0, "description": "Multiplier for negative (con) rules."},
]

QUESTION_MAPPINGS: list[dict[str, object]] = [
    # rewardPreference -> reward unit
    {"question_key": "rewardPreference", "answer_value": "cashback", "target_type": "reward_unit", "target_code": "percent"},
    {"question_key": "rewardPreference", "answer_value": "points", "target_type": "reward_unit", "target_code": "points"},
    {"question_key": "rewardPreference", "answer_value": "miles", "target_type": "reward_unit", "target_code": "miles"},
    # primaryGoal -> relevant benefits
    {"question_key": "primaryGoal", "answer_value": "travel", "target_type": "benefit", "target_code": "no-fx-fee"},
    {"question_key": "primaryGoal", "answer_value": "travel", "target_type": "benefit", "target_code": "lounge-access"},
    {"question_key": "primaryGoal", "answer_value": "travel", "target_type": "benefit", "target_code": "travel-credit"},
    {"question_key": "primaryGoal", "answer_value": "travel", "target_type": "benefit", "target_code": "travel-insurance"},
    {"question_key": "primaryGoal", "answer_value": "cashback", "target_type": "benefit", "target_code": "no-annual-fee"},
    {"question_key": "primaryGoal", "answer_value": "balance-transfer", "target_type": "benefit", "target_code": "intro-apr"},
    {"question_key": "primaryGoal", "answer_value": "business", "target_type": "benefit", "target_code": "employee-cards"},
    {"question_key": "primaryGoal", "answer_value": "business", "target_type": "benefit", "target_code": "expense-tools"},
    {"question_key": "primaryGoal", "answer_value": "student", "target_type": "benefit", "target_code": "credit-building"},
    {"question_key": "primaryGoal", "answer_value": "secured", "target_type": "benefit", "target_code": "credit-building"},
    # travelsInternationally -> no FX benefit
    {"question_key": "travelsInternationally", "answer_value": "true", "target_type": "benefit", "target_code": "no-fx-fee"},
    # spendingCategories -> reward categories (illustrative)
    {"question_key": "spendingCategories", "answer_value": "travel", "target_type": "benefit", "target_code": "travel-insurance"},
]

# operator, answer_field, card_field, target_number, target_value, points, weight_key,
# benefit_code, outcome, reason_label, reason_detail, priority
RULES: list[dict[str, object]] = [
    {"code": "goal_match", "operator": "answer_in_card_list", "answer_field": "primaryGoal",
     "card_field": "categories", "points": 10.0, "weight_key": "goal", "outcome": "pro",
     "reason_label": "Matches your primary goal",
     "reason_detail": "This card is designed for exactly the category you chose.", "priority": 10},
    {"code": "spending_match", "operator": "answer_list_overlaps_card_list",
     "answer_field": "spendingCategories", "card_field": "rewardCategories", "points": 8.0,
     "weight_key": "spending", "outcome": "pro", "reason_label": "Rewards your top spending",
     "reason_detail": "It earns elevated rewards where you spend the most.", "priority": 20},
    {"code": "credit_eligible", "operator": "credit_tier_meets", "answer_field": "creditScore",
     "card_field": "recommendedCreditScore", "points": 8.0, "weight_key": "eligibility",
     "outcome": "pro", "reason_label": "Suits your credit profile",
     "reason_detail": "You are likely to qualify based on the credit level you reported.",
     "priority": 30},
    {"code": "fee_within_budget", "operator": "card_num_lte_answer_num",
     "answer_field": "maxAnnualFee", "card_field": "annualFee", "points": 7.0,
     "weight_key": "budget", "outcome": "pro", "reason_label": "Within your fee budget",
     "reason_detail": "The annual fee fits the maximum you set.", "priority": 40},
    {"code": "traveler_no_fx", "operator": "answer_true_and_card_num_lte_target",
     "answer_field": "travelsInternationally", "card_field": "foreignTransactionFee",
     "target_number": 0.0, "points": 6.0, "weight_key": "travel", "benefit_code": "no-fx-fee",
     "outcome": "pro", "reason_label": "Great for international travel",
     "reason_detail": "No foreign transaction fees on purchases abroad.", "priority": 50},
    {"code": "balance_low_apr", "operator": "answer_true_and_card_num_lte_target",
     "answer_field": "carriesBalance", "card_field": "aprMin", "target_number": 18.0,
     "points": 6.0, "weight_key": "apr", "outcome": "pro",
     "reason_label": "Lower interest for carried balances",
     "reason_detail": "A comparatively low APR reduces interest if you carry a balance.",
     "priority": 60},
    {"code": "reward_preference", "operator": "derived_token_overlaps_card_list",
     "card_field": "rewardUnits", "target_value": "reward_unit", "points": 5.0,
     "weight_key": "preference", "outcome": "pro", "reason_label": "Matches your rewards style",
     "reason_detail": "It earns rewards in the format you prefer.", "priority": 70},
    {"code": "benefit_match", "operator": "derived_token_overlaps_card_list",
     "card_field": "benefitCodes", "target_value": "benefit", "points": 5.0,
     "weight_key": "benefit", "outcome": "pro", "reason_label": "Includes benefits you value",
     "reason_detail": "It offers perks relevant to your goals.", "priority": 75},
    {"code": "highly_rated", "operator": "card_num_gte_target", "card_field": "rating",
     "target_number": 4.5, "points": 4.0, "weight_key": "rating", "outcome": "pro",
     "reason_label": "Highly rated", "reason_detail": "Consistently well-reviewed by cardholders.",
     "priority": 80},
    {"code": "no_annual_fee_bonus", "operator": "card_num_lte_target", "card_field": "annualFee",
     "target_number": 0.0, "points": 3.0, "weight_key": "rating", "benefit_code": "no-annual-fee",
     "outcome": "pro", "reason_label": "No annual fee",
     "reason_detail": "You will not pay a yearly fee to keep this card.", "priority": 90},
    # --- Cons (negative points, outcome=con) ---
    {"code": "con_fee_over_budget", "operator": "card_num_gt_answer_num",
     "answer_field": "maxAnnualFee", "card_field": "annualFee", "points": -6.0,
     "weight_key": "penalty", "outcome": "con", "reason_label": "Above your fee budget",
     "reason_detail": "The annual fee exceeds the maximum you set.", "priority": 100},
    {"code": "con_fx_for_traveler", "operator": "answer_true_and_card_num_gt_target",
     "answer_field": "travelsInternationally", "card_field": "foreignTransactionFee",
     "target_number": 0.0, "points": -4.0, "weight_key": "penalty", "outcome": "con",
     "reason_label": "Charges foreign transaction fees",
     "reason_detail": "You would pay a fee on purchases made abroad.", "priority": 110},
    {"code": "con_high_apr_balance", "operator": "answer_true_and_card_num_gt_target",
     "answer_field": "carriesBalance", "card_field": "aprMin", "target_number": 20.0,
     "points": -4.0, "weight_key": "penalty", "outcome": "con",
     "reason_label": "Higher APR if you carry a balance",
     "reason_detail": "Interest could add up given its higher APR.", "priority": 120},
]

# operator, answer_field, card_field, target_number, score, weight_key, outcome, reason
MATRIX: list[dict[str, object]] = [
    {"code": "m_low_fee", "operator": "card_num_lte_target", "card_field": "annualFee",
     "target_number": 50.0, "score": 2.0, "weight_key": "budget", "outcome": "neutral",
     "reason_label": "Low annual fee", "reason_detail": "A modest or no annual fee.", "priority": 10},
    {"code": "m_no_fx", "operator": "card_num_lte_target", "card_field": "foreignTransactionFee",
     "target_number": 0.0, "score": 2.0, "weight_key": "travel", "outcome": "neutral",
     "reason_label": "No foreign transaction fees", "reason_detail": "Spend abroad fee-free.",
     "priority": 20},
    {"code": "m_valuable_bonus", "operator": "card_num_gte_target", "card_field": "signupBonusValue",
     "target_number": 500.0, "score": 2.0, "weight_key": "rating", "outcome": "neutral",
     "reason_label": "Valuable welcome bonus", "reason_detail": "A sizable sign-up bonus.",
     "priority": 30},
]

ELIGIBILITY_RULES: list[dict[str, object]] = [
    {"code": "elig_credit", "operator": "credit_tier_meets", "answer_field": "creditScore",
     "card_field": "recommendedCreditScore", "card_id": None,
     "fail_message": "Typically requires stronger credit than you reported.",
     "pass_message": "", "priority": 10},
]


def _card(
    *,
    slug: str,
    name: str,
    bank: str,
    network: str,
    categories: list[str],
    benefits: list[str],
    summary: str,
    description: str,
    annual_fee: float,
    apr_min: float,
    apr_max: float,
    foreign_transaction_fee: float,
    recommended_credit_score: str,
    rewards_summary: str,
    reward_rates: list[tuple],
    pros: list[str],
    cons: list[str],
    rating: float,
    review_count: int,
    is_featured: bool = False,
    intro_apr: str | None = None,
    intro_apr_months: int | None = None,
    signup_bonus: str | None = None,
    signup_bonus_value: float | None = None,
    rewards_currency: str | None = None,
    joining_fee: float = 0,
    card_type: str = "Rewards",
    fee_waiver: str = "",
    eligibility: str = "Resident Indian applicant, subject to issuer approval.",
    income_requirement: str = "As per issuer policy",
    details: dict[str, str] | None = None,
) -> dict[str, object]:
    details = details or {}
    return {
        "slug": slug, "name": name, "bank": bank, "network": network,
        "categories": categories, "benefits": benefits, "image_url": "",
        "summary": summary, "description": description, "annual_fee": annual_fee,
        "apr_min": apr_min, "apr_max": apr_max, "intro_apr": intro_apr,
        "intro_apr_months": intro_apr_months, "foreign_transaction_fee": foreign_transaction_fee,
        "recommended_credit_score": recommended_credit_score, "rewards_summary": rewards_summary,
        "rewards_currency": rewards_currency, "signup_bonus": signup_bonus,
        "signup_bonus_value": signup_bonus_value, "reward_rates": reward_rates,
        "benefit_codes": benefits, "pros": pros, "cons": cons, "rating": rating,
        "review_count": review_count, "is_featured": is_featured,
        "apply_url": "", "joining_fee": joining_fee, "card_type": card_type,
        "fee_waiver": fee_waiver, "eligibility": eligibility,
        "income_requirement": income_requirement,
        "reward_rate": details.get("reward_rate", rewards_summary),
        "reward_points": details.get("reward_points", rewards_summary),
        "cashback_categories": details.get("cashback_categories", ""),
        "lounge_domestic": details.get("lounge_domestic", ""),
        "lounge_international": details.get("lounge_international", ""),
        "insurance": details.get("insurance", ""), "fuel": details.get("fuel", ""),
        "dining": details.get("dining", ""), "shopping": details.get("shopping", ""),
        "travel": details.get("travel", ""), "forex": details.get("forex", ""),
        "upi": details.get("upi", ""), "concierge": details.get("concierge", ""),
        "golf": details.get("golf", ""),
        "welcome_bonus": details.get("welcome_bonus", signup_bonus or ""),
        "renewal_benefits": details.get("renewal_benefits", ""),
        "add_on_cards": details.get("add_on_cards", ""),
        "emi_conversion": details.get("emi_conversion", "Available, subject to issuer terms"),
        "balance_transfer": details.get("balance_transfer", "Available, subject to issuer terms"),
        "merchant_offers": details.get("merchant_offers", ""),
    }


CARDS: list[dict[str, object]] = [
    _card(slug="everyday-cash-preferred", name="Everyday Cash Preferred", bank="summit-bank",
          network="visa", categories=["cashback", "no-annual-fee"],
          benefits=["no-annual-fee", "credit-tracking"],
          summary="Flat-rate cash back on everything with no annual fee.",
          description="Earn unlimited cash back on every purchase with no categories to track and no annual fee.",
          annual_fee=0, apr_min=17.99, apr_max=27.99, foreign_transaction_fee=0.03,
          recommended_credit_score="good", rewards_summary="2% cash back on all purchases",
          reward_rates=[("all purchases", 2.0, "percent")],
          pros=["Simple flat-rate rewards", "No annual fee"],
          cons=["Charges foreign transaction fees"], rating=4.6, review_count=1820, is_featured=True,
          signup_bonus="$200 after $1,000 spend in 90 days", signup_bonus_value=200, rewards_currency="USD"),
    _card(slug="horizon-travel-elite", name="Horizon Travel Elite", bank="meridian",
          network="mastercard", categories=["travel", "rewards"],
          benefits=["no-fx-fee", "lounge-access", "travel-insurance"],
          summary="Premium travel rewards with lounge access and no foreign fees.",
          description="Earns generous miles on travel and dining, includes airport lounge access, and never charges foreign transaction fees.",
          annual_fee=95, apr_min=20.99, apr_max=28.99, foreign_transaction_fee=0.0,
          recommended_credit_score="excellent", rewards_summary="3x miles on travel & dining",
          reward_rates=[("travel", 3.0, "miles"), ("dining", 3.0, "miles"), ("all purchases", 1.0, "miles")],
          pros=["Strong travel earn rate", "No foreign transaction fees"],
          cons=["Has an annual fee", "Requires excellent credit"], rating=4.8, review_count=2640,
          is_featured=True, signup_bonus="60,000 miles after $4,000 spend in 3 months",
          signup_bonus_value=750, rewards_currency="miles"),
    _card(slug="pinnacle-points-plus", name="Pinnacle Points Plus", bank="summit-bank",
          network="amex", categories=["rewards", "travel"],
          benefits=["no-fx-fee", "purchase-protection"],
          summary="Flexible transferable points on dining, groceries, and travel.",
          description="Earn flexible points that transfer to travel partners, with elevated rewards on dining and groceries.",
          annual_fee=95, apr_min=19.99, apr_max=27.49, foreign_transaction_fee=0.0,
          recommended_credit_score="good", rewards_summary="4x points on dining & groceries",
          reward_rates=[("dining", 4.0, "points"), ("groceries", 4.0, "points"), ("all purchases", 1.0, "points")],
          pros=["High grocery and dining rewards", "Flexible point transfers"],
          cons=["Annual fee applies"], rating=4.7, review_count=1990, is_featured=True,
          signup_bonus="50,000 points after $3,000 spend in 3 months", signup_bonus_value=625,
          rewards_currency="points"),
    _card(slug="clearway-balance-transfer", name="Clearway Balance Transfer", bank="harbor",
          network="visa", categories=["balance-transfer", "low-interest", "no-annual-fee"],
          benefits=["intro-apr", "no-annual-fee"],
          summary="Long 0% intro APR on balance transfers with no annual fee.",
          description="Consolidate debt with a lengthy 0% introductory APR on balance transfers and purchases.",
          annual_fee=0, apr_min=15.24, apr_max=25.24, foreign_transaction_fee=0.03,
          recommended_credit_score="good", rewards_summary="No rewards — focused on low interest",
          reward_rates=[], pros=["Long 0% intro APR", "No annual fee"],
          cons=["No rewards program", "Balance transfer fee applies"], rating=4.4, review_count=1310,
          intro_apr="0% intro APR on balance transfers for 21 months", intro_apr_months=21),
    _card(slug="steadyrate-low-interest", name="SteadyRate Low Interest", bank="harbor",
          network="mastercard", categories=["low-interest", "no-annual-fee"],
          benefits=["no-annual-fee", "no-fx-fee"],
          summary="One of the lowest ongoing APRs available, with no annual fee.",
          description="Keeps interest costs low with a consistently low ongoing APR and no annual fee.",
          annual_fee=0, apr_min=11.99, apr_max=19.99, foreign_transaction_fee=0.0,
          recommended_credit_score="good", rewards_summary="1% cash back on all purchases",
          reward_rates=[("all purchases", 1.0, "percent")],
          pros=["Very low APR", "No annual fee"], cons=["Modest rewards"], rating=4.5,
          review_count=1120, is_featured=True),
    _card(slug="campus-starter", name="Campus Starter Card", bank="meridian", network="visa",
          categories=["student", "no-annual-fee", "cashback"],
          benefits=["no-annual-fee", "no-fx-fee", "credit-building"],
          summary="A first card for students to build credit with cash back.",
          description="Designed for students with limited credit history; earns cash back and reports to all three bureaus.",
          annual_fee=0, apr_min=18.99, apr_max=28.99, foreign_transaction_fee=0.0,
          recommended_credit_score="fair", rewards_summary="1.5% cash back on all purchases",
          reward_rates=[("all purchases", 1.5, "percent")],
          pros=["Accessible for students", "Cash back rewards"], cons=["Lower credit limits"],
          rating=4.3, review_count=880),
    _card(slug="foundation-secured", name="Foundation Secured Card", bank="harbor", network="visa",
          categories=["secured", "no-annual-fee"],
          benefits=["no-annual-fee", "credit-building"],
          summary="Rebuild credit with a refundable deposit and no annual fee.",
          description="Helps you rebuild credit; your deposit sets your limit and activity is reported to all three bureaus.",
          annual_fee=0, apr_min=22.99, apr_max=27.99, foreign_transaction_fee=0.03,
          recommended_credit_score="building", rewards_summary="1% cash back on all purchases",
          reward_rates=[("all purchases", 1.0, "percent")],
          pros=["Great for rebuilding credit", "No annual fee"],
          cons=["Requires a deposit", "Charges foreign transaction fees"], rating=4.2, review_count=640),
    _card(slug="enterprise-business-rewards", name="Enterprise Business Rewards", bank="meridian",
          network="mastercard", categories=["business", "rewards"],
          benefits=["employee-cards", "expense-tools", "no-fx-fee"],
          summary="Earn rewards on business spending with expense tools.",
          description="Earns elevated points on office supplies and advertising, with free employee cards and expense tools.",
          annual_fee=125, apr_min=18.49, apr_max=26.49, foreign_transaction_fee=0.0,
          recommended_credit_score="good", rewards_summary="3x points on business categories",
          reward_rates=[("office supplies", 3.0, "points"), ("advertising", 3.0, "points"), ("all purchases", 1.0, "points")],
          pros=["Strong business rewards", "Useful expense tools"], cons=["Annual fee", "Best for higher spend"],
          rating=4.6, review_count=1450, signup_bonus="90,000 points after $6,000 spend in 3 months",
          signup_bonus_value=900, rewards_currency="points"),
    _card(slug="grocery-hero-cash", name="Grocery Hero Cash", bank="summit-bank", network="discover",
          categories=["cashback"], benefits=["no-annual-fee", "no-fx-fee"],
          summary="Top-tier cash back on groceries and streaming.",
          description="Pays generous cash back at supermarkets and on streaming services, ideal for families.",
          annual_fee=0, apr_min=16.99, apr_max=26.99, foreign_transaction_fee=0.0,
          recommended_credit_score="good", rewards_summary="6% back at supermarkets (up to $6k/yr)",
          reward_rates=[("groceries", 6.0, "percent"), ("streaming", 3.0, "percent"), ("all purchases", 1.0, "percent")],
          pros=["Excellent for groceries", "No annual fee"], cons=["Grocery bonus is capped annually"],
          rating=4.7, review_count=2100, is_featured=True),
    _card(slug="voyager-miles-signature", name="Voyager Miles Signature", bank="meridian",
          network="visa", categories=["travel", "cashback"], benefits=["no-fx-fee"],
          summary="Simple flat-rate miles on every purchase, no categories.",
          description="Earn unlimited flat-rate miles on every purchase, redeemable for any travel expense.",
          annual_fee=95, apr_min=19.24, apr_max=27.24, foreign_transaction_fee=0.0,
          recommended_credit_score="excellent", rewards_summary="2x miles on all purchases",
          reward_rates=[("all purchases", 2.0, "miles")],
          pros=["Simple flat-rate miles", "No foreign transaction fees"],
          cons=["Annual fee", "Requires excellent credit"], rating=4.5, review_count=1730,
          signup_bonus="50,000 miles after $3,000 spend in 3 months", signup_bonus_value=500,
          rewards_currency="miles"),
    _card(slug="unity-no-fee-cash", name="Unity No-Fee Cash", bank="harbor", network="mastercard",
          categories=["cashback", "no-annual-fee", "low-interest"],
          benefits=["no-annual-fee", "no-fx-fee"],
          summary="Tiered cash back on gas and transit with no annual fee.",
          description="Rewards commuters with elevated cash back on gas and transit, a low ongoing APR, and no annual fee.",
          annual_fee=0, apr_min=14.49, apr_max=23.49, foreign_transaction_fee=0.0,
          recommended_credit_score="fair", rewards_summary="3% on gas & transit",
          reward_rates=[("gas", 3.0, "percent"), ("transit", 3.0, "percent"), ("all purchases", 1.0, "percent")],
          pros=["Great for commuters", "Accessible credit requirement"],
          cons=["Rewards concentrated in a few categories"], rating=4.4, review_count=970),
    _card(slug="prestige-rewards-infinite", name="Prestige Rewards Infinite", bank="summit-bank",
          network="visa", categories=["rewards", "travel"],
          benefits=["travel-credit", "lounge-access", "concierge", "no-fx-fee"],
          summary="Luxury rewards card with premium travel and dining perks.",
          description="Delivers premium benefits: annual travel credit, lounge access, and elevated points on travel and dining.",
          annual_fee=395, apr_min=21.99, apr_max=29.99, foreign_transaction_fee=0.0,
          recommended_credit_score="excellent", rewards_summary="5x on travel, 3x on dining",
          reward_rates=[("travel", 5.0, "points"), ("dining", 3.0, "points"), ("all purchases", 1.0, "points")],
          pros=["Rich premium perks", "High travel earn rate"],
          cons=["High annual fee", "Requires excellent credit"], rating=4.6, review_count=1580,
          signup_bonus="80,000 points after $5,000 spend in 3 months", signup_bonus_value=1000,
          rewards_currency="points"),
]

# The PRD catalog supersedes the legacy synthetic fixtures above. Keeping the
# old literal out of the seed path makes upgrades easy to review while ensuring
# only genuine Indian products are inserted.
CARDS = [
    _card(slug="hdfc-regalia-gold", name="HDFC Bank Regalia Gold Credit Card", bank="hdfc-bank",
          network="visa", categories=["travel", "rewards"], benefits=["reward-points", "domestic-lounge", "international-lounge", "insurance", "dining-offers", "welcome-bonus", "fee-waiver"],
          summary="Premium travel and rewards card with lounge access.", description="Regalia Gold combines travel, dining, milestone and lounge benefits.",
          annual_fee=2500, joining_fee=2500, fee_waiver="Waived on annual spends of ₹4 lakh", apr_min=0, apr_max=0, foreign_transaction_fee=0.02,
          recommended_credit_score="good", rewards_summary="4 reward points per ₹150", reward_rates=[("all purchases", 4, "points")],
          pros=["Domestic and international lounge access", "Milestone benefits"], cons=["Annual fee applies"], rating=0, review_count=0, is_featured=True,
          income_requirement="Net monthly income ₹1 lakh (salaried)", details={"lounge_domestic":"12 visits/year","lounge_international":"6 Priority Pass visits/year","forex":"2% markup","dining":"Good Food Trail offers","insurance":"Air accident cover"}),
    _card(slug="sbi-cashback-card", name="CASHBACK SBI Card", bank="sbi-card", network="visa",
          categories=["cashback"], benefits=["cashback", "shopping-offers", "fee-waiver", "emi"],
          summary="Straightforward cashback for online and offline purchases.", description="Earn accelerated cashback online with a simple monthly cap.",
          annual_fee=999, joining_fee=999, fee_waiver="Waived on annual spends of ₹2 lakh", apr_min=0, apr_max=0, foreign_transaction_fee=0.035,
          recommended_credit_score="good", rewards_summary="5% online and 1% offline cashback", reward_rates=[("online shopping",5,"percent"),("all purchases",1,"percent")],
          pros=["Strong online cashback"], cons=["Selected exclusions and monthly cap"], rating=0, review_count=0, is_featured=True,
          details={"cashback_categories":"Online and offline spends, subject to exclusions","shopping":"5% online cashback","emi_conversion":"Flexipay available"}),
    _card(slug="axis-atlas", name="Axis Bank ATLAS Credit Card", bank="axis-bank", network="visa",
          categories=["travel", "rewards"], benefits=["reward-points", "air-miles", "domestic-lounge", "international-lounge", "dining-offers", "insurance"],
          summary="Travel-focused EDGE Miles card.", description="Earn EDGE Miles with travel redemptions and tier-based privileges.",
          annual_fee=5000, joining_fee=5000, fee_waiver="", apr_min=0, apr_max=0, foreign_transaction_fee=0.035,
          recommended_credit_score="excellent", rewards_summary="2 EDGE Miles per ₹100; 5 on direct travel", reward_rates=[("travel",5,"points"),("all purchases",2,"points")],
          pros=["Transferable travel rewards", "Lounge privileges"], cons=["High annual fee"], rating=0, review_count=0, is_featured=True,
          details={"lounge_domestic":"Tier-based visits","lounge_international":"Tier-based visits","travel":"EDGE Miles transfer partners","dining":"Dining Delights offers"}),
    _card(slug="au-lit", name="AU Bank LIT Credit Card", bank="au-small-finance-bank", network="visa",
          categories=["cashback", "no-annual-fee"], benefits=["cashback", "shopping-offers", "domestic-lounge", "fuel-surcharge", "lifetime-free", "emi"],
          summary="Customisable lifetime-free credit card.", description="Choose paid feature packs to tailor cashback, rewards and lifestyle benefits.",
          annual_fee=0, joining_fee=0, fee_waiver="Lifetime free base card", apr_min=0, apr_max=0, foreign_transaction_fee=0.035,
          recommended_credit_score="good", rewards_summary="Customisable cashback and reward packs", reward_rates=[("selected spends",1,"percent")],
          pros=["No joining or annual fee", "Customisable features"], cons=["Feature packs may cost extra"], rating=0, review_count=0,
          details={"cashback_categories":"Selected categories through feature packs","fuel":"1% surcharge waiver","lounge_domestic":"Available through feature pack","merchant_offers":"Configurable feature packs"}),
    _card(slug="amex-membership-rewards", name="American Express Membership Rewards Credit Card", bank="american-express-india", network="amex",
          categories=["rewards", "travel"], benefits=["reward-points", "air-miles", "dining-offers", "shopping-offers", "welcome-bonus", "fee-waiver"],
          summary="Milestone-led Membership Rewards card.", description="Earn Membership Rewards points with monthly spend and transaction milestones.",
          annual_fee=4500, joining_fee=1000, fee_waiver="Renewal fee options based on annual spend", apr_min=0, apr_max=0, foreign_transaction_fee=0.035,
          recommended_credit_score="good", rewards_summary="1 point per ₹50 plus milestone bonuses", reward_rates=[("all purchases",1,"points")],
          pros=["Valuable monthly milestone bonuses", "Flexible redemption"], cons=["Acceptance can vary"], rating=0, review_count=0,
          income_requirement="Personal annual income ₹6 lakh", details={"reward_points":"Membership Rewards points and monthly milestones","dining":"Amex dining offers","shopping":"Reward Multiplier partners"}),
    _card(slug="bob-premier", name="Bank of Baroda Premier Credit Card", bank="bank-of-baroda", network="visa",
          categories=["rewards", "travel"], benefits=["reward-points", "domestic-lounge", "fuel-surcharge", "insurance", "fee-waiver", "emi"],
          summary="Everyday rewards with travel and fuel privileges.", description="A mid-market rewards card with lounge access and spend-based fee waiver.",
          annual_fee=1000, joining_fee=1000, fee_waiver="Spend-based waiver as per issuer terms", apr_min=0, apr_max=0, foreign_transaction_fee=0.035,
          recommended_credit_score="good", rewards_summary="Reward points on eligible spending", reward_rates=[("eligible purchases",2,"points")],
          pros=["Lounge and fuel benefits", "Reasonable annual fee"], cons=["Reward exclusions apply"], rating=0, review_count=0,
          details={"lounge_domestic":"Complimentary visits subject to spend criteria","fuel":"1% fuel surcharge waiver","insurance":"Personal accident cover"}),
]

FAQS: list[dict[str, object]] = [
    {"id": "how-recommendations-work", "question": "How do your recommendations work?",
     "answer": "We evaluate every card against transparent rules stored in our database — weighing your goal, credit profile, spending, fees, and preferences — and rank the best matches with a plain-language explanation for each.",
     "category": "Recommendations", "position": 1},
    {"id": "is-it-free", "question": "Is CardWise free to use?",
     "answer": "Yes. CardWise is completely free and does not require an account.",
     "category": "General", "position": 1},
    {"id": "credit-impact", "question": "Will using CardWise affect my credit score?",
     "answer": "No. Browsing cards and getting matched does not affect your credit score. Only submitting an application with an issuer results in a credit inquiry.",
     "category": "General", "position": 2},
    {"id": "how-are-cards-ranked", "question": "Are cards ranked by who pays you the most?",
     "answer": "No. Rankings are determined entirely by how well a card matches your profile using our rules engine — never by issuer compensation.",
     "category": "Recommendations", "position": 2},
    {"id": "data-privacy", "question": "What do you do with my questionnaire answers?",
     "answer": "Your answers are used to generate recommendations. We do not require an account to use the recommendation tool.",
     "category": "Privacy", "position": 1},
    {"id": "how-to-apply", "question": "How do I apply for a card?",
     "answer": "Select a card to view its details, then choose “Apply on issuer’s site.” You complete your application securely on the issuer’s website.",
     "category": "Applying", "position": 1},
    {"id": "compare-cards", "question": "Can I compare cards side by side?",
     "answer": "Yes. Add cards to your comparison from any card list, then open the Compare page to see rewards, fees, and benefits side by side.",
     "category": "General", "position": 3},
    {"id": "credit-tiers", "question": "What do the credit levels mean?",
     "answer": "Credit levels group typical score ranges: Excellent (720+), Good (690–719), Fair (630–689), Poor (below 630), and Building.",
     "category": "Recommendations", "position": 3},
]


# --- Seeding logic --------------------------------------------------------

# --- Admin module data ----------------------------------------------------

DEFAULT_SETTINGS: list[dict[str, object]] = [
    {"key": "appName", "value": "CardWise", "label": "Application name",
     "description": "Display name shown across the storefront and admin panel.",
     "value_type": "text"},
    {"key": "theme", "value": "system", "label": "Default theme",
     "description": "Default color theme: light, dark, or system.", "value_type": "select"},
    {"key": "recommendationScoreThreshold", "value": 0, "label": "Recommendation score threshold",
     "description": "Minimum normalized score (0–100) a card must reach to be recommended.",
     "value_type": "number"},
    {"key": "defaultRankingWeights", "value": {"goal": 3.0, "eligibility": 2.0, "spending": 2.0,
                                               "budget": 1.5, "rating": 1.0},
     "label": "Default ranking weights",
     "description": "Baseline multipliers applied when ranking recommendations.",
     "value_type": "json"},
]

# Starter questionnaire whose keys align with the engine's answer fields.
STARTER_QUESTIONS: list[dict[str, object]] = [
    {
        "key": "primaryGoal", "label": "What is your primary goal?",
        "help_text": "We tailor recommendations to what matters most to you.",
        "type": "radio", "is_required": True, "config": {},
        "options": [
            {"label": "Earn cash back", "value": "cashback", "weight": 1.0,
             "mapped_categories": ["cashback"]},
            {"label": "Travel rewards", "value": "travel", "weight": 1.0,
             "mapped_categories": ["travel"]},
            {"label": "Flexible rewards", "value": "rewards", "weight": 1.0,
             "mapped_categories": ["rewards"]},
            {"label": "Transfer a balance", "value": "balance-transfer", "weight": 1.0,
             "mapped_categories": ["balance-transfer"]},
            {"label": "Build credit", "value": "student", "weight": 1.0,
             "mapped_categories": ["student", "secured"]},
        ],
    },
    {
        "key": "spendingCategories", "label": "Where do you spend the most?",
        "help_text": "Select all that apply.", "type": "checkbox", "is_required": False,
        "config": {},
        "options": [
            {"label": "Dining", "value": "dining", "weight": 1.0},
            {"label": "Groceries", "value": "groceries", "weight": 1.0},
            {"label": "Travel", "value": "travel", "weight": 1.0},
            {"label": "Gas", "value": "gas", "weight": 1.0},
            {"label": "Streaming", "value": "streaming", "weight": 1.0},
        ],
    },
    {
        "key": "creditScore", "label": "How would you describe your credit?",
        "help_text": "", "type": "dropdown", "is_required": True, "config": {},
        "options": [
            {"label": "Excellent (720+)", "value": "excellent", "weight": 1.0},
            {"label": "Good (690–719)", "value": "good", "weight": 1.0},
            {"label": "Fair (630–689)", "value": "fair", "weight": 1.0},
            {"label": "Poor (below 630)", "value": "poor", "weight": 1.0},
            {"label": "Building credit", "value": "building", "weight": 1.0},
        ],
    },
    {
        "key": "maxAnnualFee", "label": "Maximum annual fee you'll pay?",
        "help_text": "Drag to set your budget.", "type": "slider", "is_required": False,
        "config": {"min": 0, "max": 700, "step": 5, "unit": "$"},
        "options": [],
    },
    {
        "key": "travelsInternationally", "label": "Do you travel internationally?",
        "help_text": "", "type": "radio", "is_required": False, "config": {},
        "options": [
            {"label": "Yes", "value": "true", "weight": 1.0},
            {"label": "No", "value": "false", "weight": 0.0},
        ],
    },
    {
        "key": "rewardPreference", "label": "Preferred rewards format?",
        "help_text": "", "type": "radio", "is_required": False, "config": {},
        "options": [
            {"label": "Cash back", "value": "cashback", "weight": 1.0},
            {"label": "Points", "value": "points", "weight": 1.0},
            {"label": "Miles", "value": "miles", "weight": 1.0},
        ],
    },
]


# Homepage questionnaire: one database-backed checkbox group per PRD category.
STARTER_QUESTIONS = [
    {
        "key": "benefits", "label": "Which card benefits matter to you?",
        "help_text": "Choose as many as you like. Options are grouped by category.",
        "type": "checkbox", "is_required": True, "config": {"grouped": True},
        "options": [
            {"label": benefit["name"], "value": benefit["code"], "weight": benefit["weight"],
             "mapped_categories": [benefit["category"]]}
            for benefit in BENEFITS
        ],
    }
]


def seed_admin_user(db: Session) -> bool:
    """Create the default administrator if no admin users exist."""
    if db.execute(select(AdminUser.id).limit(1)).first():
        return False
    db.add(
        AdminUser(
            email=settings.default_admin_email,
            username=settings.default_admin_username,
            hashed_password=hash_password(settings.default_admin_password),
            full_name=settings.default_admin_full_name,
            role="super_admin",
            is_active=True,
        )
    )
    return True


def seed_settings(db: Session) -> bool:
    """Insert any missing default settings (idempotent per key)."""
    existing = set(db.execute(select(Setting.key)).scalars().all())
    added = False
    for spec in DEFAULT_SETTINGS:
        if spec["key"] not in existing:
            db.add(Setting(**spec))
            added = True
    return added


def seed_questions(db: Session) -> bool:
    """Insert the starter questionnaire if no questions exist yet."""
    if db.execute(select(Question.id).limit(1)).first():
        return False
    for position, spec in enumerate(STARTER_QUESTIONS, start=1):
        options = spec.get("options", [])
        question = Question(
            key=spec["key"],
            label=spec["label"],
            help_text=spec["help_text"],
            type=spec["type"],
            is_required=bool(spec.get("is_required", False)),
            is_active=True,
            position=position,
            config=spec.get("config", {}),
        )
        question.options = [
            QuestionOption(
                label=opt["label"],
                value=opt["value"],
                weight=float(opt.get("weight", 0.0)),
                position=index,
                mapped_categories=opt.get("mapped_categories", []),
                mapped_rules=opt.get("mapped_rules", []),
                mapped_card_conditions=opt.get("mapped_card_conditions", []),
            )
            for index, opt in enumerate(options)
        ]
        db.add(question)
    return True


def ensure_admin_seed() -> bool:
    """Idempotently provision admin user, settings, and starter questions.

    Runs on every startup and only inserts what is missing, so existing
    databases gain the admin module without a reset. Returns True if anything
    was inserted.
    """
    db = SessionLocal()
    try:
        changed = False
        changed |= seed_admin_user(db)
        changed |= seed_settings(db)
        changed |= seed_questions(db)
        if changed:
            db.commit()
        return changed
    finally:
        db.close()


def seed(db: Session) -> None:
    """Insert all reference data. Assumes an empty database."""
    db.add_all([CreditScoreTier(**tier) for tier in CREDIT_TIERS])
    db.add_all([RewardCategory(id=rc["code"], code=rc["code"], name=rc["name"]) for rc in REWARD_CATEGORIES])

    bank_by_slug = {b["slug"]: Bank(id=b["slug"], slug=b["slug"], name=b["name"], website=b["website"]) for b in BANKS}
    db.add_all(bank_by_slug.values())

    benefit_by_code = {
        b["code"]: Benefit(id=b["code"], code=b["code"], name=b["name"],
                           description=b["description"], category=b["category"],
                           weight=float(b.get("weight", 1.0)))
        for b in BENEFITS
    }
    db.add_all(benefit_by_code.values())

    category_by_slug = {
        c["slug"]: Category(id=c["slug"], slug=c["slug"], name=c["name"], description=c["description"])
        for c in CATEGORIES
    }
    db.add_all(category_by_slug.values())

    db.add_all([ScoringWeight(**w) for w in SCORING_WEIGHTS])
    db.add_all([QuestionMapping(**m) for m in QUESTION_MAPPINGS])

    for original in CARDS:
        spec = dict(original)  # copy so the module-level specs are never mutated
        reward_rates = spec.pop("reward_rates")
        category_slugs = spec.pop("categories")
        benefit_codes = spec.pop("benefit_codes")
        bank_slug = spec.pop("bank")
        bank = bank_by_slug[bank_slug]
        card = CreditCard(**spec)
        card.bank = bank
        # `issuer` is derived from the owning bank.
        card.issuer = bank.name
        card.categories = [category_by_slug[slug] for slug in category_slugs]
        card.benefit_links = [benefit_by_code[code] for code in benefit_codes]
        # The JSON `benefits` list (consumed by the frontend) holds benefit names.
        card.benefits = [benefit_by_code[code].name for code in benefit_codes]
        card.reward_rates = [
            RewardRate(category=r[0], rate=r[1], unit=r[2] if len(r) > 2 else "percent", position=i)
            for i, r in enumerate(reward_rates)
        ]
        db.add(card)

    # Flush parents (scoring weights, cards) before inserting rows whose
    # foreign keys reference them by plain column (weight_key, card_id). These
    # links carry no ORM relationship, so the unit-of-work cannot infer the
    # insert order on its own — a flush makes seeding safe with FKs enforced.
    db.flush()

    db.add_all([Faq(**faq) for faq in FAQS])
    db.add_all([RecommendationRule(**rule) for rule in RULES])
    db.add_all([ScoringMatrixEntry(**entry) for entry in MATRIX])
    db.add_all([EligibilityRule(**rule) for rule in ELIGIBILITY_RULES])

    db.commit()


def seed_if_empty() -> bool:
    """Seed the database if it currently has no cards. Returns True if seeded."""
    db = SessionLocal()
    try:
        exists = db.execute(select(CreditCard.id).limit(1)).first()
        if exists:
            return False
        seed(db)
        return True
    finally:
        db.close()


def main() -> None:  # pragma: no cover - CLI entrypoint
    from app.database import Base, engine
    from app.logging_config import configure_logging

    configure_logging()
    Base.metadata.create_all(bind=engine)
    seeded = seed_if_empty()
    admin_seeded = ensure_admin_seed()
    logger.info("Database seeded." if seeded else "Database already populated; nothing to seed.")
    if admin_seeded:
        logger.info("Admin module data provisioned.")


if __name__ == "__main__":  # pragma: no cover
    main()
