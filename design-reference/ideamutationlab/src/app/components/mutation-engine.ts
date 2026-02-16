interface Mutation {
  idea: string;
  difficulty: number;
  monetization: number;
  competition: number;
  stack: string[];
  pricing?: string[];
  risks?: string[];
  timeline?: string;
  targetAudience?: string;
  successMetrics?: string[];
}

const mutations: Record<string, (idea: string) => Mutation[]> = {
  restaurant: (idea: string) => [
    {
      idea: 'QR menu + instant allergen filter SaaS',
      difficulty: 4,
      monetization: 7,
      competition: 6,
      stack: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
      pricing: ['$29/mo per location', 'Free trial 14 days', 'Annual discount 20%'],
      risks: ['Restaurant tech fatigue', 'QR code adoption resistance', 'Allergen data accuracy liability'],
      timeline: '3-4 months MVP',
      targetAudience: 'Mid-size restaurants with 2-10 locations',
      successMetrics: ['Menu scans per day', 'Allergen filter usage rate', 'Customer retention > 80%'],
    },
    {
      idea: 'Kitchen waste tracking for sustainability compliance',
      difficulty: 6,
      monetization: 8,
      competition: 3,
      stack: ['React', 'Python', 'MongoDB', 'AWS'],
      pricing: ['$199/mo per location', 'Enterprise custom pricing', 'Setup fee $500'],
      risks: ['Manual data entry burden', 'Regulatory changes', 'ROI unclear to customers'],
      timeline: '5-6 months MVP',
      targetAudience: 'Enterprise restaurant chains, hotels',
      successMetrics: ['Waste reduction %', 'Compliance reports generated', 'Cost savings tracked'],
    },
    {
      idea: 'Staff scheduling AI optimized for labor laws per state',
      difficulty: 8,
      monetization: 9,
      competition: 7,
      stack: ['React', 'Python', 'PostgreSQL', 'TensorFlow'],
      pricing: ['$15/mo per employee', 'Minimum $150/mo', 'AI optimization +$50/mo'],
      risks: ['Labor law complexity', 'AI accuracy concerns', 'Union pushback'],
      timeline: '8-10 months MVP',
      targetAudience: 'Multi-location restaurants with 50+ employees',
      successMetrics: ['Labor cost reduction %', 'Compliance violations avoided', 'Schedule changes per week'],
    },
    {
      idea: 'Hyper-local restaurant review aggregator for neighborhoods',
      difficulty: 5,
      monetization: 6,
      competition: 8,
      stack: ['React', 'Node.js', 'MongoDB', 'Google Maps API'],
      pricing: ['Freemium model', 'Premium listings $49/mo', 'Promoted reviews $99/mo'],
      risks: ['Yelp/Google dominance', 'Review authenticity', 'Chicken-egg problem'],
      timeline: '4-5 months MVP',
      targetAudience: 'Urban diners, local food enthusiasts',
      successMetrics: ['Monthly active users', 'Reviews per restaurant', 'Time on site'],
    },
    {
      idea: 'Ingredient price forecasting based on supply chain data',
      difficulty: 9,
      monetization: 10,
      competition: 2,
      stack: ['React', 'Python', 'TimescaleDB', 'ML Pipeline'],
      pricing: ['$499/mo starter', '$1,999/mo enterprise', 'Custom data feeds +$500/mo'],
      risks: ['Data acquisition costs', 'Prediction accuracy', 'Market volatility'],
      timeline: '10-12 months MVP',
      targetAudience: 'Restaurant procurement managers, food distributors',
      successMetrics: ['Forecast accuracy %', 'Cost savings realized', 'Data sources integrated'],
    },
  ],
  saas: (idea: string) => [
    {
      idea: 'Micro-SaaS for Twitter thread scheduling',
      difficulty: 3,
      monetization: 6,
      competition: 7,
      stack: ['React', 'Node.js', 'PostgreSQL', 'Twitter API'],
      pricing: ['$9/mo indie', '$29/mo pro', '$99/mo agency'],
      risks: ['Twitter API changes', 'Feature bloat by competitors', 'Market saturation'],
      timeline: '2-3 months MVP',
      targetAudience: 'Content creators, indie hackers, marketers',
      successMetrics: ['Threads scheduled per user', 'Engagement rate improvement', 'MRR growth'],
    },
    {
      idea: 'No-code webhook testing & debugging platform',
      difficulty: 5,
      monetization: 7,
      competition: 5,
      stack: ['React', 'Node.js', 'Redis', 'WebSockets'],
      pricing: ['Free tier 100 requests/mo', '$19/mo 10k requests', 'Enterprise custom'],
      risks: ['Developer tool crowding', 'Low conversion rates', 'Support burden'],
      timeline: '3-4 months MVP',
      targetAudience: 'Developers, API integrators, QA teams',
      successMetrics: ['Webhooks tested per day', 'Issues found per user', 'Upgrade rate to paid'],
    },
    {
      idea: 'API documentation generator from Postman collections',
      difficulty: 4,
      monetization: 8,
      competition: 6,
      stack: ['React', 'Node.js', 'MongoDB', 'Markdown'],
      pricing: ['$0 open source', '$49/mo team', '$199/mo enterprise'],
      risks: ['Postman integration breaking', 'Free alternatives', 'Documentation standards changing'],
      timeline: '3-4 months MVP',
      targetAudience: 'API product teams, developer advocates',
      successMetrics: ['Docs generated per month', 'Team collaboration usage', 'Public docs views'],
    },
    {
      idea: 'User onboarding flow analytics for SaaS companies',
      difficulty: 7,
      monetization: 9,
      competition: 7,
      stack: ['React', 'Python', 'ClickHouse', 'Segment'],
      pricing: ['$199/mo startup', '$799/mo growth', 'Enterprise $2k+/mo'],
      risks: ['Privacy regulations', 'Integration complexity', 'Segment/Amplitude competition'],
      timeline: '6-8 months MVP',
      targetAudience: 'SaaS product managers, growth teams',
      successMetrics: ['Activation rate improvement', 'Drop-off points identified', 'A/B tests run'],
    },
    {
      idea: 'Changelog as a service with customer notifications',
      difficulty: 3,
      monetization: 5,
      competition: 4,
      stack: ['React', 'Node.js', 'PostgreSQL', 'SendGrid'],
      pricing: ['$15/mo solo', '$49/mo team', '$149/mo enterprise'],
      risks: ['Low perceived value', 'Easy to build in-house', 'Notification fatigue'],
      timeline: '2-3 months MVP',
      targetAudience: 'Small SaaS companies, indie products',
      successMetrics: ['Changelogs published', 'Customer open rates', 'Subscriber growth'],
    },
  ],
  ecommerce: (idea: string) => [
    {
      idea: 'Return fraud detection for Shopify stores',
      difficulty: 7,
      monetization: 9,
      competition: 4,
      stack: ['React', 'Python', 'PostgreSQL', 'Shopify API'],
      pricing: ['$99/mo + 2% of fraud caught', '$499/mo enterprise', 'Success-based pricing'],
      risks: ['False positives hurting customers', 'Shopify policy changes', 'Privacy concerns'],
      timeline: '5-6 months MVP',
      targetAudience: 'High-volume DTC brands, Shopify Plus merchants',
      successMetrics: ['Fraud detected $', 'False positive rate < 2%', 'Integration time < 1hr'],
    },
    {
      idea: 'Bundle product optimizer based on cart data',
      difficulty: 6,
      monetization: 8,
      competition: 5,
      stack: ['React', 'Python', 'MongoDB', 'Stripe'],
      pricing: ['$79/mo starter', '$299/mo growth', '1% of bundle revenue share'],
      risks: ['Data quality issues', 'Seasonal variation', 'Discount cannibalization'],
      timeline: '4-5 months MVP',
      targetAudience: 'Ecommerce brands with 100+ SKUs',
      successMetrics: ['AOV increase %', 'Bundle take rate', 'Revenue from bundles'],
    },
    {
      idea: 'Influencer ROI tracking for DTC brands',
      difficulty: 5,
      monetization: 8,
      competition: 6,
      stack: ['React', 'Node.js', 'PostgreSQL', 'Instagram API'],
      pricing: ['$149/mo solo brand', '$499/mo agency', 'Per-influencer add-on $10/mo'],
      risks: ['Attribution accuracy', 'Influencer authenticity', 'Platform API limits'],
      timeline: '4-5 months MVP',
      targetAudience: 'DTC brands, influencer marketing agencies',
      successMetrics: ['Campaigns tracked', 'ROI calculated accuracy', 'Influencer database size'],
    },
    {
      idea: 'SMS cart recovery with personalized discounts',
      difficulty: 4,
      monetization: 7,
      competition: 7,
      stack: ['React', 'Node.js', 'Redis', 'Twilio'],
      pricing: ['$0.05 per SMS', '$49/mo platform fee', 'Enterprise volume discounts'],
      risks: ['SMS fatigue', 'Deliverability issues', 'Discount addiction'],
      timeline: '3-4 months MVP',
      targetAudience: 'Shopify stores with high cart abandonment',
      successMetrics: ['Recovery rate %', 'Revenue recovered', 'Opt-out rate < 5%'],
    },
    {
      idea: 'Product photo background remover API for listings',
      difficulty: 6,
      monetization: 9,
      competition: 8,
      stack: ['React', 'Python', 'S3', 'ML Model'],
      pricing: ['$0.10 per image', '$99/mo 1000 images', 'Enterprise bulk pricing'],
      risks: ['Remove.bg competition', 'Quality inconsistency', 'API cost structure'],
      timeline: '5-6 months MVP',
      targetAudience: 'Ecommerce sellers, marketplace vendors',
      successMetrics: ['Images processed', 'Quality score > 95%', 'API uptime 99.9%'],
    },
  ],
  productivity: (idea: string) => [
    {
      idea: 'Meeting notes auto-categorizer by action items',
      difficulty: 6,
      monetization: 7,
      competition: 7,
      stack: ['React', 'Python', 'PostgreSQL', 'OpenAI API'],
      pricing: ['$10/mo per user', 'Team $99/mo 10 users', 'Enterprise custom'],
      risks: ['Transcription accuracy', 'AI cost scaling', 'Zoom/Teams integration breaks'],
      timeline: '4-5 months MVP',
      targetAudience: 'Remote teams, project managers',
      successMetrics: ['Meetings processed', 'Action items tracked', 'Task completion rate'],
    },
    {
      idea: 'Email signature ROI tracker for marketing teams',
      difficulty: 4,
      monetization: 6,
      competition: 3,
      stack: ['React', 'Node.js', 'MongoDB', 'Gmail API'],
      pricing: ['$49/mo 10 users', '$149/mo 50 users', 'Enterprise $499/mo'],
      risks: ['Low engagement tracking', 'Email client compatibility', 'GDPR compliance'],
      timeline: '3-4 months MVP',
      targetAudience: 'B2B sales and marketing teams',
      successMetrics: ['Click-through rate', 'Conversions attributed', 'Signature views'],
    },
    {
      idea: 'Slack thread summarizer for async teams',
      difficulty: 5,
      monetization: 7,
      competition: 5,
      stack: ['React', 'Node.js', 'PostgreSQL', 'Slack API'],
      pricing: ['Free tier limited', '$5/mo per user', 'Enterprise $999/mo unlimited'],
      risks: ['Slack native features', 'Context loss in summaries', 'Privacy concerns'],
      timeline: '3-4 months MVP',
      targetAudience: 'Remote-first companies, distributed teams',
      successMetrics: ['Threads summarized', 'Time saved per user', 'Summary accuracy rating'],
    },
    {
      idea: 'Time zone meeting scheduler with energy level optimization',
      difficulty: 7,
      monetization: 8,
      competition: 8,
      stack: ['React', 'Node.js', 'PostgreSQL', 'Calendar APIs'],
      pricing: ['$0 individual', '$12/mo per user team', 'Enterprise SSO +$500/mo'],
      risks: ['Calendly dominance', 'Complex preferences', 'Integration maintenance'],
      timeline: '6-7 months MVP',
      targetAudience: 'Global teams, executive assistants',
      successMetrics: ['Meetings scheduled', 'Reschedule rate reduction', 'User satisfaction'],
    },
    {
      idea: 'Document version control for non-technical teams',
      difficulty: 8,
      monetization: 9,
      competition: 6,
      stack: ['React', 'Node.js', 'S3', 'Git'],
      pricing: ['$15/mo per user', '$499/mo team 50 users', 'Storage $0.10/GB'],
      risks: ['Google Docs versioning', 'File type support', 'Merge conflict UX'],
      timeline: '7-8 months MVP',
      targetAudience: 'Creative teams, legal departments',
      successMetrics: ['Documents tracked', 'Versions created', 'Conflicts resolved'],
    },
  ],
};

export function generateMutations(idea: string): Mutation[] {
  const lowerIdea = idea.toLowerCase();
  
  if (lowerIdea.includes('restaurant') || lowerIdea.includes('food') || lowerIdea.includes('dining')) {
    return mutations.restaurant(idea);
  }
  if (lowerIdea.includes('ecommerce') || lowerIdea.includes('e-commerce') || lowerIdea.includes('shop')) {
    return mutations.ecommerce(idea);
  }
  if (lowerIdea.includes('productivity') || lowerIdea.includes('time') || lowerIdea.includes('meeting')) {
    return mutations.productivity(idea);
  }
  if (lowerIdea.includes('saas') || lowerIdea.includes('software')) {
    return mutations.saas(idea);
  }
  
  return [
    {
      idea: 'Niche version targeting freelancers',
      difficulty: 5,
      monetization: 7,
      competition: 6,
      stack: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
      pricing: ['$15/mo solo', '$49/mo pro', 'Annual -20%'],
      risks: ['Freelancer budget constraints', 'Feature creep', 'Market education needed'],
      timeline: '4-5 months MVP',
      targetAudience: 'Solo freelancers, consultants',
      successMetrics: ['Active users', 'Feature adoption rate', 'Churn rate < 5%'],
    },
    {
      idea: 'Enterprise solution with compliance features',
      difficulty: 8,
      monetization: 10,
      competition: 7,
      stack: ['React', 'Java', 'Oracle', 'Auth0'],
      pricing: ['Custom pricing', 'Minimum $10k/year', 'Implementation $20k+'],
      risks: ['Long sales cycles', 'Compliance complexity', 'Support requirements'],
      timeline: '10-12 months MVP',
      targetAudience: 'Enterprise companies 500+ employees',
      successMetrics: ['Contract value', 'Implementation time', 'Enterprise logos'],
    },
    {
      idea: 'Mobile-first version for on-the-go users',
      difficulty: 6,
      monetization: 7,
      competition: 8,
      stack: ['React Native', 'Firebase', 'Stripe'],
      pricing: ['Freemium', 'Premium $9.99/mo', 'In-app purchases'],
      risks: ['App store policies', 'Mobile-only limitation', 'Discovery challenges'],
      timeline: '5-6 months MVP',
      targetAudience: 'Mobile-first demographics, Gen Z',
      successMetrics: ['DAU', 'App store rating', 'Conversion to paid'],
    },
    {
      idea: 'AI-powered analytics add-on',
      difficulty: 7,
      monetization: 9,
      competition: 5,
      stack: ['React', 'Python', 'TensorFlow', 'PostgreSQL'],
      pricing: ['$99/mo add-on', 'Enterprise $499/mo', 'Usage-based pricing'],
      risks: ['AI accuracy expectations', 'Compute costs', 'Explanation requirements'],
      timeline: '6-8 months MVP',
      targetAudience: 'Data-driven teams, analysts',
      successMetrics: ['Insights generated', 'Decision impact', 'Model accuracy'],
    },
    {
      idea: 'White-label solution for agencies',
      difficulty: 6,
      monetization: 8,
      competition: 4,
      stack: ['React', 'Node.js', 'MongoDB', 'Multi-tenancy'],
      pricing: ['$299/mo base', 'Per-client $49/mo', 'Custom branding $99/mo'],
      risks: ['Agency churn', 'Support burden', 'Feature parity'],
      timeline: '5-6 months MVP',
      targetAudience: 'Digital agencies, consultants',
      successMetrics: ['Agency partners', 'Clients per agency', 'White-label activation'],
    },
  ];
}

export function regenerateSingleMutation(idea: string, excludeIdeas: string[]): Mutation {
  const allMutations = generateMutations(idea);
  const available = allMutations.filter(m => !excludeIdeas.includes(m.idea));
  
  if (available.length === 0) {
    // Generate a new random one if all are used
    return {
      idea: 'Alternative niche variation',
      difficulty: Math.floor(Math.random() * 10) + 1,
      monetization: Math.floor(Math.random() * 10) + 1,
      competition: Math.floor(Math.random() * 10) + 1,
      stack: ['React', 'Node.js', 'PostgreSQL'],
      pricing: ['Custom pricing model'],
      risks: ['Market validation needed', 'Competitive response', 'Technical complexity'],
      timeline: '4-6 months MVP',
      targetAudience: 'Specialized market segment',
      successMetrics: ['User growth', 'Revenue', 'Market share'],
    };
  }
  
  return available[0];
}
