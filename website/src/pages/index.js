import React from 'react';
import Layout from '@theme/Layout';
import styles from './index.module.css';
import Link from '@docusaurus/Link';

export default function Home() {
  return (
    <Layout
      title="ポートフォリオ"
      description="エンジニアのポートフォリオ兼技術ブログです。"
    >
      <header className="hero hero--primary">
        <div className="container">
          <h1 className="hero__title">komeniki</h1>
          <p className="hero__subtitle">エンジニアになりたかったバイブコーダー</p>
          <div style={{ marginTop: '1.5rem' }}>
            <Link className="button button--secondary button--lg" to="/docs/intro">
              技術記事を見る
            </Link>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <a href="https://github.com/ganondorofu" target="_blank" style={{ marginRight: '1rem' }}>
              GitHub
            </a>
          </div>
        </div>
      </header>
    </Layout>
  );
}
