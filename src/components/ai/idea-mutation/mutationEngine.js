// Lightweight idea mutation generator adapted for the portfolio AI Lab.
// Derived from the standalone Ideamutationlab project but trimmed to avoid extra deps.

const mutationsByTheme = {
  restaurant: (idea) => [
    {
      idea: 'QR menu + instant allergen filter SaaS',
      difficulty: 4,
      monetization: 7,
      competition: 6,
      stack: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
      pricing: ['$29/mo per location', '14-day trial'],
    },
    {
      idea: 'Kitchen waste tracking for sustainability compliance',
      difficulty: 6,
      monetization: 8,
      competition: 3,
      stack: ['React', 'Python', 'MongoDB', 'AWS'],
      pricing: ['$199/mo per location', 'Enterprise custom'],
    },
    {
      idea: 'Staff scheduling AI tuned for labor laws',
      difficulty: 8,
      monetization: 9,
      competition: 7,
      stack: ['React', 'Python', 'PostgreSQL', 'TensorFlow'],
      pricing: ['$15/mo per employee', 'AI add-on $50/mo'],
    },
    {
      idea: 'Kitchen prep computer vision for portion consistency',
      difficulty: 7,
      monetization: 8,
      competition: 4,
      stack: ['React', 'Python', 'PyTorch', 'Edge AI'],
      pricing: ['$299/mo per kitchen', 'Setup fee $1k'],
    },
    {
      idea: 'Supplier scorecard with ingredient price alerts',
      difficulty: 5,
      monetization: 7,
      competition: 5,
      stack: ['React', 'Node.js', 'PostgreSQL', 'Twilio'],
      pricing: ['$99/mo', 'Enterprise custom'],
    },
  ],
  saas: (idea) => [
    {
      idea: 'Micro-SaaS for social thread scheduling',
      difficulty: 3,
      monetization: 6,
      competition: 7,
      stack: ['React', 'Node.js', 'PostgreSQL', 'Twitter API'],
      pricing: ['$9/mo indie', '$29/mo pro'],
    },
    {
      idea: 'No-code webhook testing & debugging',
      difficulty: 5,
      monetization: 7,
      competition: 5,
      stack: ['React', 'Node.js', 'Redis', 'WebSockets'],
      pricing: ['Free 100 reqs', '$19/mo 10k reqs'],
    },
    {
      idea: 'User onboarding flow analytics',
      difficulty: 7,
      monetization: 9,
      competition: 7,
      stack: ['React', 'Python', 'ClickHouse', 'Segment'],
      pricing: ['$199/mo startup', '$799/mo growth'],
    },
    {
      idea: 'Feature flag + changelog as a service',
      difficulty: 4,
      monetization: 6,
      competition: 6,
      stack: ['React', 'Node.js', 'PostgreSQL', 'SendGrid'],
      pricing: ['$15/mo solo', '$79/mo team'],
    },
    {
      idea: 'Compliance-ready audit trail API for SaaS',
      difficulty: 6,
      monetization: 8,
      competition: 5,
      stack: ['React', 'Go', 'ClickHouse', 'S3'],
      pricing: ['$149/mo', 'Usage-based overage'],
    },
  ],
  ecommerce: (idea) => [
    {
      idea: 'Return fraud detection for Shopify',
      difficulty: 7,
      monetization: 9,
      competition: 4,
      stack: ['React', 'Python', 'PostgreSQL', 'Shopify API'],
      pricing: ['$99/mo + % of fraud caught'],
    },
    {
      idea: 'Bundle optimizer based on cart data',
      difficulty: 6,
      monetization: 8,
      competition: 5,
      stack: ['React', 'Python', 'MongoDB', 'Stripe'],
      pricing: ['$79/mo starter', '$299/mo growth'],
    },
    {
      idea: 'Influencer ROI tracking for DTC brands',
      difficulty: 5,
      monetization: 8,
      competition: 6,
      stack: ['React', 'Node.js', 'PostgreSQL', 'Instagram API'],
      pricing: ['$149/mo brand', '$499/mo agency'],
    },
    {
      idea: 'Personalized PDP copy generation per segment',
      difficulty: 5,
      monetization: 7,
      competition: 6,
      stack: ['React', 'Node.js', 'OpenAI API', 'Redis'],
      pricing: ['$49/mo starter', 'Usage-based tokens'],
    },
    {
      idea: 'Checkout risk scoring with 3DS fallback',
      difficulty: 7,
      monetization: 8,
      competition: 5,
      stack: ['React', 'Node.js', 'PostgreSQL', 'Stripe Radar'],
      pricing: ['0.5% of protected GMV', 'Enterprise custom'],
    },
  ],
  productivity: (idea) => [
    {
      idea: 'Meeting notes auto-categorizer by action items',
      difficulty: 6,
      monetization: 7,
      competition: 7,
      stack: ['React', 'Python', 'PostgreSQL', 'OpenAI API'],
      pricing: ['$10/mo per user', 'Team $99/mo'],
    },
    {
      idea: 'Slack thread summarizer for async teams',
      difficulty: 5,
      monetization: 7,
      competition: 5,
      stack: ['React', 'Node.js', 'PostgreSQL', 'Slack API'],
      pricing: ['Free tier limited', '$5/mo per user'],
    },
    {
      idea: 'Time zone scheduler with energy level optimization',
      difficulty: 7,
      monetization: 8,
      competition: 8,
      stack: ['React', 'Node.js', 'PostgreSQL', 'Calendar APIs'],
      pricing: ['$0 individual', '$12/mo per user'],
    },
    {
      idea: 'Inbox triage with intent + priority routing',
      difficulty: 6,
      monetization: 7,
      competition: 6,
      stack: ['React', 'Node.js', 'OpenAI API', 'Supabase'],
      pricing: ['$12/mo per user', 'Enterprise SSO add-on'],
    },
    {
      idea: 'Lightweight OKR tracker with AI status drafting',
      difficulty: 4,
      monetization: 6,
      competition: 5,
      stack: ['React', 'Node.js', 'PostgreSQL', 'tRPC'],
      pricing: ['$9/mo per user', 'Free for 3 users'],
    },
  ],
};

function enrichMutation(mutation, sourceIdea) {
  return {
    ...mutation,
    // provide reasonable defaults so the modal has richer data tied to the user idea
    targetAudience: mutation.targetAudience || `${sourceIdea || 'customers'} who need this most`,
    timeline: mutation.timeline || '4-6 months MVP',
    successMetrics:
      mutation.successMetrics || [
        'Activation rate',
        'Conversion to paid',
        'Churn < 5%',
      ],
    risks:
      mutation.risks || [
        'Go-to-market focus needed',
        'Feature creep risk',
        'Data quality requirements',
      ],
    pricing:
      mutation.pricing || ['Free tier', '$49/mo pro', 'Enterprise custom'],
  };
}

export function generateMutations(rawIdea) {
  const idea = (rawIdea || '').toLowerCase();
  const themed =
    idea.includes('restaurant') || idea.includes('food')
      ? mutationsByTheme.restaurant(rawIdea)
      : idea.includes('ecommerce') || idea.includes('shop') || idea.includes('store') || idea.includes('retail') || idea.includes('bank')
      ? mutationsByTheme.ecommerce(rawIdea)
      : idea.includes('productivity') || idea.includes('meeting') || idea.includes('team')
      ? mutationsByTheme.productivity(rawIdea)
      : idea.includes('saas') || idea.includes('software')
      ? mutationsByTheme.saas(rawIdea)
      : null;
  if (themed) return themed.map((m) => enrichMutation(m, rawIdea));
  // default mixed set (5)
  return [
    {
      idea: 'Niche version targeting freelancers',
      difficulty: 5,
      monetization: 7,
      competition: 6,
      stack: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
      pricing: ['$15/mo solo', '$49/mo pro', 'Annual -20%'],
      targetAudience: 'Solo freelancers, consultants',
    },
    {
      idea: 'Enterprise solution with compliance features',
      difficulty: 8,
      monetization: 10,
      competition: 7,
      stack: ['React', 'Java', 'Oracle', 'Auth0'],
      pricing: ['Custom pricing', 'Minimum $10k/year'],
      targetAudience: 'Enterprise (500+ employees)',
    },
    {
      idea: 'Mobile-first version for on-the-go users',
      difficulty: 6,
      monetization: 7,
      competition: 8,
      stack: ['React Native', 'Firebase', 'Stripe'],
      pricing: ['Freemium', 'Premium $9.99/mo'],
      targetAudience: 'Mobile-first users, Gen Z',
    },
    {
      idea: 'AI-powered analytics add-on',
      difficulty: 7,
      monetization: 9,
      competition: 5,
      stack: ['React', 'Python', 'TensorFlow', 'PostgreSQL'],
      pricing: ['$99/mo add-on', '$499/mo enterprise'],
      targetAudience: 'Data-driven teams',
    },
    {
      idea: 'White-label solution for agencies',
      difficulty: 6,
      monetization: 8,
      competition: 4,
      stack: ['React', 'Node.js', 'MongoDB', 'Multi-tenancy'],
      pricing: ['$299/mo base', '$49/mo per client'],
      targetAudience: 'Digital agencies, consultants',
    },
  ].map((m) => enrichMutation(m, rawIdea));
}

export function regenerateSingleMutation(idea, excludeIdeas = []) {
  const all = generateMutations(idea);
  const available = all.filter((m) => !excludeIdeas.includes(m.idea));

  if (!available.length) {
    return {
      idea: 'Alternative niche variation',
      difficulty: Math.floor(Math.random() * 10) + 1,
      monetization: Math.floor(Math.random() * 10) + 1,
      competition: Math.floor(Math.random() * 10) + 1,
      stack: ['React', 'Node.js', 'PostgreSQL'],
      pricing: ['Custom pricing model'],
    };
  }

  return available[0];
}
