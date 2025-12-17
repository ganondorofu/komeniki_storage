import {themes as prismThemes} from 'prism-react-renderer';
import dotenv from 'dotenv';
dotenv.config();

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'komeniki blog',
  tagline: '俺の技術ブログ',
  favicon: 'img/favicon.ico',
  url: 'https://ganondorofu.github.io',
  baseUrl: process.env.NODE_ENV === 'production' ? '/komeniki_storage/' : '/',

  organizationName: 'ganondorofu',
  projectName: 'komeniki_storage',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'ja',
    locales: ['ja'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/ganondorofu/komeniki_storage/edit/main/website/docs/',
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/ganondorofu/komeniki_storage/edit/main/website/blog/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],
  plugins: [
      [
        '@docusaurus/plugin-content-docs',
        {
          id: 'stem-new-member-doc',
          path: 'stem-new-member-doc',
          routeBasePath: 'stem-new-member-doc',
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/ganondorofu/komeniki_storage/edit/main/website/',
        },
      ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/docusaurus-social-card.jpg',
      colorMode: {
        defaultMode: 'dark'
      },
      navbar: {
        title: 'komeniki blog',
        logo: {
          alt: 'logo',
          src: 'img/logo.svg',
        },
        items: [
            {
              to: '/docs/intro',
              position: 'left',
              label: '自己紹介',
            },
            {
              to: '/blog',
              label: 'Blog', 
              position: 'left'
            },
            {
              to: '/stem-new-member-doc/intro',
              position: 'left',
              label: 'STEM研究部ドキュメント',
            },
          {
            href: 'https://github.com/ganondorofu',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      // algolia: {
      //   appId: process.env.DOCSEARCH_APP_ID,
      //   apiKey: process.env.DOCSEARCH_API_KEY,
      //   indexName: process.env.DOCSEARCH_INDEX_NAME,
      //   insights: true,
      //   debug: false,
      // },  

      footer: {
        style: 'dark',
        links: [
          {
            title: 'ドキュメント',
            items: [
                {
                  label: '自己紹介',
                  to: '/docs/intro',
                },
                {
                  label: 'STEM研究部ドキュメント',
                  to: '/stem-new-member-doc/intro',
                },
            ],
          },
          {
            title: 'その他',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/ganondorofu',
              },
            ],
          },
        ],
        copyright: ` © ${new Date().getFullYear()} komeniki`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
  customFields: {
    geminiApiKey: process.env.REACT_APP_GEMINI_API_KEY,
    supabaseUrl: process.env.REACT_APP_SUPABASE_URL,
    supabaseAnonKey: process.env.REACT_APP_SUPABASE_ANON_KEY,
  },
  clientModules: [
    require.resolve('./src/clientModules/chatWidget.js'),
  ],
};

export default config;
