# GitHub Copilot Instructions

## Project Overview
このリポジトリは、Docusaurusを使用して構築されたドキュメントサイトです。このドキュメントでは、プロジェクトのセットアップ、開発、デプロイメントに関する手順を説明します。

## Coding Conventions
- 使用言語: JavaScript, markdown
- フレームワーク: React18.0によって記述されたDocusaurus3.0.0
- buildツール: Node.js v20.11.0
- GitHubActionsでビルドしてGitHubPagesにデプロイ

## Copilot Behaviors
Copilot は以下の方針に従って補完してください：

### docusaurus.config.jsの補完
#### 新しくカテゴリを作成した場合、``docusaurus.config.js``にカテゴリを追加してください。
- pluginsの配列に以下の形式でカテゴリの登録を行います
    ```JavaScript
        [
            '@docusaurus/plugin-content-docs',
            {
                id: '新規作成したフォルダ名',
                path: '新規作成したフォルダ名',
                routeBasePath: '新規作成したフォルダ名',
                sidebarPath: require.resolve('./sidebars.js'),
                editUrl: 'https://github.com/ganondorofu/komeniki_storage',
            },
        ],
    ``` 
    
- themeConfigのitems配下に以下の形式でカテゴリの登録を行います
    ```JavaScript
        {
            to: '/新規作成したフォルダ名/intro',
            position: 'left',
            label: 'ここはユーザー決める',
        },
    ```

- footerのlinks配下に以下の形式でカテゴリの登録を行います
    ```JavaScript
        {
            label: '業務用ITソフトウェア',
            to: '/IT_gyoumu/intro',
        },
    ```

### 記事の新規作成テンプレート
#### 記事の新規作成時に以下のテンプレートを使用してください
```markdown
---
sidebar_position: 
description: 
---

## 

```

### docusaurusで使えるmarkdownの記法
- 基本的にはGithGubのmarkdownと同じですが、Docusaurusでは以下の記法も使用できます。
- :::info や :::tip などのコンポーネントを使用して、情報を強調することができます。
- 詳細は[Docusaurusの公式ドキュメント](https://docusaurus.io/docs/markdown-features)を参照してください。