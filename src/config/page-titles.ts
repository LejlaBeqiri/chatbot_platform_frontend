export const PAGE_TITLES = {
    'agents.details': 'page.titles.agent_details',
    'agents': 'page.titles.agents',
    'default': 'page.titles.default'
} as const;

export type PageTitleKey = keyof typeof PAGE_TITLES;
