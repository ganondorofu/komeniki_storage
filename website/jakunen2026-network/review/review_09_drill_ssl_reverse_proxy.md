---
sidebar_position: 9
---

# 単発ドリル R-09: CA証明書 + nginxリバースProxy

**対象範囲**: CA発行証明書の取得・nginx HTTPS終端・apache2バックエンド
**目安時間**: 20〜30分
**背景**: 第17〜20回で4年連続出題されている構成だが一度も練習していない

---

## トポロジー

```
osv1 (10.200.0.1) ── nginx(HTTPS終端) ──平文── osv2 (192.168.1.1) apache2バックエンド
```

osv1・osv2ともOSインストール直後の状態（既にmaster/sudoは使える）

---

## 要件

1. **証明書の入手**: `http://200.99.1.1/osaka19/`から`server_ca.crt`と`server.key`をosv1へダウンロード（CN/SAN: `sec.osaka-skills.jp`）
2. **osv1にnginx**をインストールし:
   - `https://sec.osaka-skills.jp/`をHTTPS終端で受け、上記証明書・秘密鍵を使う
   - osv2(192.168.1.1:80)へリバースProxy転送（osv1-osv2間は平文）
3. **osv2にapache2**をインストールし、バックエンドとして固定文字列を返す（例: "Back-end Server"）
4. DNS未構築でよい。動作確認は`curl --resolve`か`/etc/hosts`で代用

---

## テストコマンド

| テスト | 期待結果 |
|---|---|
| `curl -k --resolve sec.osaka-skills.jp:443:10.200.0.1 https://sec.osaka-skills.jp/` | osv2の応答文字列が返る |
| `openssl s_client -connect 10.200.0.1:443 -servername sec.osaka-skills.jp`で証明書のCN確認 | `sec.osaka-skills.jp`と一致 |
| osv1からosv2への直接アクセス(`curl http://192.168.1.1/`) | バックエンド応答が直接返る（osv1経由と同じ内容） |
