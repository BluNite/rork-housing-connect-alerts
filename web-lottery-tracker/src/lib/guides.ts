/**
 * Original editorial guides (AdSense approval requirement: sites must offer
 * substantial original content beyond data listings — see
 * docs/adsense-approval-checklist.md §B). Plain text blocks render in
 * GuideArticle.tsx. Every guide ends with the "confirm on Housing Connect"
 * disclaimer; figures are deliberately evergreen (no dollar amounts that rot).
 */

export interface GuideBlock {
  h?: string;
  p?: string[];
  ul?: string[];
}

export interface Guide {
  slug: string;
  title: string;
  description: string;
  minutes: number;
  updated: string;
  blocks: GuideBlock[];
}

export const GUIDES: Guide[] = [
  {
    slug: "how-to-apply",
    title: "How to apply for a NYC housing lottery, step by step",
    description:
      "From creating a Housing Connect account to submitting before the deadline — the whole process, in plain language, with the mistakes that get applications thrown out.",
    minutes: 6,
    updated: "October 31, 2026",
    blocks: [
      {
        p: [
          "Every year, thousands of new affordable apartments and homes in New York City are offered through lotteries, and every single one of them is applied for the same way: through one free website, NYC Housing Connect. You never pay to apply, you don't need a broker, and you don't need to be lucky enough to know someone. What you do need is a complete application submitted before the deadline.",
        ],
      },
      {
        h: "Step 1: Create your Housing Connect account",
        p: [
          "Go to housingconnect.nyc.gov and create an account with your email address. Use an email you actually check — every important notice, including a winning notice, goes there. One account per person; you will list your household members inside the application itself.",
        ],
      },
      {
        h: "Step 2: Fill out your household profile once",
        p: [
          "Housing Connect asks for your household size, income, and where everyone lives. Entering this accurately matters more than people think: the site uses it to tell you which lotteries you may qualify for. If your income is higher than a listing's maximum, or below its minimum, you won't be eligible for that one — and that's normal, not a rejection of you.",
        ],
        ul: [
          "Count everyone who will live with you, including children and partners.",
          "Add up pre-tax (gross) income from every adult in the household.",
          "Include overtime, benefits, and self-employment income — roughly, for now.",
        ],
      },
      {
        h: "Step 3: Find lotteries you actually qualify for",
        p: [
          "This is the step where most applicants waste time. Listings are grouped by borough, bedrooms, and income band, and hundreds may be open at once. Filter down to your household size and income first, then look at the rest — unit mix, neighborhood, and whether the application deadline is close. NYC Lottery Tracker does this filtering for you the moment listings go live, so you never find a perfect apartment a day after its deadline.",
        ],
      },
      {
        h: "Step 4: Submit before the deadline — and only once",
        p: [
          "You may submit one application per lottery per household. Duplicate applications are removed, so don't try to double your chances; it does the opposite. The application itself is short — it does not yet ask for documents, pay stubs, or proof of anything. You only need honest numbers and a few minutes.",
        ],
        ul: [
          "Apply on Housing Connect directly — never through a third-party site that charges a fee.",
          "Save a screenshot or the confirmation email as proof of submission.",
          "If you make a mistake, update the same application rather than submitting a new one.",
        ],
      },
      {
        h: "Step 5: Wait, and apply again",
        p: [
          "After the deadline closes, the city randomly orders all the applications — that's the lottery. Depending on the development, winners are notified in a few months. Meanwhile, keep applying: serious applicants treat every open lottery as a ticket, and people who apply consistently for years routinely win on a later try. Save your lotteries in NYC Lottery Tracker and we'll watch the deadlines for you.",
        ],
      },
      {
        h: "The one rule that matters most",
        p: [
          "Be truthful. Everything you write is verified only if you win, and discrepancies discovered at that stage — an undisclosed roommate, rounded-down income, an unreported bonus — can disqualify you after you've already been selected. Accurate now beats painful later.",
        ],
        ul: [
          "This guide is general information, not legal advice. Housing Connect's own instructions control every application — confirm details at housingconnect.nyc.gov before you apply.",
        ],
      },
    ],
  },
  {
    slug: "documents-you-need",
    title: "What documents you need for a NYC housing lottery",
    description:
      "You don't upload anything when you apply — the paperwork comes if you're selected. Here's the full list, so you can start collecting now instead of panicking later.",
    minutes: 6,
    updated: "October 31, 2026",
    blocks: [
      {
        p: [
          "Here's something that surprises almost every first-time applicant: the housing lottery application itself asks for no documents at all. No pay stubs, no ID scans, nothing. You only submit honest numbers — the paperwork comes later, and only if the lottery selects you. The catch is that when that notice arrives, the clock starts ticking. Applicants who scramble for documents at that moment are the ones who miss their interview windows.",
        ],
      },
      {
        h: "Identity and household documents",
        ul: [
          "Photo ID for every adult in the household (driver's license, non-driver ID, or passport).",
          "Birth certificates for children in the household.",
          "Marriage certificate or proof of a domestic partnership, if applicable.",
          "Custody or guardianship papers, if children listed on the application don't live with you full time.",
        ],
      },
      {
        h: "Income documents — for every working adult",
        ul: [
          "The most recent pay stubs — several in a row, so irregular hours are visible.",
          "The last two years of federal tax returns (signed).",
          "W-2 or 1099 forms for the last two years.",
          "Award letters for any benefits: Social Security, disability, unemployment, child support received, public assistance.",
          "If self-employed: a signed profit-and-loss statement and your most recent Schedule C, since most self-employed people have no pay stubs.",
        ],
      },
      {
        h: "Asset documents",
        ul: [
          "The most recent bank statements for every account — checking, savings, and anything else.",
          "Statements for retirement accounts, stocks, or other investments you hold.",
          "Documentation of any property you own, even outside New York City.",
        ],
      },
      {
        h: "Current housing documents",
        ul: [
          "Your current lease, or a rent receipt if you don't have a written lease.",
          "A letter from your landlord or a utility bill in your name, if your lease is old or informal.",
        ],
      },
      {
        h: "How to prepare without stress",
        p: [
          "You don't need to wait for a winning notice to build your file. Make one folder — a real one and a digital one — and drop each of these in as you get them. Most items you already have; the only habit worth starting today is keeping every pay stub instead of tossing it. Households that apply to several lotteries a year should simply keep the folder stocked and current.",
        ],
      },
      {
        h: "The verification mindset",
        p: [
          "When the management company reviews your file, it is checking one thing: does the paperwork match the numbers on your application? Big gaps — income that grew after you applied, a household member who moved in — are common and explainable, but only if you raise them yourself. Respond honestly, on time, and in writing, and small changes can usually be documented without disqualifying you. What sinks applications is silence, not change.",
        ],
        ul: [
          "Document requests vary by development and by what your application says. Treat this list as the standard kit, and follow exactly whatever the management company's letter asks for.",
        ],
      },
    ],
  },
  {
    slug: "ami-guide",
    title: "How AMI works — and what you can actually afford",
    description:
      "Area Median Income decides which apartments you can apply for. Learn to read an income band in two minutes, and why the 'minimum income' line matters as much as the maximum.",
    minutes: 7,
    updated: "October 31, 2026",
    blocks: [
      {
        p: [
          "Every affordable housing listing in New York City is written in a code: 30% AMI, 60% AMI, 80% AMI, 130% AMI. AMI stands for Area Median Income — the middle of the income ladder for the New York metro area, calculated yearly by the federal government for a household of a given size. When a building sets apartments at 60% AMI, it means those homes are priced for households earning around 60% of that middle line, adjusted up or down for how many people live with you.",
        ],
      },
      {
        h: "Why your household size changes everything",
        p: [
          "The same dollar figure means very different things for different families. A household of one at the metro median earns far less than a household of four at that same median, so every published income band has a column for household size. When a listing says 'households of 2–4 people, $50,000–$95,000,' it means the combined gross income of everyone who will live in the apartment must fall inside that window for your household's size.",
        ],
      },
      {
        h: "The maximum is only half the story",
        p: [
          "Applicants fixate on the income maximum, but the minimum is what actually surprises people. Rents in affordable buildings are set so that housing costs roughly a third of the household's income. If a unit's rent is too high relative to what you earn, the landlord couldn't rent it to you even if you wanted it — that's the minimum income line. The practical lesson: people often qualify for fewer units than they hope because they're under the minimum, and the fix isn't more applications, it's the right band. Smaller or less expensive units, and lower AMI bands, have lower minimums.",
        ],
      },
      {
        h: "Reading a listing like a pro",
        ul: [
          "Find your household size, then your combined gross (pre-tax) income.",
          "Check that your income falls between the minimum and maximum for the units you want.",
          "Look at the AMI percentage to understand who the units are aimed at — lower percentages mean deeply affordable units, higher percentages mean moderate incomes.",
          "Assume the numbers on Housing Connect are the authority. Income limits change every year; this guide explains the system, not this year's dollar figures.",
        ],
      },
      {
        h: "Common misunderstandings, cleared up",
        p: [
          "First: AMI is metro-wide, so it doesn't matter whether you live in the Bronx or Manhattan — the bands are the same citywide for the same household size. Second: students and roommates count differently than families; some listings restrict student households entirely. Third: assets count too — interest, dividends, and withdrawals can add to your effective income when the building verifies you. And fourth: if your income is above every band today, don't write off the system. Marketing and 'workforce' units at higher AMI bands appear constantly, and incomes change; keep watching the new listings.",
        ],
      },
      {
        h: "A faster way to shop",
        p: [
          "Once you understand bands, you can filter every listing in the city down to the ones you could actually win in seconds. That's exactly what NYC Lottery Tracker's household-size filter does — set it once, and everything you see is inside your range, with the deadlines counted down for you.",
        ],
        ul: [
          "AMI figures are recalculated annually by the federal government. For current dollar amounts, always use the income table printed on each Housing Connect listing.",
        ],
      },
    ],
  },
  {
    slug: "lottery-vs-section-8",
    title: "Housing lottery vs. Section 8 vs. other affordable rentals",
    description:
      "Three different systems, three different waits, three different rules. Know which one you're actually applying to before you invest a year of hoping.",
    minutes: 6,
    updated: "October 31, 2026",
    blocks: [
      {
        p: [
          "New Yorkers use 'affordable housing' to mean at least four different programs, and mixing them up leads to wasted years — waiting on a list that isn't moving while a lottery you could have won closed last week. Here's the map.",
        ],
      },
      {
        h: "The housing lottery (Housing Connect)",
        p: [
          "When a developer builds or preserves affordable apartments with city help, the city requires the empty units to be offered through a random public lottery. Listings appear on Housing Connect continuously, applications are free, and every lottery has a deadline. The randomness is real — anyone eligible can win — and the affordability is fixed: each unit stays affordable for decades under a regulatory agreement. This is the only system where you apply for a specific apartment at a specific address, and the one NYC Lottery Tracker watches for you.",
        ],
      },
      {
        h: "Section 8 (Housing Choice Vouchers)",
        p: [
          "A voucher isn't an apartment — it's federal rent assistance you carry to whatever apartment will take it, as long as the rent and unit pass inspection. Vouchers are managed by public housing agencies like NYCHA and NYC HPD, not through Housing Connect. The catch is the wait: waitlists for vouchers in New York City are enormous and open to new applicants only rarely, sometimes after years of being closed. If a voucher list is open, join it — it costs nothing. But don't make it your plan for this year.",
        ],
      },
      {
        h: "Mitchell-Lama",
        p: [
          "A New York State program of middle-income co-ops and rentals built mostly decades ago. Mitchell-Lama developments keep their own waiting lists, and some are genuinely long — decades for the most desirable ones — but the middle-income buildings still churn, and joining a list is free or nearly so. These are separate from Housing Connect lotteries; check each development's list individually.",
        ],
      },
      {
        h: "'No-fee' and rent-stabilized market apartments",
        p: [
          "Separately from any program, regular buildings sometimes advertise 'affordable' rents or concessions. These are market apartments: no lottery, no income band, no city oversight of the rent, and no requirement to house anyone. They can be perfectly good homes — just know that you're apartment-hunting, not lottery-entering, and that no city process protects your spot in line.",
        ],
      },
      {
        h: "Which should you pursue? All of them.",
        ul: [
          "Lottery: apply to every Housing Connect lottery you qualify for — deadlines are the whole game.",
          "Section 8: join any open waitlist immediately; check HPD and NYCHA announcements.",
          "Mitchell-Lama: join lists at developments you'd genuinely live in.",
          "Market: keep looking in parallel, so a lottery win is a bonus, not your only path.",
          "Program rules and waitlist status change. Confirm current requirements with the administering agency — HPD, NYCHA, or Homes and Community Renewal — before you rely on them.",
        ],
      },
    ],
  },
  {
    slug: "after-you-win",
    title: "You won the housing lottery — here's what happens next",
    description:
      "Log numbers, interviews, credit checks, and the lease: the full journey from winning notice to keys, and the honest answer about what can still disqualify you.",
    minutes: 6,
    updated: "October 31, 2026",
    blocks: [
      {
        p: [
          "Winning a housing lottery feels like the finish line, but it's better understood as the start of a longer sprint. After Housing Connect's random draw, every applicant gets a place in line — a log number — and only the top of that line is contacted first. Here's what the coming months actually look like.",
        ],
      },
      {
        h: "The log number, translated",
        p: [
          "Log numbers usually group applicants by bedroom size and preference categories, so 'log 47' doesn't mean 46 households are ahead of you in every lane — it means 46 in your group and preference tier. Some preferences are legally built in: people displaced by city action, municipal employees, and residents of the community district or borough, depending on the development. A higher log number is not a rejection; buildings process far down their lists as people ahead decline or fail verification.",
        ],
      },
      {
        h: "The eligibility interview",
        ul: [
          "You'll be invited to an interview with a window to respond — respond immediately, even if your documents aren't ready yet.",
          "Bring the full kit: IDs, income proof for every working adult, bank statements, your lease. (See our document checklist guide.)",
          "The company verifies that your household matches what you applied with: size, income, and address history.",
        ],
      },
      {
        h: "Credit and background checks — the honest version",
        p: [
          "Most management companies run credit and background checks, and this is where won apartments are lost. But the standards at affordable buildings are typically more forgiving than the open market, and what matters most is pattern and honesty: recent evictions, unpaid judgments, and misstatements hurt far more than an imperfect score. If something on your record is explainable — a medical debt, an identity-theft dispute — explain it in writing, with proof, before it's found for you.",
        ],
      },
      {
        h: "From approval to keys",
        ul: [
          "Apartment viewing, usually in small groups by appointment.",
          "Lease signing with the exact household members you listed — no adding people later without approval.",
          "Move-in day, with the rent fixed under the building's affordability agreement.",
        ],
      },
      {
        h: "If you're further down the list",
        p: [
          "Plenty of 'winners' are contacted months after the lottery closes, as people ahead of them move, decline, or go quiet. Keep your file current, keep your phone on, and don't treat the silence as over. The single biggest mistake winners make is becoming unreachable: notices go to your email and mailing address, and skipped notices get skipped households.",
        ],
        ul: [
          "Every development runs its own process under HPD/HDC marketing rules. Your winning notice and the management company's instructions are the authority — this guide is orientation, not a rulebook.",
        ],
      },
    ],
  },
  {
    slug: "rent-freeze",
    title: "Rent freeze programs NYC renters should know (SCRIE & DRIE)",
    description:
      "If you're a senior or a person with a disability in a rent-regulated apartment, your rent increases may be freezable — and applying costs nothing.",
    minutes: 5,
    updated: "October 31, 2026",
    blocks: [
      {
        p: [
          "Most NYC renters have never heard of the city's Rent Freeze Program even though, for the people it's designed for, it's one of the strongest rent protections in the country. The program freezes your rent — you keep paying what you pay today, and lawful increases that would otherwise arrive every year stop coming. The city reimburses the landlord through a property tax credit, so the landlord doesn't lose the increase; it simply never reaches you.",
        ],
      },
      {
        h: "SCRIE — the senior version",
        ul: [
          "For renters age 62 or older who live in a rent-regulated apartment.",
          "Your household income must fall under the program's limit (it changes periodically — check the current figure before applying).",
          "You must live in the apartment as your primary residence, generally for at least the last two years, or have a previous rent-regulated lease.",
          "You must be paying more than roughly a third of your income in rent for the freeze to be worth more than nothing — which most eligible seniors are.",
        ],
      },
      {
        h: "DRIE — for people with disabilities",
        ul: [
          "Same freeze, same idea, for tenants with disabilities between ages 18 and 61.",
          "You'll document the disability through the federal benefit programs the city specifies.",
          "Income limits and residency rules mirror SCRIE's, with the same two-year residency expectation.",
        ],
      },
      {
        h: "Is your apartment covered?",
        p: [
          "The program applies to rent-regulated apartments — rent-stabilized and rent-controlled units, which cover roughly half of New York City's rentals. If your lease says 'rent stabilized,' or your building has six or more units and was built before 1974, there's a good chance you're regulated. Housing lottery apartments are generally not covered by a rent freeze — they're affordable under their own long-term agreements — so this program mainly helps people in the city's older housing stock.",
        ],
      },
      {
        h: "How to apply",
        ul: [
          "Apply through the city's Rent Freeze Program — the official page is nyc.gov/rentfreeze, and it lists income limits, required documents, and walk-in help centers.",
          "There is no application fee. Beware of any 'service' that charges one.",
          "Renewal is required periodically; the city mails renewal notices before benefits lapse.",
        ],
      },
      {
        h: "Why we tell everyone about it",
        p: [
          "Affordable housing isn't only new buildings and lotteries — it's also keeping the home you already have. A frozen rent can be worth more per year than a lottery win, and it takes one application. If you're helping a parent or neighbor who might qualify, sit with them while they apply; the paperwork is manageable and the help centers will walk through it with you.",
        ],
        ul: [
          "Eligibility details, income limits, and benefit amounts change. Confirm everything on nyc.gov/rentfreeze or with the city's helpline (311) before relying on this guide.",
        ],
      },
    ],
  },
  {
    slug: "avoid-scams",
    title: "How to spot a housing-lottery scam",
    description:
      "Real applications are always free. Learn the red flags that mark every fee-charging fake, the WhatsApp 'agent' tricks, and exactly where to report them.",
    minutes: 5,
    updated: "October 31, 2026",
    blocks: [
      {
        p: [
          "Housing scarcity attracts predators. When apartments are this hard to get, someone will always offer to sell you a shortcut — and every one of those shortcuts is a lie. The single most important fact in NYC affordable housing is this: applying for a housing lottery is always free, at every stage, for everyone. Anyone who charges you to apply, to 'hold' an apartment, or to move up a waitlist is taking your money for something the city gives away.",
        ],
      },
      {
        h: "The red flags, in order of how often we hear about them",
        ul: [
          "A fee to apply, or a fee 'to stay in the lottery.' Housing Connect never charges one.",
          "'Guaranteed' placement or a guaranteed apartment. The draw is random; nobody can guarantee a win, which is exactly why nobody can sell one.",
          "An 'agent' or 'consultant' who says they can move you up the list or get you priority. Priority categories are set by law; connections don't exist.",
          "Contact over WhatsApp, Telegram, or text promising apartments 'before they go public.'",
          "Pressure and countdowns: 'pay today or lose the unit.'",
          "A website that looks like Housing Connect but isn't housingconnect.nyc.gov.",
        ],
      },
      {
        h: "Why the scams work — and who they target",
        p: [
          "Scam artists don't target fools; they target tired people. A parent working two jobs who has applied for years is exactly who a 'guaranteed apartment for a fee' pitch is built for. The promise feels plausible because the lottery itself feels opaque — but it isn't. Winners are drawn randomly from complete applications, verified by the management company under city rules, and no middleman exists anywhere in that chain.",
        ],
      },
      {
        h: "The rules of the road",
        ul: [
          "Apply only on housingconnect.nyc.gov. Type it yourself; don't follow links from texts.",
          "Never pay anyone for an application, a spot on a list, or an 'appointment.'",
          "Never share your Housing Connect password — no staff member will ever ask for it.",
          "Be suspicious of anyone who contacts you first. Real notifications come through Housing Connect and the management company — and never demand payment.",
        ],
      },
      {
        h: "If you've been scammed",
        p: [
          "It's not your fault — these operations are professional. Move fast anyway: contact your bank about the payment, report the crime to the NYPD, file a complaint with the New York State Attorney General's office, and call 311 to report housing fraud to the city. Reporting feels pointless; it isn't. Complaints are how these operations get shut down and how other families avoid them.",
        ],
      },
      {
        h: "What we're doing about it",
        p: [
          "NYC Lottery Tracker exists in large part because the scam ecosystem thrives on confusion. We show you every real, open lottery with its real deadline — free — so the 'shortcut' sellers have nothing left to sell you. If a listing or a service ever looks wrong to you, tell us; we'd rather check a hundred false alarms than miss one real predator.",
        ],
      },
    ],
  },
  {
    slug: "homeownership-sales",
    title: "Affordable homeownership: how NYC's 'sales' lotteries work",
    description:
      "Housing Connect isn't just rentals — condos and co-ops go through lotteries too, with different rules: income minimums, pre-approval letters, and resale restrictions.",
    minutes: 6,
    updated: "October 31, 2026",
    blocks: [
      {
        p: [
          "When people hear 'housing lottery' they picture rented apartments, but a meaningful share of Housing Connect listings are homes for sale — newly built condominiums and co-ops sold at below-market prices to first-time and moderate-income buyers. The application is the same familiar free lottery process. Everything after winning, however, looks much more like buying a home than signing a lease, and the differences trip up renters-turned-buyers every year.",
        ],
      },
      {
        h: "Income minimums, not just maximums",
        p: [
          "Rental listings mostly worry about whether you earn too much. Sales listings flip the concern: owning means monthly carrying costs — mortgage, taxes, common charges — that must fit your income, so sales listings set income minimums alongside maximums. You'll need to show not just that you earn enough, but that you can sustain it. If your income sits just above a listing's floor, be honest with yourself about whether the total monthly cost truly fits your budget.",
        ],
      },
      {
        h: "You'll need a mortgage pre-approval",
        ul: [
          "Before or shortly after winning, lenders will want a mortgage pre-approval letter — get one early so you know your real budget.",
          "Down payment and closing costs are real: several percent of the purchase price, saved in advance.",
          "First-time buyer assistance exists — HPD's HomeFirst program offers down-payment help to eligible buyers who complete a free homeowner education class.",
        ],
      },
      {
        h: "Co-op vs. condo, quickly",
        p: [
          "Condos sell you real property; co-ops sell you shares in a corporation plus a proprietary lease. Co-ops (common in affordable programs) usually add a board approval step and their own monthly charges, but they're often the deeper-discount product. Both keep their affordability through resale restrictions, which brings up the rule that defines the whole program.",
        ],
      },
      {
        h: "The resale restriction — read it twice",
        p: [
          "Affordable homes are affordable because their future sale prices are capped: when you sell, you'll typically be limited to your purchase price plus a capped share of the market appreciation. That's the trade. You buy in at a price the market would never offer you, and you sell under rules that keep the home affordable for the next family. For households planning to stay ten years or more, the math is usually strongly favorable — the capped profit is still profit, on a home you could otherwise never have bought. For households planning to move in two years, read the restriction carefully before applying.",
        ],
      },
      {
        h: "How to start",
        ul: [
          "Watch Housing Connect's sales listings the same way you watch rentals — they open and close like every lottery.",
          "Take HPD's free homeowner education class early; it's required for HomeFirst and useful even if you never use the assistance.",
          "Get your credit and savings in shape before you apply, since mortgage approval is the gate that rentals never have.",
          "Sales programs, interest rates, and resale formulas vary by development and change over time. Confirm every number on the Housing Connect listing and with your own lender before you commit.",
        ],
      },
    ],
  },
];

export const guideBySlug = (slug: string | undefined) =>
  GUIDES.find((g) => g.slug === slug);
